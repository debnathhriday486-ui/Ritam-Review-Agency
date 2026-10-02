import { Response } from 'express';
import { db } from '../../database/db.ts';
import { AuthRequest } from '../middleware/auth.ts';
import { WithdrawalStatus } from '../../shared/types.ts';
import { dispatchWhatsAppOtp } from '../services/whatsapp.ts';

export async function sendWithdrawalOtp(req: AuthRequest, res: Response) {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    const user = db.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const otpResult = db.generateOtp(user.whatsapp_number, 'withdrawal');
    const dispatchResult = await dispatchWhatsAppOtp(user.whatsapp_number, otpResult.code, 'withdrawal');

    return res.json({
      success: true,
      message: `Withdrawal authorization OTP sent to registered WhatsApp +91 ${user.whatsapp_number}.`,
      cooldownSeconds: otpResult.cooldownSeconds,
      mock_otp: otpResult.code,
      delivery_channel: dispatchResult.channel,
      whatsapp_web_url: dispatchResult.whatsapp_web_url,
      delivery_note: dispatchResult.message
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Failed to send withdrawal OTP.' });
  }
}

export async function requestWithdrawal(req: AuthRequest, res: Response) {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    const { upi_id, amount } = req.body;
    if (!upi_id || !amount) {
      return res.status(400).json({ error: 'UPI ID and withdrawal amount are required.' });
    }

    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ error: 'Please enter a valid withdrawal amount.' });
    }

    const request = await db.requestWithdrawal(
      userId,
      String(upi_id),
      numericAmount
    );

    return res.status(201).json({
      success: true,
      withdrawal: request,
      message: 'Withdrawal request registered with status PENDING. Awaiting admin payment recording.'
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Failed to request withdrawal.' });
  }
}

export async function getMyWithdrawals(req: AuthRequest, res: Response) {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    const withdrawals = db.getUserWithdrawals(userId);
    const stats = db.getUserFinancialStats(userId);

    return res.json({
      withdrawals,
      stats: {
        totalWithdrawn: stats.totalWithdrawn,
        withdrawalCount: stats.withdrawalCount,
        approvedCount: stats.approvedWithdrawals,
        rejectedCount: stats.rejectedWithdrawals,
        pendingCount: stats.pendingWithdrawals,
        pendingAmount: stats.pendingAmount
      }
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch withdrawals.' });
  }
}

export async function listAllWithdrawals(req: AuthRequest, res: Response) {
  try {
    const { status, q } = req.query;
    const withdrawals = db.getAllWithdrawals(
      status ? (String(status) as WithdrawalStatus) : undefined,
      q ? String(q) : undefined
    );

    // Calculate aggregated stats across all withdrawals
    let totalPending = 0;
    let totalApproved = 0;
    let totalRejected = 0;
    let pendingCount = 0;

    for (const w of withdrawals) {
      if (w.status === 'PENDING') {
        totalPending += w.amount;
        pendingCount++;
      } else if (w.status === 'APPROVED') {
        totalApproved += w.amount;
      } else if (w.status === 'REJECTED') {
        totalRejected += w.amount;
      }
    }

    return res.json({
      withdrawals,
      summary: {
        totalPending,
        totalApproved,
        totalRejected,
        pendingCount
      }
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to list withdrawals.' });
  }
}

export async function approveWithdrawal(req: AuthRequest, res: Response) {
  try {
    const { withdrawalId } = req.params;
    const adminId = req.auth?.adminId || 'a1000000-0000-0000-0000-000000000001';

    const updated = await db.approveWithdrawal(withdrawalId, adminId);

    return res.json({
      success: true,
      withdrawal: updated,
      message: 'Withdrawal marked as APPROVED. Ledger updated successfully.'
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Failed to approve withdrawal.' });
  }
}

export async function rejectWithdrawal(req: AuthRequest, res: Response) {
  try {
    const { withdrawalId } = req.params;
    const { rejection_reason } = req.body;

    if (!rejection_reason || !rejection_reason.trim()) {
      return res.status(400).json({ error: 'Rejection reason is required.' });
    }

    const adminId = req.auth?.adminId || 'a1000000-0000-0000-0000-000000000001';
    const updated = await db.rejectWithdrawal(withdrawalId, rejection_reason, adminId);

    return res.json({
      success: true,
      withdrawal: updated,
      message: 'Withdrawal REJECTED. Reserved funds restored to user wallet.'
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Failed to reject withdrawal.' });
  }
}
