import React, { useState } from 'react';
import { useModal } from '../../context/ModalContext';
import WaitlistForm from './WaitlistForm';
import { WaitlistCreate } from '../../api/types/waitlist';
import { createWaitlistEntry } from '../../api/waitlistApi';
import SuccessMessage from '../common/SuccessMessage';
import GlobalModal from '../common/Modal';
import CTAButton from '../common/CTAButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import ModalContentWithCloseButton from '../common/ModalWithCloseButtonWrapper';

const WaitlistModal: React.FC = () => {
  const [success, setSuccess] = useState(false);
  const { openModal, closeModal } = useModal();

  const handleSubmit = async (data: WaitlistCreate) => {
    try {
      await createWaitlistEntry(data);
      setSuccess(true);
    } catch (error) {
      console.error('Failed to submit waitlist entry:', error);
    }
  };

  const handleClose = () => {
    setSuccess(false);
    closeModal();
  };

  const handleOpenWaitlist = () => {
    openModal(
      success ? (
        <SuccessMessage
          message="Waitlist request received."
          detail="We will be in touch shortly!"
          onClose={handleClose}
        />
      ) : (
        <ModalContentWithCloseButton
          onClose={closeModal}
          closeButtonChildren={
            <span>
              <FontAwesomeIcon icon={faTimes} /> Close
            </span>
          }
        >
          <WaitlistForm
            onSubmit={handleSubmit}
            onSuccess={() => setSuccess(true)}
            onClose={handleClose}
          />
        </ModalContentWithCloseButton>
      )
    );
  };

  return (
    <>
      <CTAButton label="Join Waitlist" onClick={handleOpenWaitlist} />
      <GlobalModal />
    </>
  );
};

export default WaitlistModal;
