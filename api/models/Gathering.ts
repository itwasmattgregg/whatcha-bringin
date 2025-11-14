import { ObjectId } from 'mongodb';

export interface Gathering {
  _id?: ObjectId;
  name: string;
  image?: string | null;
  coverImage?: string | null; // Cover image URL (uploaded to Cloudinary)
  animatedBackground?: string; // Animated background name (e.g., 'confetti', 'stars', etc.)
  date: string;
  time: string;
  address: string;
  hostId: ObjectId;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export const GatheringCollection = 'gatherings';

