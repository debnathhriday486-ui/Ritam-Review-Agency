import { Response } from 'express';
import { db } from '../../database/db.ts';
import { AuthRequest } from '../middleware/auth.ts';

export async function getDashboardStats(req: AuthRequest, res: Response) {
  try {
    const stats = db.getAdminDashboardStats();
    return res.json({ stats });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch admin stats.' });
  }
}

export async function listUsers(req: AuthRequest, res: Response) {
  try {
    const { q } = req.query;
    const users = db.getAllUsers(q ? String(q) : undefined);

    // Enrich users with financial and task summaries without exposing passwords
    const enrichedUsers = users.map(u => {
      const fin = db.getUserFinancialStats(u.id);
      const tasks = db.getUserTaskStats(u.id);
      return {
        ...u,
        wallet_balance: fin.currentBalance,
        total_earned: fin.totalEarned,
        total_withdrawn: fin.totalWithdrawn,
        withdrawal_count: fin.withdrawalCount,
        completed_tasks: tasks.completed
      };
    });

    return res.json({ users: enrichedUsers });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to list users.' });
  }
}

export async function getUserProfile(req: AuthRequest, res: Response) {
  try {
    const { userId } = req.params;
    const user = db.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const financial = db.getUserFinancialStats(userId);
    const taskStats = db.getUserTaskStats(userId);
    const claims = db.getUserClaims(userId);
    const withdrawals = db.getUserWithdrawals(userId);
    const transactions = db.getUserTransactions(userId);

    return res.json({
      user,
      financial,
      taskStats,
      recentClaims: claims.slice(0, 5),
      recentWithdrawals: withdrawals.slice(0, 5),
      recentTransactions: transactions.slice(0, 5)
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch user profile.' });
  }
}

export async function toggleUserStatus(req: AuthRequest, res: Response) {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    if (status !== 'active' && status !== 'suspended') {
      return res.status(400).json({ error: 'Status must be active or suspended.' });
    }

    const adminId = req.auth?.adminId || 'a1000000-0000-0000-0000-000000000001';
    const updated = db.updateUserStatus(userId, status, adminId);

    return res.json({
      success: true,
      user: updated,
      message: `User status changed to ${status}.`
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Failed to update user status.' });
  }
}

export async function adminResetPassword(req: AuthRequest, res: Response) {
  try {
    const { userId } = req.params;
    const { new_password } = req.body;

    if (!new_password || String(new_password).length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
    }

    const adminId = req.auth?.adminId || 'a1000000-0000-0000-0000-000000000001';
    db.adminResetUserPassword(userId, String(new_password), adminId);

    return res.json({
      success: true,
      message: 'Password reset successfully for the user.'
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Failed to reset password.' });
  }
}

export async function getAuditLogs(req: AuthRequest, res: Response) {
  try {
    const { action, limit } = req.query;
    const logs = db.getAuditLogs(
      action ? String(action) : undefined,
      limit ? Number(limit) : 50
    );
    return res.json({ logs });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to retrieve audit logs.' });
  }
}

export async function getNotifications(req: AuthRequest, res: Response) {
  try {
    const userId = req.auth?.userId;
    const notifs = db.getUserNotifications(userId);
    return res.json({ notifications: notifs });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to retrieve notifications.' });
  }
}

export async function markNotificationRead(req: AuthRequest, res: Response) {
  try {
    const { notifId } = req.params;
    db.markNotificationAsRead(notifId);
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Failed to mark notification.' });
  }
}

export async function getWhatsappSettings(req: AuthRequest, res: Response) {
  try {
    const config = db.getWhatsappConfig();
    return res.json({ config });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch WhatsApp config.' });
  }
}

export async function updateWhatsappSettings(req: AuthRequest, res: Response) {
  try {
    const { provider, meta_token, meta_phone_number_id, webhook_url, enabled } = req.body;
    const updated = db.updateWhatsappConfig({
      provider,
      meta_token,
      meta_phone_number_id,
      webhook_url,
      enabled
    });
    return res.json({ success: true, config: updated, message: 'WhatsApp Gateway settings saved successfully.' });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Failed to update WhatsApp settings.' });
  }
}

export async function testSendWhatsappMessage(req: AuthRequest, res: Response) {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ error: 'Phone number is required for test dispatch.' });
    const { dispatchWhatsAppOtp } = await import('../services/whatsapp.ts');
    const result = await dispatchWhatsAppOtp(phone, '123456', 'login');
    return res.json({ success: true, result });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Test dispatch failed.' });
  }
}
