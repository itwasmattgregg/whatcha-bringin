import { ObjectId } from 'mongodb';

export interface Item {
  _id?: ObjectId;
  name: string;
  type: 'food' | 'drink';
  gatheringId: ObjectId;
  claimedBy?: ObjectId;
  claimedByName?: string; // Name displayed for the person who claimed
  customDescription?: string;
  createdAt: Date;
}

export const ItemCollection = 'items';

