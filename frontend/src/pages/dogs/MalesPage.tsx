import React from 'react';
import DogList from '../../components/dogs/DogList';
import { GenderEnum } from '../../api/types/core';

const MalesPage: React.FC = () => {
    return <DogList defaultGender={GenderEnum.Male} owned={true}/>;
};

export default MalesPage;
