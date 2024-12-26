import React from 'react';
import DogList from '../../components/dogs/DogList';

const AvailablePage: React.FC = () => {
    return <DogList owned={false} availablePage={true}/>;
};

export default AvailablePage;
