import React, { useState, useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  CssBaseline,
  IconButton
} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import theme from './theme';
import useRepoSuggestions from './hooks/useRepoSuggestions';
import { getPRs, analyzePR } from './api/api';  // Import getPRs here
import RepoSuggestions from './components/RepoSuggestions';
import PRList from './components/PRList';
import AnalysisResults from './components/AnalysisResults';
import AnalyzeModal from './components/AnalyzeModal';

const promptOptions = [
  { label: 'Security', icon: '🔒' },
  { label: 'Compliance', icon: '✔️' },
  { label: 'OWASP', icon: '🛡️' }
];

function App() {
  const [repo, setRepo] = useState('');
  const [selectedPrs, setSelectedPrs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysisResults, setAnalysisResults] = useState([]);
  const [repoSelected, setRepoSelected] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [prs, setPrs] = useState([]); // State for PRs

  const searchSuggestions = useRepoSuggestions(repo, repoSelected);

  useEffect(() => {
    if (repo && repoSelected) {
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
  }, [repo, repoSelected]);

  const handleAnalyze = async () => {
    if (selectedPrs.length === 0) return;

    setLoading(true);
    setError(null);
    setAnalysisResults([]);

    try {
      const results = await Promise.all(selectedPrs.map(async (pr) => {
        const response = await analyzePR(repo, pr.number, pr.selectedPrompt);
        return response.data;
      }));

      setAnalysisResults(results);
      closeModal();
    } catch (err) {
      setError('Failed to analyze the pull request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRepoSelection = (repoFullName) => {
    setRepo(repoFullName);
    setRepoSelected(true);
  };

  const handlePrSelection = (pr) => {
    setSelectedPrs(prevSelectedPrs => {
      if (prevSelectedPrs.some(selected => selected.id === pr.id)) {
        return prevSelectedPrs.filter(selected => selected.id !== pr.id);
      } else {
        return [...prevSelectedPrs, pr];
      }
    });
  };

  const handleChipClick = (pr, prompt) => {
    const updatedPrs = prs.map(p =>
      p.id === pr.id ? { ...p, selectedPrompt: prompt } : p
    );
    setPrs(updatedPrs);
  };

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container component="main" maxWidth="lg" sx={{ py: 8 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 3,
            p: 4,
          }}
        >
          <Typography variant="h3" gutterBottom>
            PRVigil
          </Typography>
          <Typography variant="h6" gutterBottom>
            Enter the GitHub repository to get suggestions and select PRs for analysis.
          </Typography>
          {!repoSelected && (
            <TextField
              label="GitHub Repository"
              variant="outlined"
              value={repo}
              onChange={(e) => setRepo(e.target.value)}
              fullWidth
              margin="normal"
              InputProps={{
                endAdornment: (
                  <IconButton onClick={() => setRepo('')}>
                    <ClearIcon />
                  </IconButton>
                ),
              }}
            />
          )}
          {searchSuggestions.length > 0 && !repoSelected && (
            <RepoSuggestions
              searchSuggestions={searchSuggestions}
              handleRepoSelection={handleRepoSelection}
            />
          )}
          {repoSelected && prs.length > 0 && (
            <>
              <Box sx={{ width: '100%', mt: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Pull Requests
                </Typography>
                <PRList
                  prs={prs}
                  selectedPrs={selectedPrs}
                  handlePrSelection={handlePrSelection}
                  handleChipClick={handleChipClick}
                  promptOptions={promptOptions}
                />
              </Box>
              <Button
                variant="contained"
                color="primary"
                onClick={openModal}
                disabled={selectedPrs.length === 0}
                sx={{ mt: 2, mb: 2 }}
              >
                Analyze Selected PRs
              </Button>
            </>
          )}
          {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
          {analysisResults.length > 0 && (
            <AnalysisResults
              analysisResults={analysisResults}
              repo={repo}
            />
          )}
        </Box>
      </Container>
      <AnalyzeModal
        modalOpen={modalOpen}
        closeModal={closeModal}
        handleAnalyze={handleAnalyze}
        loading={loading}
      />
    </ThemeProvider>
  );
}

export default App;
