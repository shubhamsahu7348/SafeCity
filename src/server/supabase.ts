import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Complaint, TimelineEvent, UserAccount } from '../types';

export const DEFAULT_PROJECT_ID = 'hflpnvixueffwbjbmnzh';
export const DEFAULT_SUPABASE_URL = `https://${DEFAULT_PROJECT_ID}.supabase.co`;
export const DEFAULT_SUPABASE_KEY = 'sb_publishable_b5afTsBmZDP3w-Nl2DEk-w_1q4rZEqp';

/**
 * Robustly normalizes any user-provided Supabase URL or project reference.
 * Handles:
 *  - project ID only (e.g. "hflpnvixueffwbjbmnzh") -> "https://hflpnvixueffwbjbmnzh.supabase.co"
 *  - hostname only (e.g. "hflpnvixueffwbjbmnzh.supabase.co") -> "https://hflpnvixueffwbjbmnzh.supabase.co"
 *  - full URL with or without trailing slash
 *  - quoted strings
 */
export function normalizeSupabaseUrl(raw?: string): string {
  if (!raw || !raw.trim()) {
    return DEFAULT_SUPABASE_URL;
  }
  let url = raw.trim().replace(/^["']|["']$/g, '');

  // If user only provided the project ref ID (e.g. "hflpnvixueffwbjbmnzh" without dots or slashes)
  if (!url.includes('.') && !url.includes('/')) {
    return `https://${url}.supabase.co`;
  }

  // If user provided "hflpnvixueffwbjbmnzh.supabase.co" without protocol
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }

  // Verify valid URL
  try {
    const parsed = new URL(url);
    return parsed.origin;
  } catch {
    return DEFAULT_SUPABASE_URL;
  }
}

export function extractProjectId(url: string): string {
  try {
    const parsed = new URL(url);
    const hostParts = parsed.hostname.split('.');
    if (hostParts.length > 0 && hostParts[0]) {
      return hostParts[0];
    }
  } catch {
    // fallback
  }
  return DEFAULT_PROJECT_ID;
}

export const SUPABASE_URL = normalizeSupabaseUrl(process.env.SUPABASE_URL);
export const SUPABASE_ANON_KEY = (process.env.SUPABASE_ANON_KEY || DEFAULT_SUPABASE_KEY).trim().replace(/^["']|["']$/g, '');
export const SUPABASE_PROJECT_ID = extractProjectId(SUPABASE_URL);

let clientInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!clientInstance) {
    try {
      clientInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
    } catch (err: any) {
      console.warn('⚠️ [Supabase] Client init fallback to default endpoint:', err.message);
      clientInstance = createClient(DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_KEY, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
    }
  }
  return clientInstance;
}

export interface SupabaseHealthStatus {
  connected: boolean;
  projectId: string;
  url: string;
  tableExists: boolean;
  usersTableExists: boolean;
  totalRecords: number;
  totalUsers: number;
  message: string;
  error?: string;
  schemaHelp?: string;
}

/**
 * Checks the connectivity to Supabase and verifies if the `complaints` and `users` tables are ready.
 */
export async function checkSupabaseHealth(): Promise<SupabaseHealthStatus> {
  const client = getSupabaseClient();
  try {
    const { data: complaintsData, error: complaintsError, count: complaintsCount } = await client
      .from('complaints')
      .select('id', { count: 'exact' })
      .limit(1);

    const isMissingComplaintsTable =
      complaintsError &&
      (complaintsError.code === 'PGRST205' ||
        complaintsError.message?.includes('schema cache') ||
        complaintsError.message?.includes('does not exist'));

    // Check users table
    const { data: usersData, error: usersError, count: usersCount } = await client
      .from('users')
      .select('id', { count: 'exact' })
      .limit(1);

    const isMissingUsersTable =
      usersError &&
      (usersError.code === 'PGRST205' ||
        usersError.message?.includes('schema cache') ||
        usersError.message?.includes('does not exist'));

    const tableExists = !isMissingComplaintsTable && !complaintsError;
    const usersTableExists = !isMissingUsersTable && !usersError;

    if (complaintsError || usersError) {
      const errMsgs = [complaintsError?.message, usersError?.message].filter(Boolean).join('; ');
      return {
        connected: true, // Reached Supabase REST API successfully
        projectId: SUPABASE_PROJECT_ID,
        url: SUPABASE_URL,
        tableExists,
        usersTableExists,
        totalRecords: complaintsCount ?? (complaintsData?.length || 0),
        totalUsers: usersCount ?? (usersData?.length || 0),
        message: (isMissingComplaintsTable || isMissingUsersTable)
          ? 'Connected to Supabase project. Required tables (complaints/users) are pending creation. Run the SQL schema script in your Supabase SQL Editor.'
          : `Supabase query note: ${errMsgs}`,
        error: errMsgs || undefined,
        schemaHelp: (isMissingComplaintsTable || isMissingUsersTable)
          ? 'Use the provided supabase-schema.sql to create both tables in your Supabase dashboard.'
          : undefined,
      };
    }

    return {
      connected: true,
      projectId: SUPABASE_PROJECT_ID,
      url: SUPABASE_URL,
      tableExists: true,
      usersTableExists: true,
      totalRecords: complaintsCount ?? (complaintsData?.length || 0),
      totalUsers: usersCount ?? (usersData?.length || 0),
      message: 'Supabase database is connected and ready for storing hazard reports and officer/worker/admin credentials.',
    };
  } catch (err: any) {
    return {
      connected: false,
      projectId: SUPABASE_PROJECT_ID,
      url: SUPABASE_URL,
      tableExists: false,
      usersTableExists: false,
      totalRecords: 0,
      totalUsers: 0,
      message: `Failed to connect to Supabase: ${err.message || String(err)}`,
      error: err.message || String(err),
    };
  }
}

/**
 * Convert a SafeCity Complaint to a Supabase DB row format (supporting snake_case columns)
 */
export function mapComplaintToDbRow(complaint: Complaint) {
  return {
    id: complaint.id,
    title: complaint.title,
    category: complaint.category,
    sub_category: complaint.subCategory,
    severity: complaint.severity,
    is_emergency: Boolean(complaint.isEmergency),
    description: complaint.description || '',
    photo_url: complaint.photoUrl || '',
    video_url: complaint.videoUrl || null,
    photos: Array.isArray(complaint.photos) ? complaint.photos : [],
    videos: Array.isArray(complaint.videos) ? complaint.videos : [],
    latitude: complaint.latitude,
    longitude: complaint.longitude,
    address: complaint.address || '',
    reported_at: complaint.reportedAt,
    updated_at: complaint.updatedAt,
    status: complaint.status,
    assigned_department: complaint.assignedDepartment,
    assigned_worker_id: complaint.assignedWorkerId || null,
    assigned_worker_name: complaint.assignedWorkerName || null,
    timeline: Array.isArray(complaint.timeline) ? complaint.timeline : [],
    before_photo_url: complaint.beforePhotoUrl || null,
    after_photo_url: complaint.afterPhotoUrl || null,
    upvotes: complaint.upvotes ?? 1,
    estimated_resolution_hours: complaint.estimatedResolutionHours || null,
    vehicle_plate_number: complaint.vehiclePlateNumber || null,
    violation_type: complaint.violationType || null,
    fine_amount: complaint.fineAmount || null,
    fine_status: complaint.fineStatus || null,
    challan_number: complaint.challanNumber || null,
  };
}

/**
 * Convert a Supabase DB row back to SafeCity Complaint interface
 */
export function mapDbRowToComplaint(row: any): Complaint {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    subCategory: row.sub_category || row.subCategory || 'General Hazard',
    severity: row.severity,
    isEmergency: Boolean(row.is_emergency ?? row.isEmergency),
    description: row.description || '',
    photoUrl: row.photo_url || row.photoUrl || '',
    videoUrl: row.video_url || row.videoUrl || undefined,
    photos: Array.isArray(row.photos) ? row.photos : row.photo_url ? [row.photo_url] : [],
    videos: Array.isArray(row.videos) ? row.videos : row.video_url ? [row.video_url] : [],
    latitude: typeof row.latitude === 'number' ? row.latitude : parseFloat(row.latitude) || 0,
    longitude: typeof row.longitude === 'number' ? row.longitude : parseFloat(row.longitude) || 0,
    address: row.address || '',
    reportedAt: row.reported_at || row.reportedAt || new Date().toISOString(),
    updatedAt: row.updated_at || row.updatedAt || new Date().toISOString(),
    status: row.status || 'Submitted',
    assignedDepartment: row.assigned_department || row.assignedDepartment,
    assignedWorkerId: row.assigned_worker_id || row.assignedWorkerId,
    assignedWorkerName: row.assigned_worker_name || row.assignedWorkerName,
    timeline: (row.timeline as TimelineEvent[]) || [],
    beforePhotoUrl: row.before_photo_url || row.beforePhotoUrl,
    afterPhotoUrl: row.after_photo_url || row.afterPhotoUrl,
    upvotes: row.upvotes ?? 1,
    estimatedResolutionHours: row.estimated_resolution_hours || row.estimatedResolutionHours,
    vehiclePlateNumber: row.vehicle_plate_number || row.vehiclePlateNumber,
    violationType: row.violation_type || row.violationType,
    fineAmount: row.fine_amount ? Number(row.fine_amount) : undefined,
    fineStatus: row.fine_status || row.fineStatus,
    challanNumber: row.challan_number || row.challanNumber,
  };
}

/**
 * Save a newly submitted public hazard complaint directly to Supabase.
 */
export async function saveComplaintToSupabase(complaint: Complaint): Promise<{
  success: boolean;
  error?: string;
  data?: any;
}> {
  const client = getSupabaseClient();
  const dbRow = mapComplaintToDbRow(complaint);

  try {
    const { data, error } = await client
      .from('complaints')
      .upsert(dbRow, { onConflict: 'id' })
      .select();

    if (error) {
      console.warn(`[Supabase] Note saving complaint ${complaint.id}:`, error.message);
      return { success: false, error: error.message };
    }

    console.log(`[Supabase] Successfully stored public hazard complaint ${complaint.id}`);
    return { success: true, data };
  } catch (err: any) {
    console.warn(`[Supabase] Exception storing complaint ${complaint.id}:`, err?.message || err);
    return { success: false, error: err?.message || String(err) };
  }
}

/**
 * Sync updates to a complaint in Supabase.
 */
export async function updateComplaintInSupabase(
  id: string,
  updates: Partial<Complaint>
): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  const updateData: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  if (updates.status !== undefined) updateData.status = updates.status;
  if (updates.assignedDepartment !== undefined) updateData.assigned_department = updates.assignedDepartment;
  if (updates.assignedWorkerId !== undefined) updateData.assigned_worker_id = updates.assignedWorkerId;
  if (updates.assignedWorkerName !== undefined) updateData.assigned_worker_name = updates.assignedWorkerName;
  if (updates.afterPhotoUrl !== undefined) updateData.after_photo_url = updates.afterPhotoUrl;
  if (updates.timeline !== undefined) updateData.timeline = updates.timeline;
  if (updates.upvotes !== undefined) updateData.upvotes = updates.upvotes;
  if (updates.fineStatus !== undefined) updateData.fine_status = updates.fineStatus;
  if (updates.challanNumber !== undefined) updateData.challan_number = updates.challanNumber;

  try {
    const { error } = await client
      .from('complaints')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.warn(`[Supabase] Update failed for ${id}:`, error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || String(err) };
  }
}

