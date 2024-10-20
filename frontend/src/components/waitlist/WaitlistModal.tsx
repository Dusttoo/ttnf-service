import React, { useState } from 'react';
import GlobalModal from '../common/Modal';
import WaitlistForm from './WaitlistForm';
import { WaitlistCreate } from '../../api/types/waitlist';
import { createWaitlistEntry } from '../../api/waitlistApi';
import SuccessMessage from '../common/SuccessMessage';

interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WaitlistModal: React.FC<WaitlistModalProps> = ({ isOpen, onClose }) => {
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (data: WaitlistCreate) => {
    try {
      await createWaitlistEntry(data);
      //      setSuccess(true);
    } catch (error) {
      console.error('Failed to submit waitlist entry:', error);
    }
  };

  const handleClose = () => {
    setSuccess(false);
    onClose();
  };

  return (
    <GlobalModal isOpen={isOpen} onClose={handleClose}>
      {success ? (
        <SuccessMessage
          message="Waitlist request received."
          detail="We will be in touch shortly!"
          onClose={handleClose}
        />
      ) : (
        <WaitlistForm
          onSubmit={handleSubmit}
          onSuccess={() => setSuccess(true)}
          onClose={handleClose}
        />
      )}
    </GlobalModal>
  );
};

export default WaitlistModal;
