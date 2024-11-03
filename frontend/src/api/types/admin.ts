import { GenderEnum } from './core';

export interface WaitlistEntry {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  gender_preference?: GenderEnum;
  color_preference?: string;
  sires?: number[];
  dams?: number[];
  additional_info?: string;
  breeding_id?: number;
}

export interface WaitlistCreate {
  name: string;
  email?: string;
  phone?: string;
  gender_preference?: GenderEnum;
  color_preference?: string;
  sire_ids?: number[];
  dam_ids?: number[];
  additional_info?: string;
}

export interface WaitlistUpdate {
  name?: string;
  email?: string;
  phone?: string;
  gender_preference?: GenderEnum;
  color_preference?: string;
  sire_ids?: number[];
  dam_ids?: number[];
  additional_info?: string;
}

export interface ContactSubmission {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  message: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface DashboardStats {
  contactSubmissions: number;
  waitlistSubmissions: number;
}
