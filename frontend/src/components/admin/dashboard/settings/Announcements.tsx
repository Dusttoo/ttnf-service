import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAnnouncements, useCreateAnnouncement, useUpdateAnnouncement, useDeleteAnnouncement } from '../../../../hooks/useAnnouncements';
import { usePages } from '../../../../hooks/usePages';
import { AnnouncementCreate, AnnouncementUpdate, Announcement } from '../../../../api/types/announcements';
import { AnnouncementCategory } from '../../../../api/types/core';
import { useModal } from '../../../../context/ModalContext';
import ErrorComponent from '../../../common/Error';
import GlobalModal from '../../../common/Modal';
import Input from '../../../common/Input';
import Dropdown from '../../../common/form/Dropdown';
import ContentArea from '../pages/editor/ContentArea';
import { Page } from '../../../../api/types/page';

const AnnouncementManagerContainer = styled.div`
  background-color: ${(props) => props.theme.colors.neutralBackground};
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.h2`
  color: ${(props) => props.theme.colors.white};
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

const Attributes = styled.div`
  display: flex;
  gap: 12px;
  flex-direction: column;
  margin-bottom: 20px;
  align-items: center;
  justify-content: center;
`;

const AnnouncementManager = () => {
  const { data: announcements, isError, error } = useAnnouncements();
  const { data: pages } = usePages();
  const createAnnouncement = useCreateAnnouncement();
  const updateAnnouncement = useUpdateAnnouncement();
  const deleteAnnouncement = useDeleteAnnouncement();
  const { openModal, closeModal } = useModal();

  const [editingId, setEditingId] = useState<number | null>(null);
  const [announcementData, setAnnouncementData] = useState<AnnouncementCreate>({
    title: '',
    message: '',
    category: AnnouncementCategory.ANNOUNCEMENT,
    pageId: undefined,
  });

  const handleSaveAnnouncement = async () => {
    try {
      const dataToSend = { ...announcementData }; 
  
      if (editingId) {
        await updateAnnouncement.mutateAsync({
          announcementId: editingId,
          announcementData: dataToSend,
        });
      } else {
        await createAnnouncement.mutateAsync(dataToSend);
      }
  
      setAnnouncementData({
        title: '',
        message: '',
        category: AnnouncementCategory.ANNOUNCEMENT,
        pageId: undefined,
      });
      setEditingId(null);
    } catch (error) {
      console.error('Failed to save announcement:', error);
      openModal(<ErrorComponent message="Failed to save announcement. Please try again." />);
    }
  };

  const handleEditAnnouncement = (announcement: Announcement) => {
    setAnnouncementData({
      title: announcement.title || '',
      message: announcement.message || '',
      category: announcement.category || AnnouncementCategory.ANNOUNCEMENT,
      pageId: announcement.pageId || undefined,
    });
    setEditingId(announcement.id);
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
          value={announcementData.title}
          placeholder="Title"
          onChange={(e) => setAnnouncementData({ ...announcementData, title: e.target.value })}
        />
        <ContentArea
          content={announcementData.message}
          setContent={(content) => setAnnouncementData({ ...announcementData, message: content })}
          placeholder="Write your announcement message..."
        />
        <Dropdown
          name="category"
          options={Object.values(AnnouncementCategory)}
          value={announcementData.category}
          onChange={(e) => setAnnouncementData({ ...announcementData, category: e.target.value as AnnouncementCategory })}
          label="Category"
        />
        {pages && (
          <Dropdown
            name="pageId"
            options={pages.map((page) => ({ value: page.id, label: page.name }))}
            value={announcementData.pageId || ''}
            onChange={(e) => setAnnouncementData({ ...announcementData, pageId: e.target.value })}
            label="Select Page"
          />
        )}
        <Button onClick={handleSaveAnnouncement}>{editingId ? 'Update' : 'Add'} Announcement</Button>
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
                <Attributes>
                  <small>Category: {announcement.category}</small>
                  <small>Page: {pages?.find((page: Page) => page.id === announcement.pageId)?.name || 'Not assigned'}</small>
                </Attributes>
              </div>
              <div>
                <Button onClick={() => handleEditAnnouncement(announcement)}>Edit</Button>
                <Button onClick={() => handleDeleteAnnouncement(announcement.id)}>Delete</Button>
              </div>
            </AnnouncementItem>
          ))}
        </AnnouncementList>
      )}
      <GlobalModal />
    </AnnouncementManagerContainer>
  );
};


export default AnnouncementManager;