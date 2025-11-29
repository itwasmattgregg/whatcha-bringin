import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb } from '../../../lib/db';
import { withAuth, AuthenticatedRequest } from '../../../lib/middleware';
import { UserCollection } from '../../../models/User';
import { GatheringCollection } from '../../../models/Gathering';
import { ItemCollection } from '../../../models/Item';
import { InviteCollection } from '../../../models/Invite';
import { ObjectId } from 'mongodb';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const db = await getDb();
    const userId = req.userId!;
    const userObjectId = new ObjectId(userId);

    // 1. Delete all gatherings created by this user (cascade to items)
    const gatheringsCollection = db.collection(GatheringCollection);
    const userGatherings = await gatheringsCollection
      .find({ hostId: userObjectId })
      .toArray();

    const gatheringIds = userGatherings.map((g) => g._id);

    // Delete items in user's gatherings
    if (gatheringIds.length > 0) {
      await db.collection(ItemCollection).deleteMany({
        gatheringId: { $in: gatheringIds },
      });
    }

    // Delete the gatherings
    await gatheringsCollection.deleteMany({ hostId: userObjectId });

    // 2. Unclaim items claimed by this user (set claimedBy to null)
    await db.collection(ItemCollection).updateMany(
      { claimedBy: userObjectId },
      {
        $unset: {
          claimedBy: '',
          claimedByName: '',
        },
      }
    );

    // 3. Remove user from invites (remove from acceptedUserIds array)
    await db.collection(InviteCollection).updateMany(
      { acceptedUserIds: userObjectId },
      {
        $pull: { acceptedUserIds: userObjectId },
      }
    );

    // 4. Delete the user account
    await db.collection(UserCollection).deleteOne({ _id: userObjectId });

    console.log(`Account deleted for user ${userId}`);

    return res.status(200).json({
      success: true,
      message: 'Account and all associated data deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting account:', error);
    return res.status(500).json({ error: 'Failed to delete account' });
  }
}

export default withAuth(handler);

