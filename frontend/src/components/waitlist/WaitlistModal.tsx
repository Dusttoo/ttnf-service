import React, { useState } from 'react';
import { useModal } from '../../context/ModalContext';
import WaitlistForm from './WaitlistForm';
import { WaitlistCreate } from '../../api/types/waitlist';
import { createWaitlistEntry } from '../../api/waitlistApi';
import SuccessMessage from '../common/SuccessMessage';

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
                <WaitlistForm
                    onSubmit={handleSubmit}
                    onSuccess={() => setSuccess(true)}
                    onClose={handleClose}
                />
            ),
        );
    };

    return <button onClick={handleOpenWaitlist}>Join Waitlist</button>;
};

export default WaitlistModal;