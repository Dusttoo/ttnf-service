import { CSSProperties } from "react";

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

export interface Dog {
    id: number;
    name: string;
    dob: string;
    gender: string;
    color?: string;
    status: string;
    profilePhoto: string;
    studFee?: number;
    saleFee?: number;
    description?: string;
    pedigreeLink?: string;
    videoUrl?: string;
    parentMaleId?: number;
    parentFemaleId?: number;
    healthInfos: HealthInfo[];
    photos: Photo[];
    productions: Production[];
    children: Child[];
    parents: Parent[];

}

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

export interface DogCreate {
    name: string;
    dob: string;
    gender: GenderEnum;
    color?: string;
    status: string;
    profilePhoto: string;
    studFee?: number;
    saleFee?: number;
    description?: string;
    pedigreeLink?: string;
    videoUrl?: string;
    parentMaleId?: number;
    parentFemaleId?: number;
    healthInfos?: HealthInfoCreate[];
}

export interface PuppyCreate extends DogCreate {
}

export interface DogUpdate {
    name?: string;
    dob?: string;
    gender?: string;
    color?: string;
    status?: string;
    profilePhoto?: string;
    studFee?: number;
    saleFee?: number;
    description?: string;
    pedigreeLink?: string;
    videoUrl?: string;
    parentMaleId?: number;
    parentFemaleId?: number;
    healthInfos?: HealthInfoCreate[];
}

export interface DogSchema {
    id: number;
    name: string;
    dob: string;
    gender: string;
    color?: string;
    status: string;
    profilePhoto: string;
    studFee?: number;
    saleFee?: number;
    description?: string;
    pedigreeLink?: string;
    videoUrl?: string;
    parentMaleId?: number;
    parentFemaleId?: number;
    healthInfos: HealthInfo[];
    photos: Photo[];
    productions: Production[];
    children: Child[];
    parents: Parent[];
}

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

export interface Parent {
    id: number;
    name: string;
    dob: string;
    gender: string;
    profile_photo: string;
}

export interface Child {
    id: number;
    name: string;
    dob: string;
    gender: string;
    profile_photo: string;
}

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

export interface Production {
    id: number;
    name: string;
    dob?: string;
    profilePhoto: string;
    owner?: string;
    parentMaleId?: number;
    parentFemaleId?: number;
    gender: string;
}

export interface ProductionCreate {
    name: string;
    dob?: string;
    profilePhoto: string;
    owner?: string;
    parentMaleId?: number;
    parentFemaleId?: number;
    gender: string;

}

export interface ProductionUpdate {
    name?: string;
    dob?: string;
    profilePhoto?: string;
    owner?: string;
    parentMaleId?: number;
    parentFemaleId?: number;
    gender?: string;

}

export interface ProductionSchema extends Production {
    dogs: Dog[];
}

export interface Page {
    id: number;
    title: string;
    slug: string;
    editable: boolean;
    createdAt: string;
    updatedAt: string | null;
    content: string;
}

export interface PageContent {
    blocks: Block[];
}

export interface Block {
    id: string;
    pageId: number;
    position: number;
    parentBlockId?: string | null;
    column?: number;
    children?: Block[];
    _hydrationTimestamp?: number;
}

export interface Breeding {
    id: number;
    femaleDogId: number;
    maleDogId: number;
    breedingDate: string;
    expectedBirthDate: string;
    description?: string;
    actualBirthDate?: string;
    litters: Litter[];
    femaleDog: Dog;
    maleDog: Dog;
}

export interface BreedingCreate {
    femaleDogId: number;
    maleDogId: number;
    breedingDate: string;
    expectedBirthDate: string;
    description?: string;
}

export interface BreedingUpdate {
    femaleDogId?: number;
    maleDogId?: number;
    breedingDate?: string;
    expectedBirthDate?: string;
    actualBirthDate?: string;
    description?: string;
}

export interface Description {
    content: string;
    style?: CSSProperties;
}

export interface Litter {
    id: number;
    breedingId: number;
    birthDate: string;
    numberOfPuppies: number;
    description?: Description;
    pedigreeUrl?: string;
    breeding: Breeding;
    puppies: Dog[];
}

export interface LitterCreate {
    breedingId: number;
    birthDate?: string;
    numberOfPuppies: number;
    description?: Description;
    pedigreeUrl?: string;
}

export interface LitterUpdate {
    birthDate?: string;
    numberOfPuppies?: number;
    description?: Description;
    pedigreeUrl?: string;
}

export interface ImageResponse {
    url: string;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
}

export interface SearchResponse {
    results: object[];
}

export interface NavLink {
    id: string;
    title: string;
    slug: string;
    editable: boolean;
    subLinks?: NavLink[];
}

export interface FilterProps {
    onGenderChange?: (gender: string) => void;
    onStatusChange?: (status: string[]) => void;
    onSireChange?: (sire?: Dog) => void;
    onDamChange?: (dam?: Dog) => void;
    onColorChange?: (color: string) => void;
    gender?: string;
    status?: string[];
    sire?: Dog;
    dam?: Dog;
    color?: string;
    isGenderDisabled?: boolean;
    isSireDisabled?: boolean;
    isDamDisabled?: boolean;
    isColorDisabled?: boolean;
}

export interface SelectedFilters {
    gender?: string;
    status?: string[];
    sire?: Dog;
    dam?: Dog;
    color?: string;
    owned?: boolean;
}

export interface SearchResult {
    id: number
    name: string;
}

export interface SearchResponse {
    data: SearchResult
    type: string
}

export interface SearchBarProps {
    resources: string[];
    limit?: number;
    onResultSelect: (result: SearchResult) => void;
}

export interface SelectedNode {
    id: string,
    name: string,
    settings: any,
    isDeletable: boolean,
}