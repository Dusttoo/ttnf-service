import { AnnouncementCategory } from './core';

export interface Announcement {
  id: number;
  title: string;
  date: string;
  message: string;
  category?: AnnouncementCategory;
  pageId?: string;
}

export interface AnnouncementCreate {
  title: string;
  date?: string;
  message: string;
  category: AnnouncementCategory;
  pageId?: string;
}

export interface AnnouncementUpdate {
  title?: string;
  date?: string;
  message?: string;
  category?: AnnouncementCategory;
  pageId?: string;
}