/**
 * Fetch all complaints stored in Supabase.
 */
export async function fetchComplaintsFromSupabase(): Promise<Complaint[]> {
  const client = getSupabaseClient();
  try {
    const { data, error } = await client
      .from('complaints')
      .select('*')
      .order('reported_at', { ascending: false });

    if (error || !data) {
      return [];
    }

    return data.map(mapDbRowToComplaint);
  } catch (err) {
    console.warn('[Supabase] Could not fetch complaints from Supabase:', err);
    return [];
  }
}

// ============================================================================
// Officer, Field Worker & Administrator User Accounts Supabase Integration
// ============================================================================

/**
 * Maps a SafeCity UserAccount to the Supabase `users` database schema.
 */
export function mapUserToDbRow(user: UserAccount): Record<string, any> {
  return {
    id: user.id,
    name: user.name,
    username: user.username.trim().toLowerCase(),
    password: user.password,
    role: user.role,
    department: user.department || null,
    phone: user.phone || null,
    email: user.email || null,
    avatar_url: user.avatarUrl || null,
    worker_id: user.workerId || null,
    joining_date: user.joiningDate || null,
    updated_at: new Date().toISOString(),
  };
}

/**
 * Converts a Supabase `users` DB row back to the SafeCity UserAccount interface.
 */
