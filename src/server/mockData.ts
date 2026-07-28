import { Complaint, Worker, DepartmentMetric, UserAccount } from '../types';

export const INITIAL_USERS: UserAccount[] = [
  {
    id: 'U-001',
    name: 'System Admin',
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    email: 'admin@safecity.gov',
    phone: '+1 (555) 000-9900',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'U-101',
    name: 'Officer Sarah Jenkins',
    username: 'officer.jenkins',
    password: 'officer123',
    role: 'officer',
    department: 'Electricity Department',
    email: 's.jenkins@safecity.gov',
    phone: '+1 (555) 011-8822',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'U-102',
    name: 'Officer Robert Chen',
    username: 'officer.chen',
    password: 'officer123',
    role: 'officer',
    department: 'Road Department',
    email: 'r.chen@safecity.gov',
    phone: '+1 (555) 022-7733',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'U-W101',
    name: 'Marcus Vance',
    username: 'marcus.vance',
    password: 'worker123',
    role: 'worker',
    department: 'Electricity Department',
    workerId: 'W-101',
    email: 'm.vance@safecity.gov',
    phone: '+1 (555) 019-2831',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'U-W102',
    name: 'David Miller',
    username: 'david.miller',
    password: 'worker123',
    role: 'worker',
    department: 'Road Department',
    workerId: 'W-102',
    email: 'd.miller@safecity.gov',
    phone: '+1 (555) 023-9911',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'U-W103',
    name: 'Elena Rostova',
    username: 'elena.rostova',
    password: 'worker123',
    role: 'worker',
    department: 'Water & Sewerage',
    workerId: 'W-103',
    email: 'e.rostova@safecity.gov',
    phone: '+1 (555) 088-3412',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'U-W104',
    name: 'Tom Hanks',
    username: 'tom.hanks',
    password: 'worker123',
    role: 'worker',
    department: 'Public Safety & Infrastructure',
    workerId: 'W-104',
    email: 't.hanks@safecity.gov',
    phone: '+1 (555) 091-7788',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'U-W105',
    name: 'Carlos Gomez',
    username: 'carlos.gomez',
    password: 'worker123',
    role: 'worker',
    department: 'Environmental Protection',
    workerId: 'W-105',
    email: 'c.gomez@safecity.gov',
    phone: '+1 (555) 044-6622',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
    createdAt: new Date().toISOString(),
  }
];

