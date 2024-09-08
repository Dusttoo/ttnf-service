import React from "react";
import styled from "styled-components";

interface ContainerProps {
    children: React.ReactNode;
}

const StyledContainer = styled.div`
    padding: 2rem;
    background-color: ${(props) => props.theme.colors.background};
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    max-width: 800px;
    margin: auto;
    text-align: center;
    `;

const Container: React.FC<ContainerProps> = ({children}) => {
    return (
        <StyledContainer>
            {children}
        </StyledContainer>
    )
}

export default Container;