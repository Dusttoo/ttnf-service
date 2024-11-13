export interface User {
    id: number;
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    phoneNumber?: string;
}

export interface AuthResponse {
    accessToken: string;
    tokenType: string;
    user: User;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
}

export interface SearchResult {
    id: number;
    name: string;
}

export interface SearchResponse {
    data: SearchResult;
    type: string;
}

export interface SearchBarProps {
    resources: string[];
    limit?: number;
    onResultSelect: (result: SearchResult) => void;
}

export interface Announcement {
  id: number;
  title: string;
  date: string;
  message: string;
  category?: AnnouncementCategory;
}

export interface AnnouncementProps {
  announcements: Announcement[];
  title: string;
}

export interface ImageCarouselSettings {
  dots?: boolean;
  infinite?: boolean;
  speed?: number;
  slidesToShow?: number;
  slidesToScroll?: number;
  autoplay?: boolean;
  autoplaySpeed?: number;
}

export interface CarouselImage {
    id: number | string;
    src: string;
    alt: string;
}

export interface WebsiteSettings {
    title: string;
    description: string;
    updatedAt: string;
  }

export enum GenderEnum {
    Male = 'Male',
    Female = 'Female'
}

export enum StatusEnum {
    Available = 'Available',
    Sold = 'Sold',
    Stud = 'Available For Stud',
    Retired = 'Retired',
    Active = 'Active',
    Production = 'Production',
    AbkcChampion = 'ABKC Champion'
}

export enum AnnouncementCategory {
  LITTER = 'litter',
  BREEDING = 'breeding',
  STUD = 'stud',
  ANNOUNCEMENT = 'announcement',
  SERVICE = 'service',
  INFO = 'info',
}