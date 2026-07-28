export type HazardCategory =
  | 'Road Hazard'
  | 'Electrical Hazard'
  | 'Water Hazard'
  | 'Sanitation Hazard'
  | 'Environmental Hazard'
  | 'Public Safety Hazard';

export type SeverityLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export type ComplaintStatus =
  | 'Submitted'
  | 'Verified'
  | 'Assigned'
  | 'In Progress'
  | 'Work Submitted'
  | 'Resolved'
  | 'Rejected';

export type Department =
  | 'Road Department'
  | 'Electricity Department'
  | 'Water & Sewerage'
  | 'Sanitation & Waste'
  | 'Environmental Protection'
  | 'Public Safety & Infrastructure';

export type UserRole = 'citizen' | 'officer' | 'worker' | 'admin';

export interface UserAccount {
  id: string;
  name: string;
  username: string;
  password: string;
  role: 'admin' | 'officer' | 'worker';
  department?: Department;
  phone?: string;
  email?: string;
  avatarUrl?: string;
  joiningDate?: string;
  workerId?: string;
  createdAt?: string;
}

export interface TimelineEvent {
  id: string;
  status: ComplaintStatus;
  timestamp: string;
  actor: string;
  actorRole: string;
  note: string;
  evidenceUrl?: string;
}

export interface Complaint {
  id: string;
  title: string;
  category: HazardCategory;
  subCategory: string;
  severity: SeverityLevel;
  isEmergency: boolean;
  description: string;
  photoUrl: string;
  videoUrl?: string;
  photos?: string[];
  videos?: string[];
  beforePhotos?: string[];
  beforeVideos?: string[];
  afterPhotos?: string[];
  completionVideos?: string[];
  latitude: number;
  longitude: number;
  address: string;
  reportedAt: string;
  updatedAt: string;
  status: ComplaintStatus;
  assignedDepartment: Department;
  assignedWorkerId?: string;
  assignedWorkerName?: string;
  verifiedByOfficer?: string;
  verificationNotes?: string;
  timeline: TimelineEvent[];
  beforePhotoUrl?: string;
  beforeVideoUrl?: string;
  afterPhotoUrl?: string;
  completionVideoUrl?: string;
  workRemarks?: string;
  aiConfidenceScore?: number;
  aiVerificationResult?: string;
  aiVerificationReason?: string;
  officerReviewNotes?: string;
  officerSatisfaction?: 'Satisfactory' | 'Unsatisfactory';
  reworkReason?: string;
  duplicateOfId?: string;
  upvotes: number;
  estimatedResolutionHours?: number;
}

export interface Worker {
  id: string;
  name: string;
  department: Department;
  phone: string;
  email: string;
  username?: string;
  password?: string;
  avatarUrl: string;
  activeTasksCount: number;
  completedTasksCount: number;
  rating: number;
  status: 'Available' | 'On Task' | 'Offline';
  currentLocation?: {
    latitude: number;
    longitude: number;
  };
}

export interface DepartmentMetric {
  department: Department;
  totalComplaints: number;
  resolvedComplaints: number;
  pendingComplaints: number;
  emergencyCount: number;
  avgResolutionTimeHours: number;
  satisfactionRate: number;
}

export interface AIAnalysisRequest {
  image?: string; // base64 or image URL
  description?: string;
  latitude?: number;
  longitude?: number;
}

export interface AIAnalysisResponse {
  category: HazardCategory;
  subCategory: string;
  severity: SeverityLevel;
  isEmergency: boolean;
  confidenceScore: number;
  suggestedDepartment: Department;
  aiSummary: string;
  safetyAdvice: string;
  estimatedFixHours: number;
}

export interface AIDuplicateCheckResponse {
  isDuplicate: boolean;
  matchedComplaintId?: string;
  similarityScore: number;
  reasoning: string;
}

export interface AIVerificationRequest {
  originalPhotoUrl: string;
  workerAfterPhotoUrl: string;
  hazardType: string;
  workRemarks?: string;
}

export interface AIVerificationResponse {
  confidenceScore: number; // 0-100
  isResolved: boolean;
  verdict: 'Resolved' | 'Needs Review' | 'Incomplete Work';
  analysisNotes: string;
  detectedChanges: string[];
}
