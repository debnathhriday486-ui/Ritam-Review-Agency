import { Response } from 'express';
import { db } from '../../database/db.ts';
import { AuthRequest } from '../middleware/auth.ts';

export async function submitSimulation(req: AuthRequest, res: Response) {
  try {
    const { claim_id, submitted_comment, proof_notes } = req.body;
    const userId = req.auth?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    if (!claim_id || !submitted_comment) {
      return res.status(400).json({ error: 'Claim ID and submitted comment text are required.' });
    }

    const submission = await db.submitSimulation(claim_id, submitted_comment, proof_notes);

    return res.status(201).json({
      success: true,
      submission,
      message: 'Simulation submitted successfully! Internal status: PENDING VERIFICATION.'
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Submission failed.' });
  }
}

export async function listSubmissions(req: AuthRequest, res: Response) {
  try {
    const { status } = req.query;
    const submissions = db.getAllSubmissions(status ? String(status) : undefined);
    return res.json({ submissions });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to list submissions.' });
  }
}

export async function reviewSubmission(req: AuthRequest, res: Response) {
  try {
    const { submissionId } = req.params;
    const { decision, notes } = req.body;

    if (!decision || (decision !== 'VERIFIED' && decision !== 'REJECTED')) {
      return res.status(400).json({ error: 'Decision must be VERIFIED or REJECTED.' });
    }

    const adminId = req.auth?.adminId || 'a1000000-0000-0000-0000-000000000001';
    const updated = await db.verifySubmission(submissionId, decision, notes || '', adminId);

    return res.json({
      success: true,
      submission: updated,
      message: `Submission marked as ${decision}.`
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Verification update failed.' });
  }
}
