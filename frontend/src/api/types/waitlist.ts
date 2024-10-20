import { GenderEnum } from './core';

export interface WaitlistEntry {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  gender_preference?: GenderEnum;
  color_preference?: string;
  sire_id?: number;
  dam_id?: number;
  additional_info?: string;
  breeding_id?: number;
}

export interface WaitlistCreate {
  name: string;
  email?: string;
  phone?: string;
  gender_preference?: GenderEnum;
  color_preference?: string;
  sire_id?: number;
  dam_id?: number;
  additional_info?: string;
}

export interface WaitlistUpdate {
  name?: string;
  email?: string;
  phone?: string;
  gender_preference?: GenderEnum;
  color_preference?: string;
  sire_id?: number;
  dam_id?: number;
  additional_info?: string;
}
