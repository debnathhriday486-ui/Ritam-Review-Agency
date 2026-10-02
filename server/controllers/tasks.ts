import { Response } from 'express';
import { db } from '../../database/db.ts';
import { AuthRequest } from '../middleware/auth.ts';

export async function listTasks(req: AuthRequest, res: Response) {
  try {
    const tasks = db.getAllTasks();
    return res.json({ tasks });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch tasks.' });
  }
}

export async function getTask(req: AuthRequest, res: Response) {
  try {
    const { taskId } = req.params;
    const task = db.getTaskById(taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found.' });
    }
    return res.json({ task });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch task.' });
  }
}

export async function createTask(req: AuthRequest, res: Response) {
  try {
    const {
      name,
      mock_business_name,
      mock_location,
      description,
      total_slots,
      payment_per_completion,
      start_date,
      end_date,
      comments
    } = req.body;

    if (!name || !mock_business_name || !mock_location || !total_slots || !payment_per_completion) {
      return res.status(400).json({ error: 'Please provide all required task fields.' });
    }

    const commentArray = Array.isArray(comments)
      ? comments
      : typeof comments === 'string'
      ? comments.split('\n').filter((c: string) => c.trim())
      : [];

    if (commentArray.length === 0) {
      return res.status(400).json({ error: 'Please provide at least one sample comment for the comment pool.' });
    }

    const adminId = req.auth?.adminId || 'a1000000-0000-0000-0000-000000000001';

    const task = db.createTask({
      name,
      mock_business_name,
      mock_location,
      description: description || 'Educational simulation task',
      total_slots: Number(total_slots),
      payment_per_completion: Number(payment_per_completion),
      start_date: start_date || new Date().toISOString().split('T')[0],
      end_date: end_date || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      comments: commentArray,
      adminId
    });

    return res.status(201).json({ success: true, task });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Failed to create task.' });
  }
}

export async function claimTask(req: AuthRequest, res: Response) {
  try {
    const { taskId } = req.params;
    const userId = req.auth?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Please log in to claim a simulation task.' });
    }

    // Atomic transaction execution inside database mutex
    const claim = await db.claimTaskSlot(taskId, userId);

    return res.json({
      success: true,
      claim,
      message: 'Simulation task claimed successfully! 1 unique sample comment has been assigned to your account.'
    });
  } catch (err: any) {
    // Return explicit error message requested by user
    return res.status(400).json({ error: err.message || 'Failed to claim task slot.' });
  }
}

export async function getMyClaims(req: AuthRequest, res: Response) {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    const claims = db.getUserClaims(userId);
    return res.json({ claims });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch user claims.' });
  }
}

export async function getClaimDetails(req: AuthRequest, res: Response) {
  try {
    const { claimId } = req.params;
    const claim = db.getClaimById(claimId);
    if (!claim) {
      return res.status(404).json({ error: 'Claim record not found.' });
    }
    return res.json({ claim });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch claim details.' });
  }
}

export async function deleteTask(req: AuthRequest, res: Response) {
  try {
    const { taskId } = req.params;
    const adminId = req.auth?.adminId || 'a1000000-0000-0000-0000-000000000001';
    db.deleteTask(taskId, adminId);
    return res.json({
      success: true,
      message: 'Simulation task and mock review link deleted successfully.'
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Failed to delete task.' });
  }
}

export async function completeTaskClaim(req: AuthRequest, res: Response) {
  try {
    const { claimId } = req.params;
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Please log in to complete your task.' });
    }

    const claim = await db.completeTaskClaim(claimId, userId);
    return res.json({
      success: true,
      claim,
      message: 'Task marked as completed! Submitted for verification.'
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Failed to complete task slot.' });
  }
}

export async function completeAndClaimNext(req: AuthRequest, res: Response) {
  try {
    const { taskId } = req.params;
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Please log in to claim task slots.' });
    }

    const result = await db.completeTaskAndClaimNext(taskId, userId);
    return res.json({
      success: true,
      ...result
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Failed to complete task and claim next.' });
  }
}
