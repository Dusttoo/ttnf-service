import { Announcement, CarouselImage } from './core';

export interface HeroContent {
  title: string;
  description: string;
  ctaText: string;
  introductionText: string;
  carouselImages: CarouselImage[];
  carouselSpeed: number;
}

export interface Page {
  id: string;
  type: string;
  name: string;
  slug: string;
  meta?: IMeta;
  customValues?: {
    heroContent?: HeroContent;
    iconArea?: { icon: string; label: string }[];
    aboutContent?: string;
    carouselImages?: CarouselImage[];
    [key: string]: any;
  };
  externalData?: { [key: string]: any };
  content: string;
  authorId?: number;
  status: string;
  isLocked: boolean;
  tags?: string[];
  createdAt?: Date;
  publishedAt?: Date;
  language: string;
  translations?: Translation[];
  updatedAt?: Date;
  settings?: PageSettings;
  announcements?: Announcement[];
  carousel?: CarouselImage[];
}

export interface PageSettings {
  seo?: SEOSettings;
  layout?: LayoutSettings;
}

export interface SEOSettings {
  title?: string;
  description?: string;
  keywords?: string;
  [key: string]: any;
}

export interface LayoutSettings {
  header?: boolean;
  footer?: boolean;
  [key: string]: any;
}

export interface IMeta {
  title?: string;
  description?: string;
  language?: string;
  featuredImage?: string;
}

export interface Translation {
  language: string;
  slug: string;
}
