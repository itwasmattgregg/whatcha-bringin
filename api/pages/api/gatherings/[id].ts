import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb } from '../../../lib/db';
import { withAuth, AuthenticatedRequest } from '../../../lib/middleware';
import { uploadImage } from '../../../lib/cloudinary';
import { GatheringCollection } from '../../../models/Gathering';
import { ObjectId } from 'mongodb';
import { z } from 'zod';

// Configure body parser for larger payloads (images)
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { id } = req.query;
  
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid gathering ID' });
  }
  
  try {
    const db = await getDb();
    const gatheringId = new ObjectId(id);
    const gatherings = db.collection(GatheringCollection);
    const gatheringFilter = { _id: gatheringId, deletedAt: { $exists: false } };
    
    if (req.method === 'GET') {
      const gathering = await gatherings.findOne(gatheringFilter);
      
      if (!gathering) {
        return res.status(404).json({ error: 'Gathering not found' });
      }
      
      return res.status(200).json(gathering);
    }
    
    if (req.method === 'PUT') {
      const gathering = await gatherings.findOne(gatheringFilter);
      
      if (!gathering) {
        return res.status(404).json({ error: 'Gathering not found' });
      }
      
      if (gathering.hostId.toString() !== req.userId) {
        return res.status(403).json({ error: 'Only the host can update this gathering' });
      }
      
      const updateSchema = z.object({
        name: z.string().min(1).optional(),
        date: z.string().optional(),
        time: z.string().optional(),
        address: z.string().min(1).optional(),
        coverImage: z.string().optional(), // Base64 image data
        animatedBackground: z.enum(['confetti', 'stars', 'waves', 'gradient', 'particles', 'rainbow', 'aurora', 'bubbles', 'sparkles', 'cosmic']).optional(),
        removeCoverImage: z.boolean().optional(),
      });
      
      const updates = updateSchema.parse(req.body);
      const updateData: any = {
        updatedAt: new Date(),
      };
      
      // Handle regular fields
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.date !== undefined) updateData.date = updates.date;
      if (updates.time !== undefined) updateData.time = updates.time;
      if (updates.address !== undefined) updateData.address = updates.address;
      if (updates.animatedBackground !== undefined) updateData.animatedBackground = updates.animatedBackground;
      
      // Handle cover image
      if (updates.removeCoverImage) {
        updateData.coverImage = null;
      } else if (updates.coverImage) {
        // Upload new cover image to Cloudinary
        const imageUrl = await uploadImage(updates.coverImage);
        updateData.coverImage = imageUrl;
      }
      
      await gatherings.updateOne(gatheringFilter, { $set: updateData });
      
      const updatedGathering = await gatherings.findOne(gatheringFilter);
      return res.status(200).json(updatedGathering);
    }
    
    if (req.method === 'DELETE') {
      const gathering = await gatherings.findOne(gatheringFilter);
      
      if (!gathering) {
        return res.status(404).json({ error: 'Gathering not found' });
      }
      
      if (gathering.hostId.toString() !== req.userId) {
        return res.status(403).json({ error: 'Only the host can delete this gathering' });
      }
      await gatherings.updateOne(gatheringFilter, {
        $set: {
          deletedAt: new Date(),
          updatedAt: new Date(),
        },
      });
      return res.status(200).json({ success: true });
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error handling gathering:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default withAuth(handler);

