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
    
    // Verify gathering exists
    const gathering = await db.collection(GatheringCollection).findOne({ _id: gatheringId });
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
    
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request', details: error.errors });
    }
    console.error('Error handling items:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default withAuth(handler);

