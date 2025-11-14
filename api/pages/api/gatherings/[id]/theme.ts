import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb } from '../../../../lib/db';
import { withAuth, AuthenticatedRequest } from '../../../../lib/middleware';
import { uploadImage } from '../../../../lib/cloudinary';
import type { Gathering } from '../../../../models/Gathering';
import { GatheringCollection } from '../../../../models/Gathering';
import { ObjectId } from 'mongodb';
import { z } from 'zod';

const ANIMATED_BACKGROUNDS = [
  'confetti',
  'stars',
  'waves',
  'gradient',
  'particles',
  'rainbow',
  'aurora',
  'bubbles',
  'sparkles',
  'cosmic',
] as const;

const updateThemeSchema = z.object({
  coverImage: z.string().optional(), // Base64 image data
  animatedBackground: z.enum(ANIMATED_BACKGROUNDS).optional(),
  removeCoverImage: z.boolean().optional(),
});

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid gathering ID' });
  }

  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const db = await getDb();
    const gatheringId = new ObjectId(id);
    const gatheringFilter = { _id: gatheringId, deletedAt: { $exists: false } };

    // Verify gathering exists and user is host
    const gathering = await db
      .collection(GatheringCollection)
      .findOne(gatheringFilter);

    if (!gathering) {
      return res.status(404).json({ error: 'Gathering not found' });
    }

    if (gathering.hostId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Only the host can update the theme' });
    }

    const { coverImage, animatedBackground, removeCoverImage } =
      updateThemeSchema.parse(req.body);

    const updates: Partial<Gathering> & { updatedAt: Date } = {
      updatedAt: new Date(),
    };

    // Handle cover image
    if (removeCoverImage) {
      updates.coverImage = null;
    } else if (coverImage) {
      // Upload new cover image to Cloudinary
      const imageUrl = await uploadImage(coverImage);
      updates.coverImage = imageUrl;
    }

    // Handle animated background
    if (animatedBackground !== undefined) {
      updates.animatedBackground = animatedBackground;
    }

    // Update gathering
    await db
      .collection(GatheringCollection)
      .updateOne(gatheringFilter, { $set: updates });

    const updatedGathering = await db
      .collection(GatheringCollection)
      .findOne(gatheringFilter);

    return res.status(200).json(updatedGathering);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request', details: error.issues });
    }
    console.error('Error updating gathering theme:', error);
    return res.status(500).json({ error: 'Failed to update theme' });
  }
}

export default withAuth(handler);

