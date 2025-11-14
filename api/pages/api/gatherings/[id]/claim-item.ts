import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb } from '../../../../lib/db';
import { withAuth, AuthenticatedRequest } from '../../../../lib/middleware';
import { ItemCollection } from '../../../../models/Item';
import { GatheringCollection } from '../../../../models/Gathering';
import { ObjectId } from 'mongodb';
import { z } from 'zod';

const claimItemSchema = z.object({
  itemId: z.string(),
  name: z.string().optional(), // Optional for unclaiming, required for claiming (checked in handler)
  customDescription: z.string().optional(),
});

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { itemId, name, customDescription } = claimItemSchema.parse(req.body);
    const db = await getDb();
    const userId = new ObjectId(req.userId!);
    const itemObjectId = new ObjectId(itemId);
    
    const item = await db.collection(ItemCollection).findOne({ _id: itemObjectId });
    
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    const gathering = await db.collection(GatheringCollection).findOne({
      _id: item.gatheringId,
      deletedAt: { $exists: false },
    });
    
    if (!gathering) {
      return res.status(404).json({ error: 'Gathering not found' });
    }
    
    // If already claimed by this user, unclaim it
    if (item.claimedBy && item.claimedBy.toString() === req.userId) {
      await db.collection(ItemCollection).updateOne(
        { _id: itemObjectId },
        { $unset: { claimedBy: '', claimedByName: '', customDescription: '' } }
      );
      const updatedItem = await db.collection(ItemCollection).findOne({ _id: itemObjectId });
      return res.status(200).json(updatedItem);
    }
    
    // Claim the item - name is required for claiming
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Name is required to claim an item' });
    }
    
    await db.collection(ItemCollection).updateOne(
      { _id: itemObjectId },
      {
        $set: {
          claimedBy: userId,
          claimedByName: name.trim(),
          customDescription: customDescription || undefined,
        },
      }
    );
    
    const updatedItem = await db.collection(ItemCollection).findOne({ _id: itemObjectId });
    return res.status(200).json(updatedItem);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request', details: error.errors });
    }
    console.error('Error claiming item:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default withAuth(handler);

