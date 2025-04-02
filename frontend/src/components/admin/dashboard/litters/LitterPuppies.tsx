import React from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { Description, DogCreate, DogUpdate } from '../../../../api/types/dog';
import { useModal } from '../../../../context/ModalContext';
import { useBreedingById } from '../../../../hooks/useBreeding';
import { useDeleteDog, useUpdateDog } from '../../../../hooks/useDog';
import { useAddPuppiesToLitter, useDeleteLitter, useLitter, useUpdateLitter } from '../../../../hooks/useLitter';
import { DeleteButton, EditButton } from '../../../common/Buttons';
import Button from '../../../common/form/Button';
import Input from '../../../common/Input';
import LoadingSpinner from '../../../common/LoadingSpinner';
import GlobalModal from '../../../common/Modal';
import SuccessMessage from '../../../common/SuccessMessage';
import BreedingForm from '../breedings/BreedingForm';
import DogForm from '../dogs/DogForm';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: 2rem;
  background-color: ${(props) => props.theme.colors.neutralBackground};
  border-radius: 8px;
  text-align: center;
  overflow: scroll;
  height: 100%;
`;

const Section = styled.div`
  margin-bottom: 2rem;
`;

const ParentContainer = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-evenly;
`;

const ParentInfo = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
`;

const ParentImage = styled.img`
  width: 200px;
  height: 200px;
  object-fit: cover;
  border-radius: 20%;
  margin-right: 1rem;
`;

const ParentDetails = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Title = styled.h1`
  font-family: ${(props) => props.theme.fonts.secondary};
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: ${(props) => props.theme.colors.primary};
`;

const PuppyList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
`;

const PuppyCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: ${(props) => props.theme.colors.secondaryBackground};
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 250px;
`;

const PuppyImage = styled.img`
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 4px;
`;

const PuppyName = styled.h3`
  margin: 0.5rem 0;
  font-size: 1.2rem;
  color: ${(props) => props.theme.colors.primary};
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-top: 0.5rem;
`;

const AddNewPuppyButton = styled(Button)`
  margin: 1rem;
  align-self: flex-end;
`;

const LitterPuppyManagement: React.FC = () => {
  const { litterId } = useParams<{ litterId: string }>();
  const { data: litter, isLoading: litterLoading } = useLitter(Number(litterId), { enabled: !!litterId });
  const { data: breeding } = useBreedingById(litter?.breedingId);
  const addPuppiesToLitterMutation = useAddPuppiesToLitter();
  const updateLitterMutation = useUpdateLitter();
  const deleteLitterMutation = useDeleteLitter();
  const deleteDogMutation = useDeleteDog();
  const updateDogMutation = useUpdateDog();
  const { openModal, closeModal } = useModal();
  const [descContent, setDescContent] = React.useState(litter?.description?.content || "");
  console.log(litter)

  const handleAddNewPuppy = () => {
    openModal(
      <DogForm
        onClose={closeModal}
        title="Add New Puppy"
        redirect={`/admin/dashboard/litters/${litterId}/puppies`}
        onDogCreated={(puppy: DogCreate) => {
          addPuppiesToLitterMutation.mutate({ litterId: Number(litterId), puppies: [puppy] });
          closeModal();
          openModal(<SuccessMessage message='Puppy added successfully' />);

        }}
      />
    );
  };

  const handleEditPuppy = (puppyId: number) => {
    openModal(
      <DogForm
        onClose={closeModal}
        title="Edit Puppy"
        dogId={puppyId}
        redirect={`/admin/dashboard/litters/${litterId}/puppies`}
        onDogUpdated={(puppyData: DogUpdate) => {
          updateDogMutation.mutate({ dogId: puppyId, dogData: puppyData });
          closeModal();
          openModal(<SuccessMessage message='Puppy updated successfully' />);

        }}
      />
    );
  };

  const handleDeletePuppy = (puppyId: number) => {
    if (window.confirm('Are you sure you want to delete this puppy?')) {
      deleteDogMutation.mutate(puppyId);
    }
  };

  const handleEditBreeding = () => {
    openModal(
      <BreedingForm
        onClose={closeModal}
        breedingId={breeding?.id}
      />
    );
  };

  const handleDescriptionSave = (updatedDescription: Description) => {
    if (!litter) return;
    updateLitterMutation.mutate({
      litterId: litter.id,
      litterData: { ...litter, description: updatedDescription },
    });
  };

  if (litterLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Container>
      <Title>Manage Puppies in Litter</Title>
      <Section>
        <h2>Parents Information</h2>
        <ParentContainer>
          <ParentInfo>
            <ParentDetails>
              <ParentImage src={breeding?.femaleDog.profilePhoto} alt={breeding?.femaleDog.name} />
              <Title>{breeding?.femaleDog.name}</Title>
            </ParentDetails>
          </ParentInfo>
          <ParentInfo>
            <ParentDetails>
              <ParentImage src={breeding?.maleDog?.profilePhoto ?? breeding?.manualSireImageUrl ?? 'path/to/default-image.jpg'}
                alt={breeding?.maleDog?.name ?? breeding?.manualSireName ?? 'Unknown Male Dog'} />
              <Title>{breeding?.maleDog?.name ?? breeding?.manualSireName ?? 'Unknown Sire'}</Title>
            </ParentDetails>
          </ParentInfo>
        </ParentContainer>
        <ParentDetails>
          <div><strong>Breeding Date:</strong> {breeding?.breedingDate}</div>
          <div><strong>Expected Birth Date:</strong> {breeding?.expectedBirthDate}</div>
          <div><strong>Breeding Description:</strong> {breeding?.description}</div>
          <EditButton onClick={handleEditBreeding} />
        </ParentDetails>
      </Section>
      <Section>
        <h2>Litter Description</h2>
        <Input
          type="text"
          name="description"
          placeholder="Description"
          value={descContent}
          onChange={(e) => setDescContent(e.target.value)}
        />
        <Button
          onClick={() =>
            handleDescriptionSave({ content: descContent, style: litter?.description?.style ?? {} })
          }
        >
          Save Description
        </Button>
      </Section>
      <Section>
        <h2>Puppies</h2>
        <AddNewPuppyButton onClick={handleAddNewPuppy}>Add New Puppy</AddNewPuppyButton>
        <PuppyList>
          {litter && litter.puppies.map((puppy) => (
            <PuppyCard key={puppy.id}>
              <PuppyImage src={puppy.profilePhoto} alt={puppy.name} />
              <PuppyName>{puppy.name}</PuppyName>
              <ButtonContainer>
                <EditButton onClick={() => handleEditPuppy(puppy.id)} />
                <DeleteButton onClick={() => handleDeletePuppy(puppy.id)} />
              </ButtonContainer>
            </PuppyCard>
          ))}
        </PuppyList>
      </Section>
      <GlobalModal />
    </Container>
  );
};

export default LitterPuppyManagement;