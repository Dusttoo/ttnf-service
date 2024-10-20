import React, { useState } from 'react';
import GlobalModal from '../common/Modal';
import WaitlistForm from './WaitlistForm';
import { WaitlistCreate } from '../../api/types/waitlist';
import { createWaitlistEntry } from '../../api/waitlistApi';

interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WaitlistModal: React.FC<WaitlistModalProps> = ({ isOpen, onClose }) => {
  const handleSubmit = async (data: WaitlistCreate) => {
    await createWaitlistEntry(data);
  };

  const handleSuccess = () => {
    console.log('Successfully added to the waitlist!');
    onClose();
  };

  return (
    <GlobalModal isOpen={isOpen} onClose={onClose}>
      <WaitlistForm
        onSubmit={handleSubmit}
        onSuccess={handleSuccess}
        onClose={onClose}
      />
    </GlobalModal>
  );
};

export default WaitlistModal;
