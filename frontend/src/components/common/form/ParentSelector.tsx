import React from 'react';
import styled from 'styled-components';
import DogDropdown from './DogSelection';
import { FilterProps } from '../../../api/types/dog';

interface ParentSelectorProps {
    sireId: number | undefined;
    damId: number | undefined;
    onSireChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    onDamChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const ParentContainer = styled.div`
    display: flex;
    justify-content: space-between;
    gap: 2rem;
`;

const ParentColumn = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 50%;
`;

const ParentLabel = styled.h3`
    margin-bottom: 0.5rem;
`;

const ParentSelector: React.FC<ParentSelectorProps> = ({ sireId, damId, onSireChange, onDamChange }) => {
    const sireFilters: FilterProps = { gender: 'male' };
    const damFilters: FilterProps = { gender: 'female' };

    return (
        <ParentContainer>
            <ParentColumn>
                <ParentLabel>Sire</ParentLabel>
                <DogDropdown
                    name="sireId"
                    value={sireId}
                    onChange={onSireChange}
                    filters={sireFilters}
                    label=""
                />
            </ParentColumn>
            <ParentColumn>
                <ParentLabel>Dam</ParentLabel>
                <DogDropdown
                    name="damId"
                    value={damId}
                    onChange={onDamChange}
                    filters={damFilters}
                    label=""
                />
            </ParentColumn>
        </ParentContainer>
    );
};

export default ParentSelector;