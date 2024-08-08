import { useState, useEffect } from 'react';
import { getPRs } from '../api/api';

const useFetchPRs = (repo, repoSelected, selectedPrs) => {
  const [prs, setPrs] = useState([]);

  useEffect(() => {
    if (repo && repoSelected && selectedPrs.length === 0) {
      const fetchPrs = async () => {
        try {
          const response = await getPRs(repo);
          setPrs(response.data.prs || []);
        } catch (err) {
          console.error('Failed to fetch pull requests', err);
        }
      };

      fetchPrs();
    }
  }, [repo, repoSelected, selectedPrs]);

  return prs;
};

export default useFetchPRs;
