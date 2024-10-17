// Service Interfaces
export interface Service {
    id: number;
    name: string;
    description: string;
    price?: string;
    availability: string;
    cta_name?: string;
    cta_link?: string;
    disclaimer?: string;
    image?: string;
    tags: Tag[];
    category: Category;
}

export interface ServiceCreate {
    name: string;
    description: string;
    price?: string;
    availability: string;
    cta_name?: string;
    cta_link?: string;
    disclaimer?: string;
    image?: string;
    category_id?: number;
    tags: number[];
}

export interface ServiceUpdate extends Partial<ServiceCreate> {}

// Tag Interfaces
export interface Tag {
    id: number;
    name: string;
}

export interface TagCreate {
    name: string;
}

// Category Interfaces
export interface Category {
    id: number;
    name: string;
    display: boolean;
    position: number;
}

export interface CategoryCreate {
    name: string;
    display: boolean;
    position: number;
}