export function mapDbRowToUser(row: any): UserAccount {
  return {
    id: row.id,
    name: row.name,
    username: row.username,
    password: row.password,
    role: row.role as 'admin' | 'officer' | 'worker',
    department: row.department || undefined,
    phone: row.phone || undefined,
    email: row.email || undefined,
    avatarUrl: row.avatar_url || row.avatarUrl || undefined,
    workerId: row.worker_id || row.workerId || undefined,
    joiningDate: row.joining_date || row.joiningDate || undefined,
    createdAt: row.created_at || row.createdAt || undefined,
  };
}

/**
 * Save or update a single officer, field worker, or administrator in Supabase.
 */
export async function saveUserToSupabase(user: UserAccount): Promise<{
  success: boolean;
  error?: string;
  data?: any;
}> {
  const client = getSupabaseClient();
  const dbRow = mapUserToDbRow(user);

  try {
    const { data, error } = await client
      .from('users')
      .upsert(dbRow, { onConflict: 'username' })
      .select();

    if (error) {
      console.warn(`[Supabase] Note saving user "${user.username}":`, error.message);
      return { success: false, error: error.message };
    }

    console.log(`[Supabase] Successfully saved credentials for "${user.username}" (${user.role}) in Supabase`);
    return { success: true, data };
  } catch (err: any) {
    console.warn(`[Supabase] Exception saving user "${user.username}":`, err?.message || err);
    return { success: false, error: err?.message || String(err) };
  }
}