export const INITIAL_COMPLAINTS: Complaint[] = [
  {
    id: 'SC-2026-8921',
    title: 'Exposed High Voltage Cable near Oak Elementary',
    category: 'Electrical Hazard',
    subCategory: 'Open Wire',
    severity: 'Critical',
    isEmergency: true,
    description: 'An underground power duct cover collapsed exposing thick live electrical wires on the sidewalk right next to the school crosswalk. Sparking noticed after light rain.',
    photoUrl: 'https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?auto=format&fit=crop&w=800&q=80',
    latitude: 37.774929,
    longitude: -122.419416,
    address: ' corner of 4th St & Mission St, San Francisco, CA',
    reportedAt: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
    updatedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    status: 'In Progress',
    assignedDepartment: 'Electricity Department',
    assignedWorkerId: 'W-101',
    assignedWorkerName: 'Marcus Vance (Grid Tech)',
    verifiedByOfficer: 'Officer Sarah Jenkins',
    verificationNotes: 'Verified onsite via emergency patrol. Cordoned off area with hazard tape.',
    timeline: [
      {
        id: 'tl-1',
        status: 'Submitted',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        actor: 'Citizen Anonymous',
        actorRole: 'Citizen',
        note: 'Report submitted via SafeCity mobile web. GPS confirmed.'
      },
      {
        id: 'tl-2',
        status: 'Verified',
        timestamp: new Date(Date.now() - 3600000 * 1.5).toISOString(),
        actor: 'Officer Sarah Jenkins',
        actorRole: 'Department Officer',
        note: 'Flagged as Emergency Critical. Electricity Dept dispatched.'
      },
      {
        id: 'tl-3',
        status: 'Assigned',
        timestamp: new Date(Date.now() - 3600000 * 1.2).toISOString(),
        actor: 'Officer Sarah Jenkins',
        actorRole: 'Department Officer',
        note: 'Assigned Senior Grid Technician Marcus Vance.'
      },
      {
        id: 'tl-4',
        status: 'In Progress',
        timestamp: new Date(Date.now() - 3600000 * 0.5).toISOString(),
        actor: 'Marcus Vance',
        actorRole: 'Worker',
        note: 'Arrived at site with emergency repair truck. De-energizing line section.'
      }
    ],
    beforePhotoUrl: 'https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?auto=format&fit=crop&w=800&q=80',
    upvotes: 42,
    estimatedResolutionHours: 2
  },
  {
    id: 'SC-2026-8915',
    title: 'Deep Pothole Causing Vehicle Axle Damage',
    category: 'Road Hazard',
    subCategory: 'Pothole',
    severity: 'High',
    isEmergency: false,
    description: 'A 2-foot wide, 6-inch deep pothole has formed in the middle lane of Market Street following heavy rain. Multiple cars hit it today.',
    photoUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    latitude: 37.783318,
    longitude: -122.416777,
    address: '845 Market St, Downtown, San Francisco, CA',
    reportedAt: new Date(Date.now() - 3600000 * 14).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    status: 'Assigned',
    assignedDepartment: 'Road Department',
    assignedWorkerId: 'W-102',
    assignedWorkerName: 'David Miller (Asphalt Crew)',
    verifiedByOfficer: 'Officer Robert Chen',
    verificationNotes: 'High priority road repair scheduled for night crew asphalt patch.',
    timeline: [
      {
        id: 'tl-21',
        status: 'Submitted',
        timestamp: new Date(Date.now() - 3600000 * 14).toISOString(),
        actor: 'Citizen Anonymous',
        actorRole: 'Citizen',
        note: 'Complaint registered with photo.'
      },
      {
        id: 'tl-22',
        status: 'Verified',
        timestamp: new Date(Date.now() - 3600000 * 10).toISOString(),
        actor: 'Officer Robert Chen',
        actorRole: 'Department Officer',
        note: 'Verified pothole severity as High.'
      },
      {
        id: 'tl-23',
        status: 'Assigned',
        timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
        actor: 'Officer Robert Chen',
        actorRole: 'Department Officer',
        note: 'Assigned Asphalt Crew Lead David Miller.'
      }
    ],
    beforePhotoUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    upvotes: 28,
    estimatedResolutionHours: 8
  },
  {
    id: 'SC-2026-8890',
    title: 'Major Water Main Burst & Flooding Sidewalk',
    category: 'Water Hazard',
    subCategory: 'Pipe Burst',
    severity: 'Critical',
    isEmergency: true,
    description: 'Pressurized water gushing from underground line near bus stop. Flooding 100ft of sidewalk and encroaching on shop entrances.',
    photoUrl: 'https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&w=800&q=80',
    latitude: 37.769866,
    longitude: -122.426567,
    address: '16th St & Valencia St, Mission District, SF',
    reportedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    status: 'In Progress',
    assignedDepartment: 'Water & Sewerage',
    assignedWorkerId: 'W-103',
    assignedWorkerName: 'Elena Rostova (Hydro Squad)',
    verifiedByOfficer: 'Officer Sarah Jenkins',
    verificationNotes: 'Main isolation valve shutoff team on site.',
    timeline: [
      {
        id: 'tl-31',
        status: 'Submitted',
        timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
        actor: 'Citizen Anonymous',
        actorRole: 'Citizen',
        note: 'Emergency report logged.'
      },
      {
        id: 'tl-32',
        status: 'Verified',
        timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
        actor: 'Officer Sarah Jenkins',
        actorRole: 'Department Officer',
        note: 'Emergency status confirmed.'
      },
      {
        id: 'tl-33',
        status: 'In Progress',
        timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
        actor: 'Elena Rostova',
        actorRole: 'Worker',
        note: 'Diverting water flow and setting up pump bypass.'
      }
    ],
    upvotes: 56,
    estimatedResolutionHours: 4
  },
  {
    id: 'SC-2026-8812',
    title: 'Uncovered Sewage Manhole in Residential Zone',
    category: 'Public Safety Hazard',
    subCategory: 'Open Manhole',
    severity: 'High',
    isEmergency: false,
    description: 'Cast iron cover is missing completely from deep sewer shaft. Extreme hazard for pedestrians and children at night.',
    photoUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    latitude: 37.752112,
    longitude: -122.418123,
    address: '24th St & Folsom St, San Francisco, CA',
    reportedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    status: 'Resolved',
    assignedDepartment: 'Public Safety & Infrastructure',
    assignedWorkerId: 'W-104',
    assignedWorkerName: 'Tom Hanks (Safety Ops)',
    verifiedByOfficer: 'Officer Robert Chen',
    verificationNotes: 'Verified new lockable steel cover installed. AI verification score 96%.',
    timeline: [
      {
        id: 'tl-41',
        status: 'Submitted',
        timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
        actor: 'Citizen Anonymous',
        actorRole: 'Citizen',
        note: 'Hazard submitted.'
      },
      {
        id: 'tl-42',
        status: 'Verified',
        timestamp: new Date(Date.now() - 3600000 * 20).toISOString(),
        actor: 'Officer Robert Chen',
        actorRole: 'Department Officer',
        note: 'Verified and safety cone placed.'
      },
      {
        id: 'tl-43',
        status: 'Assigned',
        timestamp: new Date(Date.now() - 3600000 * 16).toISOString(),
        actor: 'Officer Robert Chen',
        actorRole: 'Department Officer',
        note: 'Assigned Tom Hanks for heavy metal lid replacement.'
      },
      {
        id: 'tl-44',
        status: 'In Progress',
        timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
        actor: 'Tom Hanks',
        actorRole: 'Worker',
        note: 'Installing heavy duty iron frame.'
      },
      {
        id: 'tl-45',
        status: 'Resolved',
        timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
        actor: 'Tom Hanks',
        actorRole: 'Worker',
        note: 'Cover securely locked in place. Before & after evidence uploaded.'
      }
    ],
    beforePhotoUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    afterPhotoUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
    workRemarks: 'Replaced missing cover with anti-theft heavy duty steel mesh cover and bolted security ring.',
    aiConfidenceScore: 96,
    aiVerificationResult: 'Resolved',
    aiVerificationReason: 'Image analysis confirms complete closure of manhole with flush lockable lid.',
    upvotes: 31,
    estimatedResolutionHours: 6
  },
  {
    id: 'SC-2026-8799',
    title: 'Overflowing Commercial Garbage & Medical Waste Spill',
    category: 'Sanitation Hazard',
    subCategory: 'Garbage',
    severity: 'Medium',
    isEmergency: false,
    description: 'Dumpsters behind medical center overflowing onto public lane. Attracting rodents and foul smell.',
    photoUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80',
    latitude: 37.789123,
    longitude: -122.401234,
    address: 'Post St & Sutter St, SF',
    reportedAt: new Date(Date.now() - 3600000 * 30).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    status: 'Verified',
    assignedDepartment: 'Sanitation & Waste',
    verifiedByOfficer: 'Officer Robert Chen',
    verificationNotes: 'Pending HazMat sanitation vehicle dispatch.',
    timeline: [
      {
        id: 'tl-51',
        status: 'Submitted',
        timestamp: new Date(Date.now() - 3600000 * 30).toISOString(),
        actor: 'Citizen Anonymous',
        actorRole: 'Citizen',
        note: 'Report created.'
      },
      {
        id: 'tl-52',
        status: 'Verified',
        timestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
        actor: 'Officer Robert Chen',
        actorRole: 'Department Officer',
        note: 'Verified for waste collection truck.'
      }
    ],
    upvotes: 14,
    estimatedResolutionHours: 12
  },
  {
    id: 'SC-2026-8750',
    title: 'Fallen Oak Tree Blocking Two Traffic Lanes',
    category: 'Environmental Hazard',
    subCategory: 'Fallen Tree',
    severity: 'High',
    isEmergency: false,
    description: 'Large limb broke off ancient oak tree during storm and crushed parked car fender while blocking vehicular access.',
    photoUrl: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=800&q=80',
    latitude: 37.765432,
    longitude: -122.445678,
    address: 'Fell St & Stanyan St, Golden Gate Park, SF',
    reportedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 20).toISOString(),
    status: 'Resolved',
    assignedDepartment: 'Environmental Protection',
    assignedWorkerId: 'W-105',
    assignedWorkerName: 'Carlos Gomez (Tree Arborist Squad)',
    verifiedByOfficer: 'Officer Sarah Jenkins',
    verificationNotes: 'Chainsaw clearance completed and wood chipped.',
    timeline: [
      {
        id: 'tl-61',
        status: 'Submitted',
        timestamp: new Date(Date.now() - 3600000 * 48).toISOString(),
        actor: 'Citizen Anonymous',
        actorRole: 'Citizen',
        note: 'Submitted with photo.'
      },
      {
        id: 'tl-62',
        status: 'Resolved',
        timestamp: new Date(Date.now() - 3600000 * 20).toISOString(),
        actor: 'Carlos Gomez',
        actorRole: 'Worker',
        note: 'Road cleared and debris removed.'
      }
    ],
    beforePhotoUrl: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=800&q=80',
    afterPhotoUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80',
    workRemarks: 'Chainsaw crew cut log into sections, loaded into timber truck, swept asphalt clean.',
    aiConfidenceScore: 94,
    aiVerificationResult: 'Resolved',
    upvotes: 19,
    estimatedResolutionHours: 5
  },
  {
    id: 'SC-2026-8940',
    title: 'Broken Traffic Streetlight dark at intersection',
    category: 'Electrical Hazard',
    subCategory: 'Damaged Pole',
    severity: 'Medium',
    isEmergency: false,
    description: 'LED street lamp head dangling by wiring after wind gust. Intersection pitch black at night.',
    photoUrl: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=800&q=80',
    latitude: 37.781200,
    longitude: -122.408000,
    address: '5th St & Howard St, SF',
    reportedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    status: 'Submitted',
    assignedDepartment: 'Electricity Department',
    timeline: [
      {
        id: 'tl-71',
        status: 'Submitted',
        timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
        actor: 'Citizen Anonymous',
        actorRole: 'Citizen',
        note: 'Hazard logged. Awaiting officer verification.'
      }
    ],
    upvotes: 8,
    estimatedResolutionHours: 24
  }
];

