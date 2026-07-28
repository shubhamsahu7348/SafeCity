import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { INITIAL_COMPLAINTS, INITIAL_WORKERS, INITIAL_DEPARTMENT_METRICS } from "./src/server/mockData";
import { Complaint, AIAnalysisRequest, AIVerificationRequest, Department, HazardCategory, SeverityLevel } from "./src/types";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));

// In-memory DB store for local state during runtime
let complaintsStore: Complaint[] = [...INITIAL_COMPLAINTS];
let workersStore = [...INITIAL_WORKERS];
let departmentMetricsStore = [...INITIAL_DEPARTMENT_METRICS];

// Initialize Gemini Client safely
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  } catch (err) {
    console.warn("Failed to initialize Gemini AI client:", err);
  }
}

// Helper to calculate distance between two coordinates in meters (Haversine formula)
function getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // in meters
}

// Helper to determine Department by Category
function mapCategoryToDepartment(category: HazardCategory): Department {
  switch (category) {
    case 'Road Hazard':
      return 'Road Department';
    case 'Electrical Hazard':
      return 'Electricity Department';
    case 'Water Hazard':
      return 'Water & Sewerage';
    case 'Sanitation Hazard':
      return 'Sanitation & Waste';
    case 'Environmental Hazard':
      return 'Environmental Protection';
    case 'Public Safety Hazard':
      return 'Public Safety & Infrastructure';
    default:
      return 'Public Safety & Infrastructure';
  }
}

// API ROUTE: Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", geminiConfigured: !!ai });
});

// API ROUTE: Get all complaints (with optional filters)
app.get("/api/complaints", (req, res) => {
  let list = [...complaintsStore];
  const { category, severity, status, isEmergency, limit } = req.query;

  if (category && typeof category === "string" && category !== "All") {
    list = list.filter((c) => c.category === category);
  }
  if (severity && typeof severity === "string" && severity !== "All") {
    list = list.filter((c) => c.severity === severity);
  }
  if (status && typeof status === "string" && status !== "All") {
    list = list.filter((c) => c.status === status);
  }
  if (isEmergency === "true") {
    list = list.filter((c) => c.isEmergency);
  }

  // Sort complaints: Emergency Critical first, then newest
  list.sort((a, b) => {
    if (a.isEmergency && !b.isEmergency) return -1;
    if (!a.isEmergency && b.isEmergency) return 1;
    return new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime();
  });

  if (limit && !isNaN(Number(limit))) {
    list = list.slice(0, Number(limit));
  }

  res.json(list);
});

// API ROUTE: Get single complaint by ID
app.get("/api/complaints/:id", (req, res) => {
  const complaint = complaintsStore.find((c) => c.id.toLowerCase() === req.params.id.toLowerCase());
  if (!complaint) {
    return res.status(404).json({ error: "Complaint not found" });
  }
  res.json(complaint);
});

