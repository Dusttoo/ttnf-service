import React, { useState } from 'react';
import styled from 'styled-components';
import { useAnnouncements, useCreateAnnouncement, useUpdateAnnouncement, useDeleteAnnouncement } from '../../../../hooks/useAnnouncements';
import { AnnouncementUpdate, Announcement, AnnouncementCreate } from '../../../../api/types/announcements';
import { AnnouncementCategory } from '../../../../api/types/core';
import { useModal } from '../../../../context/ModalContext';
import ErrorComponent from '../../../common/Error';
import GlobalModal from '../../../common/Modal';
import Input from '../../../common/Input';
import Dropdown from '../../../common/form/Dropdown';
import ContentArea from '../pages/editor/ContentArea';

const AnnouncementManagerContainer = styled.div`
  background-color: ${(props) => props.theme.colors.neutralBackground};
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.h2`
  color: ${(props) => props.theme.colors.secondary};
  font-family: ${(props) => props.theme.fonts.secondary};
  margin-bottom: 16px;
`;

const AnnouncementList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 20px 0;
`;

const AnnouncementItem = styled.li`
  background-color: ${(props) => props.theme.colors.secondaryBackground};
  margin-bottom: 12px;
  padding: 16px;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const AnnouncementForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
`;

const Button = styled.button`
  background-color: ${(props) => props.theme.ui.button.primary.background};
  color: ${(props) => props.theme.ui.button.primary.color};
  padding: 12px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  font-family: ${({ theme }) => theme.fonts.primary};
  transition: background-color 0.3s ease;

  &:hover {
    background-color: ${(props) => props.theme.ui.button.secondary.background};
    color: ${(props) => props.theme.ui.button.secondary.color};
  }
`;

const AnnouncementManager = () => {
  const { data: announcements, isError, error } = useAnnouncements();
  const createAnnouncement = useCreateAnnouncement();
  const updateAnnouncement = useUpdateAnnouncement();
  const deleteAnnouncement = useDeleteAnnouncement();
  const { openModal, closeModal } = useModal();

  const [newAnnouncement, setNewAnnouncement] = useState<AnnouncementCreate>({
    title: '',
    message: '',
    category: AnnouncementCategory.ANNOUNCEMENT,
  });

  const handleCreateAnnouncement = async () => {
    try {
      await createAnnouncement.mutateAsync(newAnnouncement);
      setNewAnnouncement({ title: '', message: '', category: AnnouncementCategory.ANNOUNCEMENT });
    } catch (error) {
      console.error('Failed to create announcement:', error);
      openModal(<ErrorComponent message="Failed to create announcement. Please try again." />);
    }
  };

  const handleUpdateAnnouncement = async (announcementId: number, updatedData: AnnouncementUpdate) => {
    try {
      await updateAnnouncement.mutateAsync({ announcementId, announcementData: updatedData });
    } catch (error) {
      console.error('Failed to update announcement:', error);
      openModal(<ErrorComponent message="Failed to update announcement. Please try again." />);
    }
  };

  const handleDeleteAnnouncement = async (announcementId: number) => {
    try {
      await deleteAnnouncement.mutateAsync(announcementId);
    } catch (error) {
      console.error('Failed to delete announcement:', error);
      openModal(<ErrorComponent message="Failed to delete announcement. Please try again." />);
    }
  };

  return (
    <AnnouncementManagerContainer>
      <SectionTitle>Announcements Manager</SectionTitle>

      <AnnouncementForm>
        <Input
          type="text"
          value={newAnnouncement.title}
          placeholder="Title"
          onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
        />
        <Dropdown
          name="category"
          options={Object.values(AnnouncementCategory)}
          value={newAnnouncement.category}
          label="Category"
          onChange={(e) => setNewAnnouncement({ ...newAnnouncement, category: e.target.value as AnnouncementCategory })}
        />
        <ContentArea
          content={newAnnouncement.message}
          setContent={(content) => setNewAnnouncement({ ...newAnnouncement, message: content })}
          placeholder="Enter announcement message..."
        />
        <Button onClick={handleCreateAnnouncement}>Add Announcement</Button>
      </AnnouncementForm>

      {isError ? (
        <ErrorComponent message={error?.message || 'Failed to load announcements.'} />
      ) : (
        <AnnouncementList>
          {announcements?.map((announcement) => (
            <AnnouncementItem key={announcement.id}>
              <div>
                <h3>{announcement.title}</h3>
                <div dangerouslySetInnerHTML={{ __html: announcement.message }} />
                <small>Category: {announcement.category}</small>
              </div>
              <Button onClick={() => handleDeleteAnnouncement(announcement.id)}>Delete</Button>
            </AnnouncementItem>
          ))}
        </AnnouncementList>
      )}
      <GlobalModal />
    </AnnouncementManagerContainer>
  );
};

export default AnnouncementManager;