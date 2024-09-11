import React from 'react';
import styled from 'styled-components';
import { Litter } from '../../api/types/breeding';

const Card = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 300px;
`;

const LitterCard: React.FC<{ litter: Litter }> = ({ litter }) => {
    return (
        <Card>
            <h2>{`Litter #${litter.id}`}</h2>
            <p>{`Birth Date: ${litter.birthDate}`}</p>
            <p>{`Number of Puppies: ${litter.numberOfPuppies}`}</p>
            {litter.pedigreeUrl && <a href={litter.pedigreeUrl}>View Pedigree</a>}
        </Card>
    );
};

export default LitterCard;