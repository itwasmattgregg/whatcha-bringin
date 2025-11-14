export interface User {
  _id: string;
  phoneNumber: string;
  name?: string;
  createdAt: string;
}

export interface Gathering {
  _id: string;
  name: string;
  image?: string;
  coverImage?: string;
  animatedBackground?: string;
  date: string;
  time: string;
  address: string;
  hostId: string;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string;
}

export interface Item {
  _id: string;
  name: string;
  type: 'food' | 'drink';
  gatheringId: string;
  claimedBy?: string;
  claimedByName?: string;
  customDescription?: string;
  createdAt: string;
}

export interface Invite {
  _id: string;
  gatheringId: string;
  phoneNumber?: string; // Optional - no longer required for shareable invites
  status: 'pending' | 'accepted' | 'declined';
  code?: string;
  createdAt: string;
}

export interface GatheringsGroupedResponse {
  created: Gathering[];
  joined: Gathering[];
}

export interface PastGatheringsResponse {
  past: Gathering[];
}

export interface AuthResponse {
  token: string;
  user: User;
}
