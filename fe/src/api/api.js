import axiosInstance from './axiosInstance';

export const getRepoSuggestions = (repo) => axiosInstance.get(`/api/repo-suggestions/${encodeURIComponent(repo)}`);
export const getPRs = (repo) => axiosInstance.post('/api/get-prs', { repo });
export const analyzePR = (repo, prNumber, prompt) => axiosInstance.post('/api/analyze-pr', { repo, prNumber, prompt });
