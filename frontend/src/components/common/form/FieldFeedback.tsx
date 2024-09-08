import React from 'react';
import styled from 'styled-components';

const ErrorMessage = styled.div`
  color: ${(props) => props.theme.colors.error};
  font-size: 0.875rem;
  margin-top: 0.25rem;
`;

interface FeedbackProps {
    message: string;
}

const FieldFeedback: React.FC<FeedbackProps> = ({ message }) => {
    return <ErrorMessage>{message}</ErrorMessage>;
};

export default FieldFeedback;