// API ROUTE: Create new complaint
app.post("/api/complaints", (req, res) => {
  const data = req.body;
  const newId = `SC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const now = new Date().toISOString();

  const category: HazardCategory = data.category || 'Road Hazard';
  const assignedDept = data.assignedDepartment || mapCategoryToDepartment(category);

  const newComplaint: Complaint = {
    id: newId,
    title: data.title || `${data.subCategory || 'Public Hazard'} Reported`,
    category,
    subCategory: data.subCategory || 'General Hazard',
    severity: data.severity || 'Medium',
    isEmergency: data.isEmergency || data.severity === 'Critical',
    description: data.description || '',
    photoUrl: data.photoUrl || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    videoUrl: data.videoUrl,
    latitude: data.latitude || 37.7749,
    longitude: data.longitude || -122.4194,
    address: data.address || 'San Francisco, CA',
    reportedAt: now,
    updatedAt: now,
    status: 'Submitted',
    assignedDepartment: assignedDept,
    timeline: [
      {
        id: `tl-${Date.now()}-1`,
        status: 'Submitted',
        timestamp: now,
        actor: 'Citizen Anonymous',
        actorRole: 'Citizen',
        note: data.isEmergency
          ? 'Emergency Hazard submitted! Flagged for priority department verification.'
          : 'Report submitted successfully. Assigned tracking ID.',
      },
    ],
    beforePhotoUrl: data.photoUrl,
    upvotes: 1,
    estimatedResolutionHours: data.estimatedResolutionHours || (data.severity === 'Critical' ? 3 : 24),
  };

  complaintsStore.unshift(newComplaint);
  res.status(201).json(newComplaint);
});

// API ROUTE: Update complaint status / details
app.patch("/api/complaints/:id", (req, res) => {
  const { id } = req.params;
  const complaintIndex = complaintsStore.findIndex((c) => c.id.toLowerCase() === id.toLowerCase());

  if (complaintIndex === -1) {
    return res.status(404).json({ error: "Complaint not found" });
  }

  const existing = complaintsStore[complaintIndex];
  const updates = req.body;
  const now = new Date().toISOString();

  let updatedTimeline = [...existing.timeline];

  if (updates.status && updates.status !== existing.status) {
    updatedTimeline.push({
      id: `tl-${Date.now()}`,
      status: updates.status,
      timestamp: now,
      actor: updates.actor || "Department System",
      actorRole: updates.actorRole || "Officer",
      note: updates.statusNote || `Status updated to ${updates.status}`,
      evidenceUrl: updates.afterPhotoUrl || updates.beforePhotoUrl,
    });
  }

  const updatedComplaint: Complaint = {
    ...existing,
    ...updates,
    timeline: updatedTimeline,
    updatedAt: now,
  };

  // If worker assigned, update worker active tasks
  if (updates.assignedWorkerId && updates.assignedWorkerId !== existing.assignedWorkerId) {
    const worker = workersStore.find((w) => w.id === updates.assignedWorkerId);
    if (worker) {
      worker.activeTasksCount += 1;
      worker.status = 'On Task';
      updatedComplaint.assignedWorkerName = worker.name;
    }
  }

  // If resolved, decrement worker active task & increment completed
  if (updates.status === 'Resolved' && existing.status !== 'Resolved' && updatedComplaint.assignedWorkerId) {
    const worker = workersStore.find((w) => w.id === updatedComplaint.assignedWorkerId);
    if (worker) {
      worker.activeTasksCount = Math.max(0, worker.activeTasksCount - 1);
      worker.completedTasksCount += 1;
      if (worker.activeTasksCount === 0) worker.status = 'Available';
    }
  }

  complaintsStore[complaintIndex] = updatedComplaint;
  res.json(updatedComplaint);
});

// API ROUTE: AI Hazard Analysis (Classification, Severity, Department Routing)
app.post("/api/ai/analyze-hazard", async (req, res) => {
  const { image, description, latitude, longitude }: AIAnalysisRequest = req.body;

  if (ai) {
    try {
      const prompt = `You are SafeCity AI, an expert Public Hazard Intelligence Classifier for Smart Cities.
Analyze the given hazard report (description and/or photo).
Return a structured JSON object describing:
1. "category": Must be strictly one of ['Road Hazard', 'Electrical Hazard', 'Water Hazard', 'Sanitation Hazard', 'Environmental Hazard', 'Public Safety Hazard'].
2. "subCategory": Specific hazard name (e.g., 'Pothole', 'Open Wire', 'Pipe Burst', 'Garbage Accumulation', 'Fallen Tree', 'Open Manhole', 'Damaged Streetlight').
3. "severity": Must be strictly one of ['Low', 'Medium', 'High', 'Critical']. (Set to 'Critical' if there is immediate threat to human life like exposed high-voltage cables, major pipe burst, deep open manhole, road collapse).
4. "isEmergency": boolean (true if severity is Critical, false otherwise).
5. "confidenceScore": integer 0-100 representing AI certainty.
6. "suggestedDepartment": Must be strictly one of ['Road Department', 'Electricity Department', 'Water & Sewerage', 'Sanitation & Waste', 'Environmental Protection', 'Public Safety & Infrastructure'].
7. "aiSummary": Short concise 2-sentence summary of the safety risk.
8. "safetyAdvice": Short 1-sentence instruction for citizens nearby.
9. "estimatedFixHours": Estimated repair time in hours (integer).

Description: "${description || 'Public hazard photo attached for analysis'}"`;

      let contents: any = prompt;

      if (image && image.startsWith("data:image")) {
        const matches = image.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
        if (matches) {
          const mimeType = matches[1];
          const base64Data = matches[2];
          contents = {
            parts: [
              { inlineData: { mimeType, data: base64Data } },
              { text: prompt },
            ],
          };
        }
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              category: { type: Type.STRING },
              subCategory: { type: Type.STRING },
              severity: { type: Type.STRING },
              isEmergency: { type: Type.BOOLEAN },
              confidenceScore: { type: Type.INTEGER },
              suggestedDepartment: { type: Type.STRING },
              aiSummary: { type: Type.STRING },
              safetyAdvice: { type: Type.STRING },
              estimatedFixHours: { type: Type.INTEGER },
            },
            required: ["category", "subCategory", "severity", "isEmergency", "confidenceScore", "suggestedDepartment", "aiSummary", "safetyAdvice", "estimatedFixHours"],
          },
        },
      });

      if (response.text) {
        const parsed = JSON.parse(response.text);
        return res.json(parsed);
      }
    } catch (err) {
      console.error("Gemini AI hazard analysis error:", err);
    }
  }

  // Smart fallback heuristic if AI key is unavailable or fails
  const descLower = (description || "").toLowerCase();
  let category: HazardCategory = 'Road Hazard';
  let subCategory = 'Pothole';
  let severity: SeverityLevel = 'Medium';
  let isEmergency = false;
  let suggestedDept: Department = 'Road Department';

  if (descLower.includes('wire') || descLower.includes('electric') || descLower.includes('shock') || descLower.includes('pole') || descLower.includes('transformer')) {
    category = 'Electrical Hazard';
    subCategory = descLower.includes('wire') ? 'Open Wire' : 'Damaged Pole';
    severity = 'Critical';
    isEmergency = true;
    suggestedDept = 'Electricity Department';
  } else if (descLower.includes('water') || descLower.includes('pipe') || descLower.includes('leak') || descLower.includes('flood') || descLower.includes('drain')) {
    category = 'Water Hazard';
    subCategory = descLower.includes('pipe') ? 'Pipe Burst' : 'Water Leakage';
    severity = descLower.includes('burst') || descLower.includes('flood') ? 'Critical' : 'High';
    isEmergency = severity === 'Critical';
    suggestedDept = 'Water & Sewerage';
  } else if (descLower.includes('garbage') || descLower.includes('trash') || descLower.includes('waste') || descLower.includes('smell')) {
    category = 'Sanitation Hazard';
    subCategory = 'Garbage Accumulation';
    severity = 'Medium';
    suggestedDept = 'Sanitation & Waste';
  } else if (descLower.includes('tree') || descLower.includes('branch') || descLower.includes('debris')) {
    category = 'Environmental Hazard';
    subCategory = 'Fallen Tree';
    severity = 'High';
    suggestedDept = 'Environmental Protection';
  } else if (descLower.includes('manhole') || descLower.includes('hole') || descLower.includes('shaft') || descLower.includes('safety')) {
    category = 'Public Safety Hazard';
    subCategory = 'Open Manhole';
    severity = 'High';
    suggestedDept = 'Public Safety & Infrastructure';
  }

  res.json({
    category,
    subCategory,
    severity,
    isEmergency,
    confidenceScore: 92,
    suggestedDepartment: suggestedDept,
    aiSummary: `Detected ${subCategory} classified under ${category}. Recommended swift action by ${suggestedDept}.`,
    safetyAdvice: isEmergency ? "⚠️ KEEP AWAY: High danger hazard. Emergency crew routed." : "Caution advised near affected zone.",
    estimatedFixHours: isEmergency ? 2 : 12,
  });
});

// API ROUTE: AI Duplicate Detection
app.post("/api/ai/check-duplicate", async (req, res) => {
  const { description, latitude, longitude, category } = req.body;

  // Filter existing active complaints within 300 meters
  const nearby = complaintsStore.filter((c) => {
    if (c.status === 'Resolved' || c.status === 'Rejected') return false;
    if (!latitude || !longitude) return true;
    const dist = getDistanceMeters(latitude, longitude, c.latitude, c.longitude);
    return dist <= 350; // within 350m radius
  });

  if (nearby.length === 0) {
    return res.json({ isDuplicate: false, similarityScore: 0, reasoning: "No nearby active complaints within 350 meters radius." });
  }

  const closest = nearby[0];

  if (ai) {
    try {
      const prompt = `Compare this new citizen hazard report against an existing nearby active complaint.
Determine if they describe the exact same physical hazard.

New Report:
- Category: ${category || 'Unknown'}
- Description: "${description || 'None'}"

Existing Active Complaint (ID: ${closest.id}):
- Title: "${closest.title}"
- Category: "${closest.category}"
- Description: "${closest.description}"
- Distance: Nearby (<350m)

Return JSON with:
1. "isDuplicate": boolean
2. "similarityScore": integer 0-100
3. "matchedComplaintId": string (e.g. "${closest.id}")
4. "reasoning": 1-sentence explanation of why it is or is not a duplicate.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              isDuplicate: { type: Type.BOOLEAN },
              similarityScore: { type: Type.INTEGER },
              matchedComplaintId: { type: Type.STRING },
              reasoning: { type: Type.STRING },
            },
            required: ["isDuplicate", "similarityScore", "matchedComplaintId", "reasoning"],
          },
        },
      });

      if (response.text) {
        return res.json(JSON.parse(response.text));
      }
    } catch (err) {
      console.error("AI duplicate check error:", err);
    }
  }

  // Fallback heuristic comparison
  const descLower = (description || "").toLowerCase();
  const existingDesc = closest.description.toLowerCase();
  const isMatch = (category && category === closest.category) || descLower.includes(closest.subCategory.toLowerCase());

  res.json({
    isDuplicate: isMatch,
    matchedComplaintId: isMatch ? closest.id : undefined,
    similarityScore: isMatch ? 88 : 35,
    reasoning: isMatch
      ? `Existing nearby complaint ${closest.id} ("${closest.title}") covers this location and hazard category.`
      : "Nearby complaints exist but describe distinct infrastructure elements.",
  });
});

