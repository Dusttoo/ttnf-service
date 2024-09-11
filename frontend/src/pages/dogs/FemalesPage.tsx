import React from 'react';
import DogList from '../../components/dogs/DogList';
import { GenderEnum } from '../../api/types/core';

const FemalesPage: React.FC = () => {
    return <DogList defaultGender={GenderEnum.Female} owned={true} />;
};

export default FemalesPage;
