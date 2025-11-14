import apiClient from './api';
import {
  Gathering,
  Item,
  GatheringsGroupedResponse,
  PastGatheringsResponse,
} from '../types';

export const gatheringsService = {
  getUpcomingGatherings: async (): Promise<GatheringsGroupedResponse> => {
    const response = await apiClient.get('/gatherings', {
      params: { range: 'upcoming' },
    });
    return response.data;
  },

  getPastGatherings: async (): Promise<PastGatheringsResponse> => {
    const response = await apiClient.get('/gatherings', {
      params: { range: 'past' },
    });
    return response.data;
  },

  getGathering: async (id: string): Promise<Gathering> => {
    const response = await apiClient.get(`/gatherings/${id}`);
    return response.data;
  },

  createGathering: async (data: {
    name: string;
    image?: string;
    coverImage?: string;
    animatedBackground?: string;
    date: string;
    time: string;
    address: string;
  }): Promise<Gathering> => {
    const response = await apiClient.post('/gatherings', data);
    return response.data;
  },

  updateGathering: async (
    id: string,
    data: {
      name?: string;
      date?: string;
      time?: string;
      address?: string;
      coverImage?: string;
      animatedBackground?: string;
      removeCoverImage?: boolean;
    }
  ): Promise<Gathering> => {
    const response = await apiClient.put(`/gatherings/${id}`, data);
    return response.data;
  },

  deleteGathering: async (id: string): Promise<void> => {
    await apiClient.delete(`/gatherings/${id}`);
  },

  getItems: async (gatheringId: string): Promise<Item[]> => {
    const response = await apiClient.get(`/gatherings/${gatheringId}/items`);
    return response.data;
  },

  addItem: async (
    gatheringId: string,
    data: { name: string; type: 'food' | 'drink' }
  ): Promise<Item> => {
    const response = await apiClient.post(
      `/gatherings/${gatheringId}/items`,
      data
    );
    return response.data;
  },

  claimItem: async (
    gatheringId: string,
    itemId: string,
    name: string,
    customDescription?: string
  ): Promise<Item> => {
    const response = await apiClient.post(
      `/gatherings/${gatheringId}/claim-item`,
      {
        itemId,
        name,
        customDescription,
      }
    );
    return response.data;
  },

  getInviteShare: async (
    gatheringId: string
  ): Promise<{ code: string; link: string; message: string }> => {
    const response = await apiClient.get(`/gatherings/${gatheringId}/invite`);
    return response.data;
  },

  joinGathering: async (code: string): Promise<{ gathering: Gathering }> => {
    const response = await apiClient.post(`/invites/${code}/join`);
    return response.data;
  },
};
