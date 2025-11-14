import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb } from '../../../../lib/db';
import { withAuth, AuthenticatedRequest } from '../../../../lib/middleware';
import { ItemCollection } from '../../../../models/Item';
import { GatheringCollection } from '../../../../models/Gathering';
import { ObjectId } from 'mongodb';
import { z } from 'zod';

const createItemSchema = z.object({
  name: z.string().min(1, 'Item name is required'),
  type: z.enum(['food', 'drink']),
});

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { id } = req.query;
  
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid gathering ID' });
  }
  
  try {
    const db = await getDb();
    const gatheringId = new ObjectId(id);
    const gatheringFilter = { _id: gatheringId, deletedAt: { $exists: false } };
    
    // Verify gathering exists
    const gathering = await db.collection(GatheringCollection).findOne(gatheringFilter);
    if (!gathering) {
      return res.status(404).json({ error: 'Gathering not found' });
    }
    
    if (req.method === 'GET') {
      const items = await db.collection(ItemCollection)
        .find({ gatheringId })
        .sort({ createdAt: 1 })
        .toArray();
      
      return res.status(200).json(items);
    }
    
    if (req.method === 'POST') {
      const { name, type } = createItemSchema.parse(req.body);
      
      const item = {
        name,
        type,
        gatheringId,
        createdAt: new Date(),
      };
      
      const result = await db.collection(ItemCollection).insertOne(item);
      const createdItem = await db.collection(ItemCollection).findOne({ _id: result.insertedId });
      
      return res.status(201).json(createdItem);
    }

    if (req.method === 'DELETE') {
      const itemId =
        typeof req.query.itemId === 'string'
          ? req.query.itemId
          : typeof req.body?.itemId === 'string'
          ? req.body.itemId
          : null;

      if (!itemId) {
        return res.status(400).json({ error: 'Item ID is required' });
      }

      if (gathering.hostId.toString() !== req.userId) {
        return res
          .status(403)
          .json({ error: 'Only the host can delete items' });
      }

      const itemObjectId = new ObjectId(itemId);
      const deleted = await db.collection(ItemCollection).deleteOne({
        _id: itemObjectId,
        gatheringId,
      });

      if (!deleted.deletedCount) {
        return res.status(404).json({ error: 'Item not found' });
      }

      return res.status(200).json({ success: true });
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request', details: error.issues });
    }
    console.error('Error handling items:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default withAuth(handler);

