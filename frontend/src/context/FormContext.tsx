import React, { createContext, useContext, useState } from 'react';
import { GenderEnum } from '../api/types/core';

interface LitterData {
    breedingId: number;
    birthDate: string;
    numberOfPuppies: number;
    pedigreeUrl: string;
}

interface PuppyData {
    name: string;
    gender: GenderEnum;
    dob: string;
    profilePhoto: string;
}

interface FormContextType {
    currentStep: number;
    litterData: LitterData;
    puppyData: PuppyData[];
    puppyIndex: number;
    setCurrentStep: (step: number) => void;
    updateLitterData: (data: Partial<LitterData>) => void;
    updatePuppyData: (index: number, data: Partial<PuppyData>) => void;
    setPuppyIndex: (index: number) => void;
    setPuppyData: (puppies: PuppyData[]) => void; // New setter function
}

const FormContext = createContext<FormContextType | undefined>(undefined);

export const useFormContext = () => {
    const context = useContext(FormContext);
    if (!context) {
        throw new Error('useFormContext must be used within a FormProvider');
    }
    return context;
};

interface FormProviderProps {
    children: React.ReactNode;
}

export const FormProvider: React.FC<FormProviderProps> = ({ children }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [litterData, setLitterData] = useState<LitterData>({
        breedingId: 0,
        birthDate: '',
        numberOfPuppies: 0,
        pedigreeUrl: '',
    });
    const [puppyData, setPuppyData] = useState<PuppyData[]>([]);
    const [puppyIndex, setPuppyIndex] = useState(0);

    // When updating litterData, if the numberOfPuppies changes,
    // initialize the puppyData array with the proper length.
    const updateLitterData = (data: Partial<LitterData>) => {
        setLitterData((prev) => {
            const newLitter = { ...prev, ...data };
            if (newLitter.numberOfPuppies > 0 && newLitter.numberOfPuppies !== puppyData.length) {
                setPuppyData(
                    Array.from({ length: newLitter.numberOfPuppies }, () => ({
                        name: '',
                        gender: GenderEnum.Male,
                        dob: '',
                        profilePhoto: '',
                    }))
                );
            }
            return newLitter;
        });
    };

    // Ensure that if a puppy at a given index doesn't exist, we create a default entry.
    const updatePuppyData = (index: number, data: Partial<PuppyData>) => {
        setPuppyData((prev) => {
            const newData = [...prev];
            if (!newData[index]) {
                newData[index] = { name: '', gender: GenderEnum.Male, dob: '', profilePhoto: '' };
            }
            newData[index] = { ...newData[index], ...data };
            return newData;
        });
    };

    return (
        <FormContext.Provider
            value={{
                currentStep,
                litterData,
                puppyData,
                puppyIndex,
                setCurrentStep,
                updateLitterData,
                updatePuppyData,
                setPuppyIndex,
                setPuppyData,
            }}
        >
            {children}
        </FormContext.Provider>
    );
};