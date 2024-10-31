import React from 'react';
import styled from 'styled-components';
import DogDropdown from './DogSelection';
import { FilterProps } from '../../../api/types/dog';
import { GenderEnum } from '../../../api/types/core';

interface ParentSelectorProps {
    sireId: number | undefined;
    damId: number | undefined;
    onSireChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    onDamChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    includeRetired?: boolean;
    disabled?: boolean;
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

const ParentSelector: React.FC<ParentSelectorProps> = ({
                                                           sireId,
                                                           damId,
                                                           onSireChange,
                                                           onDamChange,
                                                           includeRetired = false,
                                                           disabled = false,
                                                       }) => {
    const sireFilters: FilterProps = { gender: GenderEnum.Male, retired: includeRetired };
    const damFilters: FilterProps = { gender: GenderEnum.Female, retired: includeRetired };

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
                    disabled={disabled}
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