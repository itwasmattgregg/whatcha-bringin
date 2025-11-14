import { ObjectId } from 'mongodb';

export interface Invite {
  _id?: ObjectId;
  gatheringId: ObjectId;
  phoneNumber?: string; // Optional - no longer required for shareable invites
  status: 'pending' | 'accepted' | 'declined';
  code?: string;
  createdAt: Date;
}

export const InviteCollection = 'invites';