export const INITIAL_WORKERS: Worker[] = [
  {
    id: 'W-101',
    name: 'Marcus Vance',
    department: 'Electricity Department',
    phone: '+1 (555) 019-2831',
    email: 'm.vance@safecity.gov',
    username: 'marcus.vance',
    password: 'worker123',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    activeTasksCount: 1,
    completedTasksCount: 142,
    rating: 4.9,
    status: 'On Task',
    currentLocation: { latitude: 37.774929, longitude: -122.419416 }
  },
  {
    id: 'W-102',
    name: 'David Miller',
    department: 'Road Department',
    phone: '+1 (555) 023-9911',
    email: 'd.miller@safecity.gov',
    username: 'david.miller',
    password: 'worker123',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    activeTasksCount: 1,
    completedTasksCount: 98,
    rating: 4.8,
    status: 'Available',
    currentLocation: { latitude: 37.783318, longitude: -122.416777 }
  },
  {
    id: 'W-103',
    name: 'Elena Rostova',
    department: 'Water & Sewerage',
    phone: '+1 (555) 088-3412',
    email: 'e.rostova@safecity.gov',
    username: 'elena.rostova',
    password: 'worker123',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    activeTasksCount: 1,
    completedTasksCount: 115,
    rating: 4.95,
    status: 'On Task',
    currentLocation: { latitude: 37.769866, longitude: -122.426567 }
  },
  {
    id: 'W-104',
    name: 'Tom Hanks',
    department: 'Public Safety & Infrastructure',
    phone: '+1 (555) 091-7788',
    email: 't.hanks@safecity.gov',
    username: 'tom.hanks',
    password: 'worker123',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    activeTasksCount: 0,
    completedTasksCount: 210,
    rating: 5.0,
    status: 'Available',
    currentLocation: { latitude: 37.752112, longitude: -122.418123 }
  },
  {
    id: 'W-105',
    name: 'Carlos Gomez',
    department: 'Environmental Protection',
    phone: '+1 (555) 044-6622',
    email: 'c.gomez@safecity.gov',
    username: 'carlos.gomez',
    password: 'worker123',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
    activeTasksCount: 0,
    completedTasksCount: 87,
    rating: 4.7,
    status: 'Available',
    currentLocation: { latitude: 37.765432, longitude: -122.445678 }
  }
];

