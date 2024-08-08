import { useState, useEffect } from 'react';
import { getRepoSuggestions } from '../api/api';

const useRepoSuggestions = (repo, repoSelected) => {
  const [searchSuggestions, setSearchSuggestions] = useState([]);

  useEffect(() => {
    if (repo.length > 2 && !repoSelected) {
      const fetchSuggestions = async () => {
        try {
          const response = await getRepoSuggestions(repo);
          setSearchSuggestions(response.data || []);
        } catch (err) {
          console.error('Failed to fetch repository suggestions', err);
        }
      };

      fetchSuggestions();
    } else {
      setSearchSuggestions([]);
    }
  }, [repo, repoSelected]);

  return searchSuggestions;
};

export default useRepoSuggestions;
