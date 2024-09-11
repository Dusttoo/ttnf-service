import React from 'react';
import DogList from '../../components/dogs/DogList';

const FemalesPage: React.FC = () => {
    return <DogList defaultGender="female" owned={true} />;
};

export default FemalesPage;