export const INITIAL_DEPARTMENT_METRICS: DepartmentMetric[] = [
  {
    department: 'Road Department',
    totalComplaints: 342,
    resolvedComplaints: 298,
    pendingComplaints: 44,
    emergencyCount: 3,
    avgResolutionTimeHours: 14.2,
    satisfactionRate: 92
  },
  {
    department: 'Electricity Department',
    totalComplaints: 210,
    resolvedComplaints: 195,
    pendingComplaints: 15,
    emergencyCount: 5,
    avgResolutionTimeHours: 4.8,
    satisfactionRate: 96
  },
  {
    department: 'Water & Sewerage',
    totalComplaints: 185,
    resolvedComplaints: 162,
    pendingComplaints: 23,
    emergencyCount: 4,
    avgResolutionTimeHours: 8.5,
    satisfactionRate: 91
  },
  {
    department: 'Sanitation & Waste',
    totalComplaints: 420,
    resolvedComplaints: 395,
    pendingComplaints: 25,
    emergencyCount: 1,
    avgResolutionTimeHours: 11.0,
    satisfactionRate: 88
  },
  {
    department: 'Environmental Protection',
    totalComplaints: 98,
    resolvedComplaints: 90,
    pendingComplaints: 8,
    emergencyCount: 2,
    avgResolutionTimeHours: 9.3,
    satisfactionRate: 94
  },
  {
    department: 'Public Safety & Infrastructure',
    totalComplaints: 156,
    resolvedComplaints: 148,
    pendingComplaints: 8,
    emergencyCount: 2,
    avgResolutionTimeHours: 6.1,
    satisfactionRate: 97
  }
];
