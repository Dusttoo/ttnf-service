import { CSSProperties } from 'react';
import { GenderEnum, StatusEnum } from './core';

// Main Dog Interface
export interface Dog {
    id: number;
    name: string;
    dob: string;
    gender: GenderEnum;
    color?: string;
    status: StatusEnum;
    profilePhoto: string;
    studFee?: number;
    saleFee?: number;
    description?: string;
    pedigreeLink?: string;
    videoUrl?: string;
    parentMaleId?: number;
    parentFemaleId?: number;
    isRetired: boolean;
    isProduction: boolean;
    healthInfos: HealthInfo[];
    photos: Photo[];
    productions: Production[];
    children: Child[];
    parents: Parent[];
}

export interface Description {
    content: string;
    style?: CSSProperties;
}

// Interfaces for Creating and Updating Dogs
export interface DogCreate {
    name: string;
    dob: string;
    gender: GenderEnum;
    color?: string;
    status?: StatusEnum;
    profilePhoto: string;
    studFee?: number;
    saleFee?: number;
    description?: string;
    pedigreeLink?: string;
    videoUrl?: string;
    parentMaleId?: number;
    parentFemaleId?: number;
    healthInfos?: HealthInfoCreate[];
    galleryPhotos?: string[];
}

export interface DogUpdate {
    name?: string;
    dob?: string;
    gender?: GenderEnum;
    color?: string;
    status?: StatusEnum;
    profilePhoto?: string;
    studFee?: number;
    saleFee?: number;
    description?: string;
    pedigreeLink?: string;
    videoUrl?: string;
    parentMaleId?: number;
    parentFemaleId?: number;
    healthInfos?: HealthInfoCreate[];
    galleryPhotos?: string[];

}

export interface PuppyCreate extends DogCreate {
}

// Health Information Interfaces
export interface HealthInfo {
    id: number;
    dogId: number;
    dna?: string;
    carrierStatus?: string;
    extraInfo?: string;
}

export interface HealthInfoCreate {
    dna?: string;
    carrierStatus?: string;
    extraInfo?: string;
}

// Photo Interfaces
export interface Photo {
    id: number;
    dogId: number;
    photoUrl: string;
    alt: string;
}

export interface PhotoCreate {
    photoUrl: string;
    alt: string;
}

// Parent and Child Interfaces
export interface Parent {
    id: number;
    name: string;
    dob: string;
    gender: GenderEnum;
    profilePhoto: string;
}

export interface Child {
    id: number;
    name: string;
    dob: string;
    gender: GenderEnum;
    profilePhoto: string;
}

// Production Interfaces
export interface Production {
    id: number;
    name: string;
    dob?: string;
    description?: string;
    profilePhoto: string;
    owner?: string;
    parentMaleId?: number;
    parentFemaleId?: number;
    gender: GenderEnum;
}

export interface ProductionCreate {
    name: string;
    dob?: string;
    profilePhoto: string;
    owner?: string;
    parentMaleId?: number;
    parentFemaleId?: number;
    gender: GenderEnum;
}

export interface ProductionUpdate {
    name?: string;
    dob?: string;
    profilePhoto?: string;
    owner?: string;
    parentMaleId?: number;
    parentFemaleId?: number;
    gender?: GenderEnum;
}

export interface ProductionSchema extends Production {
    dogs: Dog[];
}

// Filter interfaces
export interface FilterProps {
    onGenderChange?: (gender?: GenderEnum) => void;
    onStatusChange?: (status: StatusEnum[]) => void;
    onSireChange?: (sire?: Dog) => void;
    onDamChange?: (dam?: Dog) => void;
    onColorChange?: (color: string) => void;
    onRetiredChange?: (retired: boolean) => void;
    gender?: GenderEnum;
    status?: StatusEnum[];
    sire?: { id: number };
    dam?: { id: number };
    color?: string;
    retired?: boolean;
    isGenderDisabled?: boolean;
    isStatusDisabled?: boolean;
    isSireDisabled?: boolean;
    isDamDisabled?: boolean;
    isColorDisabled?: boolean;
}

export interface SelectedFilters {
    gender?: GenderEnum;
    status?: StatusEnum[];
    sire?: { id: number };
    dam?: { id: number };
    color?: string;
    owned?: boolean;
    retired?: boolean;
}
