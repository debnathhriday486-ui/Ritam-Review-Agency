import express from 'express';
import {
  sendOtp,
  verifyOtpOnly,
  register,
  login,
  loginWithOtp,
  adminLogin,
  forgotPassword,
  getMe
} from './controllers/auth.ts';
import {
  listTasks,
  getTask,
  createTask,
  deleteTask,
  claimTask,
  getMyClaims,
  getClaimDetails,
  completeTaskClaim,
  completeAndClaimNext
} from './controllers/tasks.ts';
import {
  listCommentPool,
  addCommentToPool
} from './controllers/comments.ts';
import {
  submitSimulation,
  listSubmissions,
  reviewSubmission
} from './controllers/submissions.ts';
import {
  getMyWallet,
  listAllTransactions
} from './controllers/wallet.ts';
import {
  sendWithdrawalOtp,
  requestWithdrawal,
  getMyWithdrawals,
  listAllWithdrawals,
  approveWithdrawal,
  rejectWithdrawal
} from './controllers/withdrawals.ts';
import {
  getDashboardStats,
  listUsers,
  getUserProfile,
  toggleUserStatus,
  adminResetPassword,
  getAuditLogs,
  getNotifications,
  markNotificationRead,
  getWhatsappSettings,
  updateWhatsappSettings,
  testSendWhatsappMessage
} from './controllers/admin.ts';
import { generateSampleComment } from './controllers/ai.ts';
import { requireAuth, requireUser, requireAdmin } from './middleware/auth.ts';

export const app = express();

app.use(express.json());

// API Root Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', agency: 'RITAM REVIEW AGENCY', environment: 'educational_simulator' });
});

// Authentication Routes
app.post('/api/auth/send-otp', sendOtp);
app.post('/api/auth/verify-otp', verifyOtpOnly);
app.post('/api/auth/register', register);
app.post('/api/auth/login', login);
app.post('/api/auth/login-otp', loginWithOtp);
app.post('/api/auth/admin-login', adminLogin);
app.post('/api/auth/forgot-password', forgotPassword);
app.get('/api/auth/me', requireAuth, getMe);

// Task & Simulation Routes
app.get('/api/tasks', listTasks);
app.get('/api/tasks/:taskId', getTask);
app.post('/api/tasks', requireAdmin, createTask);
app.delete('/api/tasks/:taskId', requireAdmin, deleteTask);
app.post('/api/tasks/:taskId/claim', requireUser, claimTask);
app.get('/api/user/claims', requireUser, getMyClaims);
app.get('/api/user/claims/:claimId', requireUser, getClaimDetails);
app.post('/api/user/claims/:claimId/complete', requireUser, completeTaskClaim);
app.post('/api/tasks/:taskId/complete-and-claim-next', requireUser, completeAndClaimNext);

// Simulation Submission Routes
app.post('/api/submissions', requireUser, submitSimulation);
app.get('/api/admin/submissions', requireAdmin, listSubmissions);
app.post('/api/admin/submissions/:submissionId/review', requireAdmin, reviewSubmission);

// Comment Pool Routes (Admin)
app.get('/api/admin/comments', requireAdmin, listCommentPool);
app.post('/api/admin/comments', requireAdmin, addCommentToPool);

// Wallet & Ledger Routes
app.get('/api/user/wallet', requireUser, getMyWallet);
app.get('/api/admin/transactions', requireAdmin, listAllTransactions);

// Withdrawal Routes
app.post('/api/withdrawals/send-otp', requireUser, sendWithdrawalOtp);
app.post('/api/withdrawals/request', requireUser, requestWithdrawal);
app.get('/api/user/withdrawals', requireUser, getMyWithdrawals);
app.get('/api/admin/withdrawals', requireAdmin, listAllWithdrawals);
app.post('/api/admin/withdrawals/:withdrawalId/approve', requireAdmin, approveWithdrawal);
app.post('/api/admin/withdrawals/:withdrawalId/reject', requireAdmin, rejectWithdrawal);

// Admin Management & Dashboard Routes
app.get('/api/admin/stats', requireAdmin, getDashboardStats);
app.get('/api/admin/users', requireAdmin, listUsers);
app.get('/api/admin/users/:userId', requireAdmin, getUserProfile);
app.post('/api/admin/users/:userId/status', requireAdmin, toggleUserStatus);
app.post('/api/admin/users/:userId/reset-password', requireAdmin, adminResetPassword);
app.get('/api/admin/audit-logs', requireAdmin, getAuditLogs);
app.get('/api/admin/whatsapp-settings', requireAdmin, getWhatsappSettings);
app.post('/api/admin/whatsapp-settings', requireAdmin, updateWhatsappSettings);
app.post('/api/admin/whatsapp-test', requireAdmin, testSendWhatsappMessage);

// Notifications Routes
app.get('/api/notifications', requireAuth, getNotifications);
app.post('/api/notifications/:notifId/read', requireAuth, markNotificationRead);

// AI Sample Comment Generator
app.post('/api/ai/generate-sample', generateSampleComment);

export default app;
