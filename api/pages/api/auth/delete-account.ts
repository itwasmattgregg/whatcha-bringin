import type { NextApiResponse } from 'next';
import { getDb } from '../../../lib/db';
import { withAuth, AuthenticatedRequest } from '../../../lib/middleware';
import { UserCollection } from '../../../models/User';
import { GatheringCollection } from '../../../models/Gathering';
import { ItemCollection } from '../../../models/Item';
import { InviteCollection } from '../../../models/Invite';
import { ObjectId } from 'mongodb';

export async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const startTime = Date.now();
  const userId = req.userId!;
  const userObjectId = new ObjectId(userId);

  try {
    const db = await getDb();

    // 1. Get gathering IDs created by this user (projection for efficiency)
    const gatheringIds = await db
      .collection(GatheringCollection)
      .find({ hostId: userObjectId }, { projection: { _id: 1 } })
      .map((g) => g._id)
      .toArray();

    // 2. Execute operations in parallel where safe
    // Delete items in user's gatherings, unclaim items, and update invites in parallel
    const parallelOperations: Promise<any>[] = [];

    // Delete items in user's gatherings
    if (gatheringIds.length > 0) {
      parallelOperations.push(
        db.collection(ItemCollection).deleteMany({
          gatheringId: { $in: gatheringIds },
        })
      );
    }

    // Unclaim items claimed by this user
    parallelOperations.push(
      db.collection(ItemCollection).updateMany(
        { claimedBy: userObjectId },
        {
          $unset: {
            claimedBy: '',
            claimedByName: '',
            customDescription: '',
          },
        }
      )
    );

    // Remove user from invites
    parallelOperations.push(
      db.collection(InviteCollection).updateMany(
        { acceptedUserIds: userObjectId },
        {
          $pull: { acceptedUserIds: userObjectId } as any,
        }
      )
    );

    // Wait for parallel operations to complete
    await Promise.all(parallelOperations);

    // 3. Delete gatherings (after items are deleted)
    if (gatheringIds.length > 0) {
      await db
        .collection(GatheringCollection)
        .deleteMany({ hostId: userObjectId });
    }

    // 4. Delete the user account (last)
    const deleteResult = await db
      .collection(UserCollection)
      .deleteOne({ _id: userObjectId });

    if (deleteResult.deletedCount === 0) {
      return res
        .status(404)
        .json({ error: 'User not found or already deleted' });
    }

    const duration = Date.now() - startTime;
    console.log(`Account deleted for user ${userId} in ${duration}ms`);

    return res.status(200).json({
      success: true,
      message: 'Account and all associated data deleted successfully',
    });
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error(`Error deleting account after ${duration}ms:`, error);

    // Provide more specific error messages
    if (error.message?.includes('timeout') || error.code === 50) {
      return res.status(504).json({
        error:
          'Request timeout - account deletion is taking too long. Please try again.',
      });
    }

    return res.status(500).json({ error: 'Failed to delete account' });
  }
}

export default withAuth(handler);
