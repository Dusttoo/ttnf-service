import React, { useState } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp, faPaw, faBullhorn, faDog, faBasketShopping, faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import { AnnouncementCategory, Announcement, AnnouncementProps } from '../../api/types/core';

const AnnouncementContainer = styled.div`
  background: linear-gradient(135deg, ${(props) => props.theme.colors.secondaryBackground} 0%, ${(props) => props.theme.colors.primaryLight} 100%);
  border: 2px solid ${(props) => props.theme.colors.primary};
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  margin: 2rem 0;
  padding: 2rem;
  transition: transform 0.2s ease;
  width: 80%;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.2);
  }
`;

const AnnouncementHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
`;

const AnnouncementTitle = styled.h3`
  font-size: 20px;
  color: ${(props) => props.theme.colors.primaryDark};
  font-weight: bold;
  margin: 0;
`;

const ToggleIcon = styled.div`
  font-size: 20px;
  color: ${(props) => props.theme.colors.text};
`;

const AnnouncementList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin-top: 1.5rem;
`;

const AnnouncementItem = styled.li`
  padding: 1.5rem;
  margin-bottom: 1rem;
  background-color: ${(props) => props.theme.colors.lightBackground};
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${(props) => props.theme.colors.secondaryLight};
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

const AnnouncementDetails = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
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

const AnnouncementIcon = styled(FontAwesomeIcon)`
  margin-right: 10px;
  color: ${(props) => props.theme.colors.primary};
`;


const AnnouncementSection: React.FC<AnnouncementProps> = ({ announcements, title }) => {
  const [isVisible, setIsVisible] = useState(true);

  const toggleVisibility = () => {
    setIsVisible((prevState) => !prevState);
  };

  const getIcon = (category?: AnnouncementCategory) => {
    switch (category) {
      case AnnouncementCategory.LITTER:
      case AnnouncementCategory.BREEDING:
        return faPaw;
      case AnnouncementCategory.STUD:
        return faDog;
      case AnnouncementCategory.SERVICE:
        return faBasketShopping;
      case AnnouncementCategory.INFO:
        return faCircleInfo;
      default:
        return faBullhorn;
    }
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
                <div>
                  <AnnouncementIcon icon={getIcon(announcement.category)} />
                  <strong>{announcement.title}</strong>
                </div>
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