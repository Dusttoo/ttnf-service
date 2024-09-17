import React, { useState } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';

const AnnouncementContainer = styled.div`
  background-color: ${(props) => props.theme.colors.secondaryBackground};
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  margin: 2rem 0;
  padding: 1.5rem;
`;

const AnnouncementHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
`;

const AnnouncementTitle = styled.h3`
  font-size: 18px;
  color: ${(props) => props.theme.colors.primary};
  margin: 0;
`;

const ToggleIcon = styled.div`
  font-size: 16px;
  color: ${(props) => props.theme.colors.text};
`;

const AnnouncementList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin-top: 1rem;
`;

const AnnouncementItem = styled.li`
  padding: 1rem;
  border-bottom: 1px solid ${(props) => props.theme.colors.border};
  &:last-child {
    border-bottom: none;
  }
`;

const AnnouncementDetails = styled.div`
  display: flex;
  justify-content: space-between;
`;

const DateText = styled.span`
  font-size: 14px;
  color: ${(props) => props.theme.colors.textLight};
`;

const AnnouncementMessage = styled.p`
  font-size: 16px;
  margin: 0.5rem 0;
  color: ${(props) => props.theme.colors.text};
`;

interface Announcement {
  id: number;
  title: string;
  date: string;
  message: string;
  category?: string; // Optional category
}

interface AnnouncementProps {
  announcements: Announcement[];
  title: string;
}

const AnnouncementSection: React.FC<AnnouncementProps> = ({ announcements, title }) => {
  const [isVisible, setIsVisible] = useState(true);

  const toggleVisibility = () => {
    setIsVisible((prevState) => !prevState);
  };

  return (
    <AnnouncementContainer>
      <AnnouncementHeader onClick={toggleVisibility}>
        <AnnouncementTitle>{title}</AnnouncementTitle>
        <ToggleIcon>
          <FontAwesomeIcon icon={isVisible ? faChevronUp : faChevronDown} />
        </ToggleIcon>
      </AnnouncementHeader>
      {isVisible && (
        <AnnouncementList>
          {announcements.map((announcement) => (
            <AnnouncementItem key={announcement.id}>
              <AnnouncementDetails>
                <strong>{announcement.title}</strong>
                <DateText>{announcement.date}</DateText>
              </AnnouncementDetails>
              <AnnouncementMessage>{announcement.message}</AnnouncementMessage>
            </AnnouncementItem>
          ))}
        </AnnouncementList>
      )}
    </AnnouncementContainer>
  );
};

export default AnnouncementSection;