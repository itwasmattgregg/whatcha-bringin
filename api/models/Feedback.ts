import { ObjectId } from 'mongodb';

export interface Feedback {
  _id?: ObjectId;
  email: string;
  message: string;
  type?: 'praise' | 'bug' | 'feature-request' | 'other';
  createdAt: Date;
  ipAddress?: string;
  userAgent?: string;
}

export const FeedbackCollection = 'feedback';