/**
 * Update user details/password in Supabase.
 */
export async function updateUserInSupabase(
  id: string,
  updates: Partial<UserAccount>
): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  const updateData: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.username !== undefined) updateData.username = updates.username.trim().toLowerCase();
  if (updates.password !== undefined) updateData.password = updates.password;
  if (updates.role !== undefined) updateData.role = updates.role;
  if (updates.department !== undefined) updateData.department = updates.department;
  if (updates.phone !== undefined) updateData.phone = updates.phone;
  if (updates.email !== undefined) updateData.email = updates.email;
  if (updates.avatarUrl !== undefined) updateData.avatar_url = updates.avatarUrl;
  if (updates.joiningDate !== undefined) updateData.joining_date = updates.joiningDate;

  try {
    const { error } = await client
      .from('users')
      .update(updateData)
      .or(`id.eq.${id},worker_id.eq.${id}`);

    if (error) {
      console.warn(`[Supabase] User update failed for ${id}:`, error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || String(err) };
  }
}

/**
 * Delete a user from Supabase.
 */
export async function deleteUserFromSupabase(id: string): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  try {
    const { error } = await client
      .from('users')
      .delete()
      .or(`id.eq.${id},worker_id.eq.${id}`);

    if (error) {
      console.warn(`[Supabase] User deletion failed for ${id}:`, error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || String(err) };
  }
}

/**
 * Fetch all users (officers, workers, admins) from Supabase.
 */
export async function fetchUsersFromSupabase(): Promise<UserAccount[]> {
  const client = getSupabaseClient();
  try {
    const { data, error } = await client
      .from('users')
      .select('*')
      .order('created_at', { ascending: true });

    if (error || !data) {
      return [];
    }

    return data.map(mapDbRowToUser);
  } catch (err) {
    console.warn('[Supabase] Could not fetch users from Supabase:', err);
    return [];
  }
}

/**
 * Find a specific user in Supabase by username (and optional password check).
 */
export async function findUserInSupabase(
  username: string,
  password?: string
): Promise<UserAccount | null> {
  const client = getSupabaseClient();
  try {
    let query = client
      .from('users')
      .select('*')
      .ilike('username', username.trim().toLowerCase());

    if (password) {
      query = query.eq('password', password);
    }

    const { data, error } = await query.limit(1);
    if (error || !data || data.length === 0) {
      return null;
    }

    return mapDbRowToUser(data[0]);
  } catch (err) {
    console.warn('[Supabase] Error finding user in Supabase:', err);
    return null;
  }
}

/**
 * Automatically seeds/upserts all initial officer, field worker, and admin accounts into Supabase.
 * Ensures credentials exist in Supabase and can be updated anytime.
 */
export async function seedInitialUsersToSupabase(
  initialUsers: UserAccount[]
): Promise<{ success: boolean; count: number; error?: string }> {
  const client = getSupabaseClient();
  try {
    const rows = initialUsers.map(mapUserToDbRow);
    const { data, error } = await client
      .from('users')
      .upsert(rows, { onConflict: 'username' })
      .select('id, username, role');

    if (error) {
      console.warn('[Supabase] Initial users seed note:', error.message);
      return { success: false, count: 0, error: error.message };
    }

    const count = data?.length || initialUsers.length;
    console.log(`[Supabase] Seeded/verified ${count} officer, field worker, and admin accounts in Supabase.`);
    return { success: true, count };
  } catch (err: any) {
    console.warn('[Supabase] Initial users seed error:', err?.message || err);
    return { success: false, count: 0, error: err?.message || String(err) };
  }
}
