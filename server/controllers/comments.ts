import { Response } from 'express';
import { db } from '../../database/db.ts';
import { AuthRequest } from '../middleware/auth.ts';

export async function listCommentPool(req: AuthRequest, res: Response) {
  try {
    const { taskId, status } = req.query;
    const comments = db.getAllComments(
      taskId ? String(taskId) : undefined,
      status ? String(status) : undefined
    );

    // Enrich with task name for admin display
    const tasks = db.getAllTasks();
    const taskMap = new Map(tasks.map(t => [t.id, t.name]));

    const enriched = comments.map(c => ({
      ...c,
      task_name: taskMap.get(c.task_id) || 'Simulation Task'
    }));

    return res.json({ comments: enriched });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to list comment pool.' });
  }
}

export async function addCommentToPool(req: AuthRequest, res: Response) {
  try {
    const { task_id, comment_text } = req.body;
    if (!task_id || !comment_text || !comment_text.trim()) {
      return res.status(400).json({ error: 'Task ID and comment text are required.' });
    }

    const adminId = req.auth?.adminId || 'a1000000-0000-0000-0000-000000000001';
    const newComment = db.addCommentToTask(task_id, comment_text, adminId);

    return res.status(201).json({
      success: true,
      comment: newComment,
      message: 'Sample comment added to task comment pool.'
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Failed to add comment.' });
  }
}
