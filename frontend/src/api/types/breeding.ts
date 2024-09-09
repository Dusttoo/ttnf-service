import { Dog, DogCreate, Description } from './dog';

// Breeding Interfaces
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

// Litter Interfaces
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

export interface PuppyCreate extends DogCreate { }