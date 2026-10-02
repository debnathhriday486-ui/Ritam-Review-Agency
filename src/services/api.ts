import {
  User,
  Admin,
  Task,
  TaskComment,
  TaskClaim,
  SimulatedSubmission,
  Wallet,
  WalletTransaction,
  WithdrawalRequest,
  AuditLog,
  AppNotification,
  UserFinancialStats,
  AdminDashboardStats,
  WithdrawalStatus
} from '../../shared/types.ts';

import { mockApiHandler } from './mockBackend.ts';

const TOKEN_KEY = 'ritam_auth_token';
const ROLE_KEY = 'ritam_auth_role';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string, role: string) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(ROLE_KEY, role);
}

export function clearStoredToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
}

export function getStoredRole(): string | null {
  return localStorage.getItem(ROLE_KEY);
}

const isStaticHost = () =>
  typeof window !== 'undefined' &&
  (window.location.hostname.includes('github.io') ||
   window.location.hostname.includes('surge.sh') ||
   window.location.protocol === 'file:');

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  // If running directly on GitHub Pages without Express backend, use client mock handler
  if (isStaticHost()) {
    try {
      return mockApiHandler(endpoint, options) as T;
    } catch (e: any) {
      throw new Error(e.message || 'Action failed.');
    }
  }

  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(endpoint, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      // If 404 or backend route not implemented, try static handler as fallback
      if (response.status === 404) {
        return mockApiHandler(endpoint, options) as T;
      }
      throw new Error(data.error || `Request failed with status ${response.status}`);
    }

    return data as T;
  } catch (err: any) {
    // If network failure / connection refused on static page
    if (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')) {
      return mockApiHandler(endpoint, options) as T;
    }
    throw err;
  }
}

