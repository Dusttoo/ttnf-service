export interface Page {
    id: string;
    type: string;
    name: string;
    slug: string;
    meta?: IMeta;
    custom_values?: { [key: string]: any }; 
    external_data?: { [key: string]: any }; 
    content: string;
    author_id?: number;
    invalid_block_types?: string[]; 
    status: string; 
    is_locked: boolean;
    tags?: string[];
    created_at?: Date;
    published_at?: Date;
    language: string;
    translations?: Translation[];
    updated_at?: Date;
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