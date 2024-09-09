import React, { useState, ChangeEvent } from 'react';
import styled from 'styled-components';
import { searchResources } from '../../api/searchApi';
import { SearchBarProps, SearchResult, SearchResponse } from '../../api/types/core';
import { LinkComponent } from './Link';

const SearchContainer = styled.div`
  position: relative;
  margin: 1rem;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid ${(props) => props.theme.colors.primary};
  border-radius: 4px;
`;

const ResultsContainer = styled.div`
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  padding: 1rem;
  position: absolute;
  width: 100%;
  z-index: 1;
`;

const ResultItem = styled.div`
  padding: 0.5rem 0;
  color: ${(props) => props.theme.colors.text};
`;

const ViewAllLink = styled.a`
  display: block;
  margin-top: 1rem;
  color: ${(props) => props.theme.colors.primary};
  text-align: center;
  cursor: pointer;
`;

const SearchBar: React.FC<SearchBarProps> = ({ resources, limit = 5, onResultSelect }) => {
    const [query, setQuery] = useState<string>('');
    const [results, setResults] = useState<SearchResponse[]>([]);
    const [showResults, setShowResults] = useState<boolean>(false);

    const handleSearch = async (event: ChangeEvent<HTMLInputElement>) => {
        const { value } = event.target;
        setQuery(value);
        if (value.length > 2) {
            const searchResults = await searchResources(value, resources, limit);
            setResults(searchResults);
            setShowResults(true);
        } else {
            setShowResults(false);
        }
    };

    const handleViewAll = () => {
        window.location.href = `/search-results?query=${query}&resources=${resources.join(',')}`;
    };

    return (
        <SearchContainer>
            <SearchInput
                type="text"
                placeholder="Search..."
                value={query}
                onChange={handleSearch}
            />
            {showResults && (
                <ResultsContainer>
                    {results.map((result, index) => (
                        <ResultItem key={index} onClick={() => onResultSelect(result.data)}>
                            <LinkComponent href={`/${result.type}/${result.data.id}`}>{result.data.name}</LinkComponent>
                        </ResultItem>
                    ))}
                    <ViewAllLink onClick={handleViewAll}>View All Results</ViewAllLink>
                </ResultsContainer>
            )}
        </SearchContainer>
    );
};

export default SearchBar;