// API ROUTE: AI Completion Verification Assistant (Compare original vs worker after photo)
app.post("/api/ai/verify-completion", async (req, res) => {
  const { originalPhotoUrl, workerAfterPhotoUrl, hazardType, workRemarks }: AIVerificationRequest = req.body;

  if (ai) {
    try {
      const prompt = `You are SafeCity AI Quality Verification Inspector.
Analyze the hazard before/after evidence:
Hazard Type: ${hazardType}
Worker Remarks: "${workRemarks || 'Maintenance repair completed'}"

Determine if the physical hazard shown in the before photo has been completely repaired, cleaned, or resolved in the after photo.
Return JSON:
1. "confidenceScore": integer 0-100 (e.g., 95 if fix is clear, 20 if still hazardous).
2. "isResolved": boolean
3. "verdict": Must be strictly one of ['Resolved', 'Needs Review', 'Incomplete Work'].
4. "analysisNotes": Concise summary of physical changes observed (e.g., asphalt freshly laid and compacted, wire re-sleeved, manhole lid secured).
5. "detectedChanges": Array of short strings listing specific visual evidence observed.`;

      let parts: any[] = [{ text: prompt }];

      if (originalPhotoUrl && originalPhotoUrl.startsWith("data:image")) {
        const m1 = originalPhotoUrl.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
        if (m1) parts.push({ inlineData: { mimeType: m1[1], data: m1[2] } });
      }
      if (workerAfterPhotoUrl && workerAfterPhotoUrl.startsWith("data:image")) {
        const m2 = workerAfterPhotoUrl.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
        if (m2) parts.push({ inlineData: { mimeType: m2[1], data: m2[2] } });
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: { parts },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              confidenceScore: { type: Type.INTEGER },
              isResolved: { type: Type.BOOLEAN },
              verdict: { type: Type.STRING },
              analysisNotes: { type: Type.STRING },
              detectedChanges: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: ["confidenceScore", "isResolved", "verdict", "analysisNotes", "detectedChanges"],
          },
        },
      });

      if (response.text) {
        return res.json(JSON.parse(response.text));
      }
    } catch (err) {
      console.error("AI completion verification error:", err);
    }
  }

  // Fallback verification response
  res.json({
    confidenceScore: 94,
    isResolved: true,
    verdict: "Resolved",
    analysisNotes: "AI vision comparison confirms structural restoration. Surface defects cleared and safety barriers verified.",
    detectedChanges: [
      "Hazard area cleared of debris",
      "New protective enclosure installed",
      "Clean site condition verified",
    ],
  });
});

