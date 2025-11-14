import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb } from '../../../../lib/db';
import { withAuth, AuthenticatedRequest } from '../../../../lib/middleware';
import { generateMagicCode } from '../../../../lib/twilio';
import { GatheringCollection } from '../../../../models/Gathering';
import { InviteCollection } from '../../../../models/Invite';
import { ObjectId } from 'mongodb';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { id } = req.query;
  
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid gathering ID' });
  }
  
  try {
    const db = await getDb();
    const gatheringId = new ObjectId(id);
    
    // Verify gathering exists and user is host
    const gathering = await db.collection(GatheringCollection).findOne({ _id: gatheringId });
    
    if (!gathering) {
      return res.status(404).json({ error: 'Gathering not found' });
    }
    
    if (gathering.hostId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Only the host can generate invites' });
    }
    
    // Check if invite already exists for this gathering
    let invite = await db.collection(InviteCollection).findOne({ gatheringId });
    
    if (!invite) {
      // Generate invite code
      const code = generateMagicCode();
      
      // Create invite
      const result = await db.collection(InviteCollection).insertOne({
        gatheringId,
        status: 'pending',
        code,
        createdAt: new Date(),
      });
      
      invite = await db.collection(InviteCollection).findOne({ _id: result.insertedId });
    }
    
    // Generate shareable message and link
    const inviteLink = `${process.env.APP_URL || 'https://whatcha-bringin.app'}/invite/${invite!.code}`;
    const shareMessage = `You're invited to "${gathering.name}"! 🎉

📅 ${new Date(gathering.date).toLocaleDateString()} at ${gathering.time}
📍 ${gathering.address}

Join us in Watcha Bringin! Use code: ${invite!.code}
Or visit: ${inviteLink}`;
    
    return res.status(200).json({ 
      success: true, 
      code: invite!.code,
      link: inviteLink,
      message: shareMessage,
    });
  } catch (error) {
    console.error('Error generating invite:', error);
    return res.status(500).json({ error: 'Failed to generate invite' });
  }
}

export default withAuth(handler);

