import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useDog, useDeleteDog } from '../../../../hooks/useDog';

const DogDetailContainer = styled.div`
    padding: 2rem;
    background-color: ${(props) => props.theme.colors.background};
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    max-width: 800px;
    margin: auto;
    text-align: center;
`;

const DogImage = styled.img`
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    margin-bottom: 1rem;
`;

const Button = styled.button`
    background-color: ${(props) => props.theme.colors.primary};
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    margin: 0.5rem;
    border-radius: 4px;
    cursor: pointer;
    &:hover {
        background-color: ${(props) => props.theme.colors.primaryDark};
    }
`;

const DogDetail: React.FC = () => {
    const { dogId } = useParams<{ dogId: string }>();
    console.log(dogId)
    const { data: dog, isLoading } = useDog(Number(dogId));
    const deleteDog = useDeleteDog();
    const navigate = useNavigate();

    const handleDelete = async () => {
        await deleteDog.mutateAsync(Number(dogId));
        navigate('/admin/dogs');
    };

    if (isLoading) return <p>Loading...</p>;

    if (!dog) return <p>Dog not found</p>;

    return (
        <DogDetailContainer>
            <h1>{dog.name}</h1>
            <p>DOB: {dog.dob}</p>
            <p>Gender: {dog.gender}</p>
            <p>Status: {dog.status}</p>
            <DogImage src={dog.profilePhoto} alt={dog.name} />
            <div>
                <Link to={`/admin/dogs/edit/${dogId}`}>
                    <Button>Edit</Button>
                </Link>
                <Button onClick={handleDelete}>Delete</Button>
            </div>
        </DogDetailContainer>
    );
};

export default DogDetail;