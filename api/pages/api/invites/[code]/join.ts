import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb } from '../../../../lib/db';
import { withAuth, AuthenticatedRequest } from '../../../../lib/middleware';
import { GatheringCollection } from '../../../../models/Gathering';
import { InviteCollection } from '../../../../models/Invite';
import { ObjectId } from 'mongodb';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code } = req.query;

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Invalid invite code' });
  }

  try {
    const db = await getDb();
    const userId = req.userId!;

    // Find invite by code
    const invite = await db.collection(InviteCollection).findOne({ code });

    if (!invite) {
      return res.status(404).json({ error: 'Invite code not found' });
    }

    // Check if gathering exists
    const gathering = await db.collection(GatheringCollection).findOne({
      _id: invite.gatheringId,
    });

    if (!gathering) {
      return res.status(404).json({ error: 'Gathering not found' });
    }

    // Check if user is already the host
    if (gathering.hostId.toString() === userId) {
      return res.status(400).json({ error: 'You are already the host of this gathering' });
    }

    // Check if user is already invited (by phone number)
    const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
    if (user && user.phoneNumber && invite.phoneNumber === user.phoneNumber) {
      // User is already invited via phone number, just update status
      await db.collection(InviteCollection).updateOne(
        { _id: invite._id },
        { $set: { status: 'accepted' } }
      );
    } else {
      // Create a new invite record for this user (or update existing)
      await db.collection(InviteCollection).updateOne(
        { gatheringId: invite.gatheringId, code },
        {
          $set: {
            status: 'accepted',
            acceptedAt: new Date(),
          },
        },
        { upsert: false }
      );
    }

    // Return the gathering so user can navigate to it
    return res.status(200).json({
      success: true,
      gathering: {
        _id: gathering._id.toString(),
        name: gathering.name,
        image: gathering.image,
        date: gathering.date,
        time: gathering.time,
        address: gathering.address,
        hostId: gathering.hostId.toString(),
      },
    });
  } catch (error) {
    console.error('Error joining gathering:', error);
    return res.status(500).json({ error: 'Failed to join gathering' });
  }
}

export default withAuth(handler);

