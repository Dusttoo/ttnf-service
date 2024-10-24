import React, { useState } from 'react';
import Input from '../common/Input';
import Textarea from '../common/TextArea';
import Checkbox from '../common/form/Checkbox';
import MultiSelect from '../common/MultiSelect';
import { GenderEnum } from '../../api/types/core';
import { WaitlistCreate } from '../../api/types/waitlist';
import SuccessMessage from '../common/SuccessMessage';
import Button from '../common/form/Button';
import { useFilteredDogs } from '../../hooks/useDog';
import { Dog } from '../../api/types/dog';
import styled from 'styled-components';
import { StatusEnum } from '../../api/types/core';

const Asterisk = styled.span`
  color: ${(props) => props.theme.colors.error};
  margin-left: 2px;
`;

const RequiredNote = styled.p`
  font-size: 0.9rem;
  color: ${(props) => props.theme.colors.textMuted};
  margin-bottom: 1rem;
`;

interface WaitlistFormProps {
  onSubmit: (data: WaitlistCreate) => Promise<void>;
  onSuccess: () => void;
  onClose: () => void;
}

const WaitlistForm: React.FC<WaitlistFormProps> = ({
  onSubmit,
  onSuccess,
  onClose,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [genderPreference, setGenderPreference] = useState<
    GenderEnum | undefined
  >(undefined);
  const [colorPreference, setColorPreference] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [selectedSires, setSelectedSires] = useState<number[]>([]);
  const [selectedDams, setSelectedDams] = useState<number[]>([]);
  const [success, setSuccess] = useState(false);

  const { data: siresData } = useFilteredDogs({ gender: GenderEnum.Male });
  const { data: damsData } = useFilteredDogs({ gender: GenderEnum.Female });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit({
        name,
        email,
        phone,
        gender_preference: genderPreference,
        color_preference: colorPreference,
        additional_info: additionalInfo,
        sire_ids: selectedSires,
        dam_ids: selectedDams,
      });
      setSuccess(true);
      onSuccess();
    } catch (error) {
      console.error('Failed to submit waitlist entry', error);
    }
  };

  return success ? (
    <SuccessMessage
      message="Waitlist entry created successfully!"
      onClose={onClose}
    />
  ) : (
    <form onSubmit={handleSubmit}>
      {/* Note about required fields */}
      <RequiredNote>
        Fields marked with <Asterisk>*</Asterisk> are required.
      </RequiredNote>

      <Input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        label="Name"
        required={true}
      />
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        label="Email"
        required={true}
      />
      <Input
        type="text"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        label="Phone"
      />

      <Checkbox
        label="Male"
        checked={genderPreference === GenderEnum.Male}
        onChange={() => setGenderPreference(GenderEnum.Male)}
      />
      <Checkbox
        label="Female"
        checked={genderPreference === GenderEnum.Female}
        onChange={() => setGenderPreference(GenderEnum.Female)}
      />
      <Input
        type="text"
        value={colorPreference}
        onChange={(e) => setColorPreference(e.target.value)}
        label="Color Preference"
      />
      <Textarea
        value={additionalInfo}
        onChange={(e) => setAdditionalInfo(e.target.value)}
        label="Additional Information"
      />

      {/* MultiSelect for Sires (filtering out retired sires) */}
      <MultiSelect
        name="sires"
        label="Select Sires"
        options={
          siresData?.items
            .filter((sire: Dog) => sire.status !== StatusEnum.Retired)
            .map((sire: Dog) => ({
              label: sire.name,
              value: sire.id,
            })) || []
        }
        selectedValues={selectedSires}
        onChange={setSelectedSires}
      />

      {/* MultiSelect for Dams (filtering out retired dams) */}
      <MultiSelect
        name="dams"
        label="Select Dams"
        options={
          damsData?.items
            .filter((dam: Dog) => dam.status !== StatusEnum.Retired)
            .map((dam: Dog) => ({
              label: dam.name,
              value: dam.id,
            })) || []
        }
        selectedValues={selectedDams}
        onChange={setSelectedDams}
      />

      <Button variant="primary" type="submit">
        Submit
      </Button>
    </form>
  );
};

export default WaitlistForm;
