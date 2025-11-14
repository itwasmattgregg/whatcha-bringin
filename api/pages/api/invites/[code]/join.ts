import type { NextApiResponse } from 'next';
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
      deletedAt: { $exists: false },
    });

    if (!gathering) {
      return res.status(404).json({ error: 'Gathering not found' });
    }

    // Check if user is already the host
    if (gathering.hostId.toString() === userId) {
      return res
        .status(400)
        .json({ error: 'You are already the host of this gathering' });
    }

    const userObjectId = new ObjectId(userId);

    // Ensure the accepted list exists and include this user
    await db.collection(InviteCollection).updateOne(
      { _id: invite._id },
      {
        $set: {
          status: 'accepted',
          acceptedAt: new Date(),
        },
        $addToSet: {
          acceptedUserIds: userObjectId,
        },
      }
    );

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
