import { ObjectId } from 'mongodb';

export interface Invite {
  _id?: ObjectId;
  gatheringId: ObjectId;
  phoneNumber?: string; // Optional - no longer required for shareable invites
  status: 'pending' | 'accepted' | 'declined';
  code?: string;
  hashedCode?: string;
  createdAt: Date;
  acceptedUserIds?: ObjectId[];
}

export const InviteCollection = 'invites';
