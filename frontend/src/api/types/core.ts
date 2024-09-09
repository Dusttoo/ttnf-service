export interface User {
    id: number;
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

export enum GenderEnum {
    Male = 'Male',
    Female = 'Female'
}

export enum StatusEnum {
    Available = 'Available',
    Sold = 'Sold',
    Stud = 'Stud',
    Retired = 'Retired'
}