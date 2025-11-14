import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb } from '../../../lib/db';
import { withAuth, AuthenticatedRequest } from '../../../lib/middleware';
import { uploadImage } from '../../../lib/cloudinary';
import type { Gathering } from '../../../models/Gathering';
import { GatheringCollection } from '../../../models/Gathering';
import { InviteCollection } from '../../../models/Invite';
import { Filter, ObjectId, WithId } from 'mongodb';
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
  animatedBackground: z
    .enum([
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
    ])
    .optional(),
  date: z.string(),
  time: z.string(),
  address: z.string().min(1, 'Address is required'),
});

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const db = await getDb();
      const userId = req.userId!;
      const userObjectId = new ObjectId(userId);
      const range =
        typeof req.query.range === 'string' && req.query.range === 'past'
          ? 'past'
          : 'upcoming';
      const todayIso = new Date().toISOString().split('T')[0];

      const invitesCollection = db.collection(InviteCollection);
      const user = await db.collection('users').findOne({ _id: userObjectId });

      type InviteFilter =
        | { acceptedUserIds: ObjectId }
        | { phoneNumber: string; status: string };

      const inviteFilters: InviteFilter[] = [{ acceptedUserIds: userObjectId }];

      if (user?.phoneNumber) {
        inviteFilters.push({
          phoneNumber: user.phoneNumber,
          status: 'accepted',
        });
      }

      const acceptedInvites = await invitesCollection
        .find({ $or: inviteFilters })
        .project({ gatheringId: 1 })
        .toArray();

      const joinedGatheringIdStrings = Array.from(
        new Set(
          acceptedInvites
            .map((invite) => invite.gatheringId?.toString())
            .filter((id): id is string => Boolean(id))
        )
      );
      const joinedGatheringIds = joinedGatheringIdStrings.map(
        (id) => new ObjectId(id)
      );

      const gatheringsCollection = db.collection(GatheringCollection);

      type SerializedGathering = Omit<Gathering, '_id' | 'hostId'> & {
        _id: string;
        hostId: string;
      };

      const serializeGathering = (
        gathering: WithId<Gathering>
      ): SerializedGathering => ({
        ...gathering,
        _id: gathering._id.toString(),
        hostId: gathering.hostId.toString(),
      });

      if (range === 'past') {
        const pastOrFilters: Filter<Gathering>[] = [{ hostId: userObjectId }];
        if (joinedGatheringIds.length) {
          pastOrFilters.push({ _id: { $in: joinedGatheringIds } });
        }

        const pastGatherings = await gatheringsCollection
          .find({
            deletedAt: { $exists: false },
            date: { $lt: todayIso },
            $or: pastOrFilters,
          })
          .sort({ date: -1, time: -1 })
          .toArray();

        return res.status(200).json({
          past: pastGatherings.map(serializeGathering),
        });
      }

      const createdGatherings = await gatheringsCollection
        .find({
          deletedAt: { $exists: false },
          hostId: userObjectId,
          date: { $gte: todayIso },
        })
        .sort({ date: 1, time: 1 })
        .toArray();

      const joinedGatherings =
        joinedGatheringIds.length > 0
          ? await gatheringsCollection
              .find({
                deletedAt: { $exists: false },
                _id: { $in: joinedGatheringIds },
                hostId: { $ne: userObjectId },
                date: { $gte: todayIso },
              })
              .sort({ date: 1, time: 1 })
              .toArray()
          : [];

      return res.status(200).json({
        created: createdGatherings.map(serializeGathering),
        joined: joinedGatherings.map(serializeGathering),
      });
    } catch (error) {
      console.error('Error fetching gatherings:', error);
      return res.status(500).json({ error: 'Failed to fetch gatherings' });
    }
  }

  if (req.method === 'POST') {
    try {
      const {
        name,
        image,
        coverImage,
        animatedBackground,
        date,
        time,
        address,
      } = createGatheringSchema.parse(req.body);
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

      const result = await db
        .collection(GatheringCollection)
        .insertOne(gathering);
      const createdGathering = await db
        .collection(GatheringCollection)
        .findOne({ _id: result.insertedId });

      return res.status(201).json(createdGathering);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ error: 'Invalid request', details: error.issues });
      }
      console.error('Error creating gathering:', error);
      return res.status(500).json({ error: 'Failed to create gathering' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

export default withAuth(handler);
