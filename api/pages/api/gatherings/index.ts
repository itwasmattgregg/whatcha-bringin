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

const createGatheringSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  image: z.string().optional(),
  coverImage: z.string().optional(), // Base64 image data
  animatedBackground: z.enum(['confetti', 'stars', 'waves', 'gradient', 'particles', 'rainbow', 'aurora', 'bubbles', 'sparkles', 'cosmic']).optional(),
  date: z.string(),
  time: z.string(),
  address: z.string().min(1, 'Address is required'),
});

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const db = await getDb();
      const userId = req.userId!;
      
      // Get gatherings where user is host or invited
      const gatherings = await db.collection(GatheringCollection)
        .aggregate([
          {
            $match: {
              $or: [
                { hostId: new ObjectId(userId) },
                { _id: { $in: [] } }, // Will be populated with invited gatherings
              ],
            },
          },
          {
            $lookup: {
              from: 'invites',
              localField: '_id',
              foreignField: 'gatheringId',
              as: 'invites',
            },
          },
          {
            $match: {
              $or: [
                { hostId: new ObjectId(userId) },
                { 'invites.phoneNumber': { $exists: true } }, // User is invited
              ],
            },
          },
          {
            $sort: { createdAt: -1 },
          },
        ])
        .toArray();
      
      return res.status(200).json(gatherings);
    } catch (error) {
      console.error('Error fetching gatherings:', error);
      return res.status(500).json({ error: 'Failed to fetch gatherings' });
    }
  }
  
  if (req.method === 'POST') {
    try {
      const { name, image, coverImage, animatedBackground, date, time, address } = createGatheringSchema.parse(req.body);
      const db = await getDb();
      const userId = req.userId!;
      
      let imageUrl: string | undefined;
      let coverImageUrl: string | undefined;
      
      if (image) {
        imageUrl = await uploadImage(image);
      }
      
      if (coverImage) {
        coverImageUrl = await uploadImage(coverImage);
      }
      
      const gathering = {
        name,
        image: imageUrl,
        coverImage: coverImageUrl,
        animatedBackground,
        date,
        time,
        address,
        hostId: new ObjectId(userId),
        createdAt: new Date(),
      };
      
      const result = await db.collection(GatheringCollection).insertOne(gathering);
      const createdGathering = await db.collection(GatheringCollection).findOne({ _id: result.insertedId });
      
      return res.status(201).json(createdGathering);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request', details: error.errors });
      }
      console.error('Error creating gathering:', error);
      return res.status(500).json({ error: 'Failed to create gathering' });
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}

export default withAuth(handler);

