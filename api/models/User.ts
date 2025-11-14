import { ObjectId } from 'mongodb';

export interface User {
  _id?: ObjectId;
  phoneNumber: string;
  name?: string;
  createdAt: Date;
}

export const UserCollection = 'users';

