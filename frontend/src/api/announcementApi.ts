import axiosWithTimeout from './axiosInstance';
import { AnnouncementUpdate, AnnouncementCreate, Announcement } from './types/announcements';

export const getAnnouncements = async (): Promise<Announcement[]> => {
  const response = await axiosWithTimeout.get<Announcement[]>('/announcements', {
    headers: {
      isBackgroundRequest: 'true', 
    },
  });
  return response.data;
};

export const getAnnouncementById = async (id: number): Promise<Announcement> => {
  const response = await axiosWithTimeout.get<Announcement>(`/announcements/${id}`, {
    headers: {
      isBackgroundRequest: 'true', 
    },
  });
  return response.data;
};

export const getAnnouncementByPageId = async (id: string): Promise<Announcement[]> => {
    const response = await axiosWithTimeout.get<Announcement[]>(`/announcements/page/${id}`, {
      headers: {
        isBackgroundRequest: 'true', 
      },
    });
    return response.data;
  };

export const createAnnouncement = async (announcementData: AnnouncementCreate): Promise<Announcement> => {
  const response = await axiosWithTimeout.post<Announcement>('/announcements', announcementData);
  return response.data;
};

export const updateAnnouncement = async (id: number, announcementData: AnnouncementUpdate): Promise<void> => {
  await axiosWithTimeout.put(`/announcements/${id}`, announcementData, {
    headers: {
      isBackgroundRequest: 'true', 
    },
  });
};

export const deleteAnnouncement = async (id: number): Promise<void> => {
  await axiosWithTimeout.delete(`/announcements/${id}`);
};