export const api = {
  // Auth
  sendOtp: (
    whatsapp_number: string,
    purpose: 'registration' | 'password_reset' | 'login' | 'withdrawal' = 'registration'
  ) =>
    request<{
      success: boolean;
      message: string;
      cooldownSeconds: number;
      mock_otp?: string;
      delivery_channel?: string;
      whatsapp_web_url?: string;
      delivery_note?: string;
    }>('/api/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ whatsapp_number, purpose }),
    }),

  verifyOtp: (
    whatsapp_number: string,
    otp_code: string,
    purpose: 'registration' | 'password_reset' | 'login' | 'withdrawal' = 'registration'
  ) =>
    request<{ success: boolean; message: string }>('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ whatsapp_number, otp_code, purpose }),
    }),

  register: (payload: {
    whatsapp_number: string;
    state: string;
    city: string;
    password: string;
    confirm_password: string;
  }) =>
    request<{ success: boolean; user: User; token: string; message: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  login: (whatsapp_number: string, password: string) =>
    request<{ success: boolean; user: User; token: string; message: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ whatsapp_number, password }),
    }),

  loginWithOtp: (whatsapp_number: string, otp_code: string) =>
    request<{ success: boolean; user: User; token: string; message: string }>('/api/auth/login-otp', {
      method: 'POST',
      body: JSON.stringify({ whatsapp_number, otp_code }),
    }),

  adminLogin: (username: string, password: string) =>
    request<{ success: boolean; admin: Admin; token: string; message: string }>('/api/auth/admin-login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  forgotPassword: (payload: {
    whatsapp_number: string;
    new_password: string;
    confirm_password: string;
  }) =>
    request<{ success: boolean; message: string }>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getMe: () =>
    request<{ role: 'user' | 'admin'; user?: User; admin?: Admin }>('/api/auth/me'),

  // Tasks
  getTasks: () =>
    request<{ tasks: Task[] }>('/api/tasks'),

  getTask: (taskId: string) =>
    request<{ task: Task }>('/api/tasks/' + taskId),

  claimTask: (taskId: string) =>
    request<{ success: boolean; claim: TaskClaim & { comment_text: string }; message: string }>(`/api/tasks/${taskId}/claim`, {
      method: 'POST',
    }),

  completeTaskClaim: (claimId: string) =>
    request<{ success: boolean; claim: TaskClaim; message: string }>(`/api/user/claims/${claimId}/complete`, {
      method: 'POST',
    }),

  completeAndClaimNext: (taskId: string) =>
    request<{
      success: boolean;
      completedClaim: TaskClaim;
      nextClaim?: TaskClaim & { comment_text: string };
      allCompleted?: boolean;
      message: string;
    }>(`/api/tasks/${taskId}/complete-and-claim-next`, {
      method: 'POST',
    }),

  getUserClaims: () =>
    request<{ claims: TaskClaim[] }>('/api/user/claims'),

  getClaimDetails: (claimId: string) =>
    request<{ claim: TaskClaim }>('/api/user/claims/' + claimId),

  createTask: (data: {
    name: string;
    mock_business_name: string;
    mock_location: string;
    description: string;
    total_slots: number;
    payment_per_completion: number;
    start_date: string;
    end_date: string;
    comments: string[];
  }) =>
    request<{ success: boolean; task: Task }>('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  deleteTask: (taskId: string) =>
    request<{ success: boolean; message: string }>(`/api/tasks/${taskId}`, {
      method: 'DELETE',
    }),

  // Submissions
  submitSimulation: (data: { claim_id: string; submitted_comment: string; proof_notes?: string }) =>
    request<{ success: boolean; submission: SimulatedSubmission; message: string }>('/api/submissions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getAdminSubmissions: (status?: string) =>
    request<{ submissions: SimulatedSubmission[] }>(`/api/admin/submissions${status ? `?status=${status}` : ''}`),

  reviewSubmission: (submissionId: string, decision: 'VERIFIED' | 'REJECTED', notes: string) =>
    request<{ success: boolean; submission: SimulatedSubmission; message: string }>(`/api/admin/submissions/${submissionId}/review`, {
      method: 'POST',
      body: JSON.stringify({ decision, notes }),
    }),

  // Comments (Admin)
  getCommentPool: (taskId?: string, status?: string) => {
    const params = new URLSearchParams();
    if (taskId) params.append('taskId', taskId);
    if (status) params.append('status', status);
    return request<{ comments: TaskComment[] }>(`/api/admin/comments?${params.toString()}`);
  },

  addCommentToPool: (task_id: string, comment_text: string) =>
    request<{ success: boolean; comment: TaskComment; message: string }>('/api/admin/comments', {
      method: 'POST',
      body: JSON.stringify({ task_id, comment_text }),
    }),

  // Wallet
  getMyWallet: () =>
    request<{ wallet: Wallet; transactions: WalletTransaction[]; stats: UserFinancialStats }>('/api/user/wallet'),

  getAllTransactions: () =>
    request<{ transactions: WalletTransaction[] }>('/api/admin/transactions'),

  // Withdrawals
  sendWithdrawalOtp: () =>
    request<{
      success: boolean;
      message: string;
      cooldownSeconds: number;
      mock_otp?: string;
      delivery_channel?: string;
      whatsapp_web_url?: string;
      delivery_note?: string;
    }>('/api/withdrawals/send-otp', {
      method: 'POST',
    }),

  requestWithdrawal: (upi_id: string, amount: number) =>
    request<{ success: boolean; withdrawal: WithdrawalRequest; message: string }>('/api/withdrawals/request', {
      method: 'POST',
      body: JSON.stringify({ upi_id, amount }),
    }),

  getMyWithdrawals: () =>
    request<{
      withdrawals: WithdrawalRequest[];
      stats: {
        totalWithdrawn: number;
        withdrawalCount: number;
        approvedCount: number;
        rejectedCount: number;
        pendingCount: number;
        pendingAmount: number;
      };
    }>('/api/user/withdrawals'),

  getAdminWithdrawals: (status?: WithdrawalStatus, q?: string) => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (q) params.append('q', q);
    return request<{
      withdrawals: WithdrawalRequest[];
      summary: { totalPending: number; totalApproved: number; totalRejected: number; pendingCount: number };
    }>(`/api/admin/withdrawals?${params.toString()}`);
  },

  approveWithdrawal: (withdrawalId: string) =>
    request<{ success: boolean; withdrawal: WithdrawalRequest; message: string }>(`/api/admin/withdrawals/${withdrawalId}/approve`, {
      method: 'POST',
    }),

  rejectWithdrawal: (withdrawalId: string, rejection_reason: string) =>
    request<{ success: boolean; withdrawal: WithdrawalRequest; message: string }>(`/api/admin/withdrawals/${withdrawalId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ rejection_reason }),
    }),

  // Admin Dashboard & Users
  getAdminStats: () =>
    request<{ stats: AdminDashboardStats }>('/api/admin/stats'),

  getAdminUsers: (q?: string) =>
    request<{ users: (User & { wallet_balance: number; total_earned: number; total_withdrawn: number; withdrawal_count: number; completed_tasks: number })[] }>(
      `/api/admin/users${q ? `?q=${encodeURIComponent(q)}` : ''}`
    ),

  getAdminUserProfile: (userId: string) =>
    request<{
      user: User;
      financial: UserFinancialStats;
      taskStats: { totalClaimed: number; completed: number; pending: number; rejected: number };
      recentClaims: TaskClaim[];
      recentWithdrawals: WithdrawalRequest[];
      recentTransactions: WalletTransaction[];
    }>(`/api/admin/users/${userId}`),

  toggleUserStatus: (userId: string, status: 'active' | 'suspended') =>
    request<{ success: boolean; user: User; message: string }>(`/api/admin/users/${userId}/status`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    }),

  adminResetPassword: (userId: string, new_password: string) =>
    request<{ success: boolean; message: string }>(`/api/admin/users/${userId}/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ new_password }),
    }),

  getAuditLogs: (action?: string, limit?: number) => {
    const params = new URLSearchParams();
    if (action) params.append('action', action);
    if (limit) params.append('limit', String(limit));
    return request<{ logs: AuditLog[] }>(`/api/admin/audit-logs?${params.toString()}`);
  },

  getNotifications: () =>
    request<{ notifications: AppNotification[] }>('/api/notifications'),

  markNotificationRead: (notifId: string) =>
    request<{ success: boolean }>(`/api/notifications/${notifId}/read`, {
      method: 'POST',
    }),

  // AI Sample Generator
  generateSampleComment: (business_name?: string, business_type?: string, context_notes?: string) =>
    request<{
      success: boolean;
      sample_comment: string;
      disclaimer: string;
      business_name: string;
    }>('/api/ai/generate-sample', {
      method: 'POST',
      body: JSON.stringify({ business_name, business_type, context_notes }),
    }),

  // WhatsApp Gateway Admin Controls
  getWhatsappSettings: () =>
    request<{ config: { provider: string; meta_phone_number_id: string; has_token: boolean; webhook_url: string; enabled: boolean } }>('/api/admin/whatsapp-settings'),

  updateWhatsappSettings: (payload: {
    provider?: string;
    meta_token?: string;
    meta_phone_number_id?: string;
    webhook_url?: string;
    enabled?: boolean;
  }) =>
    request<{ success: boolean; config: any; message: string }>('/api/admin/whatsapp-settings', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  testSendWhatsapp: (phone: string) =>
    request<{ success: boolean; result: { sent: boolean; channel: string; message: string; whatsapp_web_url: string } }>('/api/admin/whatsapp-test', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    }),
};
