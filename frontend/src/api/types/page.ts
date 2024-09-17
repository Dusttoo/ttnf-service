export interface Page {
    id: string;
    type: string;
    name: string;
    slug: string;
    meta?: IMeta;
    customValues?: { [key: string]: any };
    externaData?: { [key: string]: any };
    content: string;
    authorId?: number;
    invalidBlockTypes?: string[];
    status: string; 
    isLocked: boolean;
    tags?: string[];
    createdAt?: Date;
    publishedAt?: Date;
    language: string;
    translations?: Translation[];
    updatedAt?: Date;
    settings?: PageSettings; 
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