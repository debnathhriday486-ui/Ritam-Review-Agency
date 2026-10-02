export type UserStatus = 'active' | 'suspended';
export type TaskStatus = 'active' | 'completed' | 'paused' | 'archived';
export type CommentStatus = 'AVAILABLE' | 'ASSIGNED' | 'COMPLETED';
export type ClaimStatus = 'CLAIMED' | 'SUBMITTED' | 'COMPLETED' | 'CANCELLED';
export type SubmissionStatus = 'PENDING' | 'CHECKING' | 'VERIFIED' | 'NOT_VERIFIED' | 'REJECTED';
export type WithdrawalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type TransactionType = 'CREDIT' | 'WITHDRAWAL' | 'REVERSAL';
export type TransactionStatus = 'COMPLETED' | 'PENDING' | 'FAILED' | 'REVERSED';

export interface User {
  id: string;
  whatsapp_number: string;
  state: string;
  city: string;
  status: UserStatus;
  created_at: string;
  updated_at: string;
  last_login?: string;
}

export interface Admin {
  id: string;
  username: string;
  name: string;
  role: 'superadmin' | 'admin';
  created_at: string;
  last_login?: string;
}

export interface TaskComment {
  id: string;
  task_id: string;
  comment_text: string;
  status: CommentStatus;
  assigned_to_user_id?: string | null;
  assigned_whatsapp?: string | null;
  assigned_at?: string | null;
  completed_at?: string | null;
  created_at: string;
}

export interface Task {
  id: string;
  name: string;
  mock_business_name: string;
  mock_location: string;
  mock_map_link: string;
  description: string;
  total_slots: number;
  claimed_slots: number;
  completed_slots: number;
  payment_per_completion: number;
  start_date: string;
  end_date: string;
  status: TaskStatus;
  created_at: string;
  updated_at: string;
  comments_count?: number;
}

export interface TaskClaim {
  id: string;
  task_id: string;
  user_id: string;
  comment_id: string;
  status: ClaimStatus;
  claimed_at: string;
  completed_at?: string | null;
  // Join fields for user convenience
  task_name?: string;
  mock_business_name?: string;
  payment_per_completion?: number;
  comment_text?: string;
}

export interface SimulatedSubmission {
  id: string;
  claim_id: string;
  task_id: string;
  user_id: string;
  submitted_comment: string;
  proof_notes?: string;
  status: SubmissionStatus;
  submitted_at: string;
  verified_at?: string | null;
  verified_by?: string | null;
  verification_notes?: string | null;
  task_name?: string;
  whatsapp_number?: string;
}

export interface Wallet {
  id: string;
  user_id: string;
  current_balance: number;
  total_earned: number;
  total_withdrawn: number;
  updated_at: string;
}

export interface WalletTransaction {
  id: string;
  wallet_id: string;
  user_id: string;
  task_id?: string | null;
  task_name?: string | null;
  type: TransactionType;
  amount: number;
  balance_after: number;
  description: string;
  status: TransactionStatus;
  created_at: string;
}

export interface WithdrawalRequest {
  id: string;
  user_id: string;
  whatsapp_number: string;
  upi_id: string;
  amount: number;
  status: WithdrawalStatus;
  created_at: string;
  approved_by?: string | null;
  approved_at?: string | null;
  rejected_by?: string | null;
  rejected_at?: string | null;
  rejection_reason?: string | null;
}

export interface AuditLog {
  id: string;
  admin_id: string;
  admin_username?: string;
  action: string;
  target_type: string;
  target_id: string;
  description: string;
  created_at: string;
}

export interface AppNotification {
  id: string;
  user_id?: string | null; // null means global/system
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  read: boolean;
  created_at: string;
}

export interface UserFinancialStats {
  currentBalance: number;
  totalEarned: number;
  totalWithdrawn: number;
  withdrawalCount: number;
  pendingWithdrawals: number;
  approvedWithdrawals: number;
  rejectedWithdrawals: number;
  pendingAmount: number;
}

export interface UserTaskStats {
  totalClaimed: number;
  completed: number;
  pending: number;
  rejected: number;
}

export interface AdminDashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalTasks: number;
  totalSlots: number;
  claimedSlots: number;
  availableSlots: number;
  completedSimulations: number;
  pendingSimulations: number;
  totalWalletCredits: number;
  pendingWithdrawals: number;
  totalWithdrawn: number;
  dailyStats: {
    date: string;
    registrations: number;
    simulations: number;
    walletCredits: number;
    withdrawals: number;
  }[];
}

export const BRAND_CONFIG = {
  name: 'Ritam Review Agency',
  subtitle: 'Educational Review Task Simulator',
  supportWhatsApp: '+918837366829',
  supportPhoneFormatted: '+918837366829',
  whatsappDirectLink: 'https://wa.me/918837366829?text=HELLO%20SIR%20IAM%20COMMING%20FROM%20Ritam%20Review%20Agency%20WEBSITE',
  minWithdrawalAmount: 20,
  disclaimer: 'This is an educational simulation platform only. All map reviews, comments, ratings, and task payments are strictly simulated within this application. It does not interact with Google Maps or execute real banking/UPI transfers.'
};