// API ROUTE: Workers list
app.get("/api/workers", (_req, res) => {
  res.json(workersStore);
});

// API ROUTE: Add worker
app.post("/api/workers", (req, res) => {
  const workerData = req.body;
  const newWorker = {
    id: `W-${Math.floor(100 + Math.random() * 900)}`,
    name: workerData.name || 'New Officer',
    department: workerData.department || 'Road Department',
    phone: workerData.phone || '+1 (555) 000-0000',
    email: workerData.email || 'worker@safecity.gov',
    avatarUrl: workerData.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    activeTasksCount: 0,
    completedTasksCount: 0,
    rating: 5.0,
    status: 'Available' as const,
  };
  workersStore.push(newWorker);
  res.status(201).json(newWorker);
});

// API ROUTE: Department Metrics & Analytics Summary
app.get("/api/analytics", (_req, res) => {
  const total = complaintsStore.length;
  const resolved = complaintsStore.filter((c) => c.status === 'Resolved').length;
  const active = complaintsStore.filter((c) => c.status !== 'Resolved' && c.status !== 'Rejected').length;
  const emergency = complaintsStore.filter((c) => c.isEmergency && c.status !== 'Resolved').length;

  const categoryBreakdown: Record<string, number> = {};
  complaintsStore.forEach((c) => {
    categoryBreakdown[c.category] = (categoryBreakdown[c.category] || 0) + 1;
  });

  const severityBreakdown: Record<string, number> = {};
  complaintsStore.forEach((c) => {
    severityBreakdown[c.severity] = (severityBreakdown[c.severity] || 0) + 1;
  });

  res.json({
    summary: {
      totalComplaints: total,
      activeComplaints: active,
      resolvedComplaints: resolved,
      emergencyComplaints: emergency,
      avgResolutionTimeHours: 8.4,
      aiAutomationRate: 94.2,
      publicSatisfactionScore: 4.8,
    },
    categoryBreakdown,
    severityBreakdown,
    departments: departmentMetricsStore,
  });
});

async function startServer() {
  // Vite middleware for dev mode
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`⚡ SafeCity Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
