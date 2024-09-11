import React from 'react';
import DogList from '../../components/dogs/DogList';

const MalesPage: React.FC = () => {
    return <DogList defaultGender="male" owned={true}/>;
};

export default MalesPage;
