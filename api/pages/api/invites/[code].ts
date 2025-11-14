import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb } from '../../../lib/db';
import { GatheringCollection } from '../../../models/Gathering';
import { InviteCollection } from '../../../models/Invite';
import { ObjectId } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Enable CORS for public invite endpoint
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code } = req.query;

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Invalid invite code' });
  }

  try {
    const db = await getDb();

    // Find invite by code
    const invite = await db.collection(InviteCollection).findOne({ code });

    if (!invite) {
      return res.status(404).json({ error: 'Invite not found' });
    }

    // Get gathering details
    const gathering = await db.collection(GatheringCollection).findOne({
      _id: invite.gatheringId,
    });

    if (!gathering) {
      return res.status(404).json({ error: 'Gathering not found' });
    }

    // Return gathering details (public info only)
    return res.status(200).json({
      gathering: {
        _id: gathering._id.toString(),
        name: gathering.name,
        image: gathering.image,
        date: gathering.date,
        time: gathering.time,
        address: gathering.address,
      },
      invite: {
        code: invite.code,
        status: invite.status,
      },
    });
  } catch (error) {
    console.error('Error fetching invite:', error);
    return res.status(500).json({ error: 'Failed to fetch invite' });
  }
}

