import { Response } from 'express';
import { db } from '../../database/db.ts';
import { AuthRequest } from '../middleware/auth.ts';

export async function getMyWallet(req: AuthRequest, res: Response) {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    const wallet = db.getUserWallet(userId);
    const transactions = db.getUserTransactions(userId);
    const stats = db.getUserFinancialStats(userId);

    return res.json({
      wallet,
      transactions,
      stats
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch wallet.' });
  }
}

export async function listAllTransactions(req: AuthRequest, res: Response) {
  try {
    const transactions = db.getAllTransactions();
    return res.json({ transactions });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to list transactions.' });
  }
}
