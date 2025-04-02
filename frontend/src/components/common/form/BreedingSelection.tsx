import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Breeding } from '../../../api/types/breeding';
import { FilterProps } from '../../../api/types/dog';
import { useBreedings } from '../../../hooks/useBreeding';
import ErrorComponent from '../Error';
import LoadingSpinner from '../LoadingSpinner';

interface BreedingSelectionProps {
    name: string;
    value: string | number | undefined;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    filters?: FilterProps;
    label: string;
    disabled?: boolean;
}

const DropdownContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  box-sizing: border-box;
`;

const ImageContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const BreedingImage = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 20%;
  object-fit: cover;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
`;

const LabelStyled = styled.label`
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: ${(props) => props.theme.colors.text};
`;

const Dropdown = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.primary};
  border-radius: 4px;
  background-color: ${(props) => props.theme.colors.neutralBackground};
  color: ${({ theme }) => theme.colors.white};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primaryDark};
  }
`;

const BreedingSelection: React.FC<BreedingSelectionProps> = ({
    name,
    value,
    onChange,
    label,
    disabled = false,
}) => {
    // Using the useBreedings hook with default pagination values (adjust page/pageSize as needed)
    const { data, error, isLoading } = useBreedings(1, 50);
    const [selectedBreeding, setSelectedBreeding] = useState<Breeding | null>(null);

    // Update selected breeding when the value or data changes
    useEffect(() => {
        if (data) {
            const breeding = data.items.find((b: Breeding) => b.id === value);
            setSelectedBreeding(breeding || null);
        }
    }, [value, data]);

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return <ErrorComponent message={(error as Error).message} />;
    }

    const breedings = data?.items || [];

    return (
        <DropdownContainer>
            {selectedBreeding && (
                <ImageContainer>
                    {selectedBreeding.femaleDog && selectedBreeding.femaleDog.profilePhoto && (
                        <BreedingImage
                            src={selectedBreeding.femaleDog.profilePhoto}
                            alt={selectedBreeding.femaleDog.name}
                        />
                    )}
                    {selectedBreeding.maleDog && selectedBreeding.maleDog.profilePhoto && (
                        <BreedingImage
                            src={selectedBreeding.maleDog.profilePhoto}
                            alt={selectedBreeding.maleDog.name}
                        />
                    )}
                </ImageContainer>
            )}
            <LabelStyled>{label}</LabelStyled>
            <Dropdown name={name} value={value} onChange={onChange} disabled={disabled}>
                <option value="">Select {label}</option>
                {breedings.map((breeding: Breeding) => (
                    <option key={breeding.id} value={breeding.id}>
                        {breeding.maleDog
                            ? `${breeding.maleDog.name} & ${breeding.femaleDog.name}`
                            : breeding.femaleDog.name}
                    </option>
                ))}
            </Dropdown>
        </DropdownContainer>
    );
};

export default BreedingSelection;