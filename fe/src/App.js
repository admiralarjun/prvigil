import React, { useState, useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  CircularProgress,
  Paper,
  CssBaseline,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Stack,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Grid,
  Modal
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ReactMarkdown from 'react-markdown';
import * as Diff2Html from 'diff2html';
import 'diff2html/bundles/css/diff2html.min.css';
import theme from './theme';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

import axiosInstance from './axiosInstance';

const promptOptions = [
  { label: 'Security', icon: '🔒' },
  { label: 'Compliance', icon: '✔️' },
  { label: 'OWASP', icon: '🛡️' }
];

function App() {
  const [repo, setRepo] = useState('');
  const [prs, setPrs] = useState([]);
  const [selectedPrs, setSelectedPrs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysisResults, setAnalysisResults] = useState([]);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [repoSelected, setRepoSelected] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (repo.length > 2 && !repoSelected) {
      const fetchSuggestions = async () => {
        try {
          const response = await axiosInstance.get(`/api/repo-suggestions/${encodeURIComponent(repo)}`);
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

  useEffect(() => {
    if (repo && repoSelected && selectedPrs.length === 0) {
      const fetchPrs = async () => {
        try {
          const response = await axiosInstance.post('/api/get-prs', { repo });
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
        const response = await axiosInstance.post('/api/analyze-pr', {
          repo: repo,
          prNumber: pr.number,
          prompt: pr.selectedPrompt
        });
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
    setSearchSuggestions([]);
    setPrs([]);
    setSelectedPrs([]);
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
    setPrs(prs.map(p => 
      p.id === pr.id ? { ...p, selectedPrompt: prompt } : p
    ));
  };

  const renderDiff = (diff) => {
    if (!diff) return null;
    const htmlDiff = Diff2Html.html(diff, { inputFormat: 'diff', outputFormat: 'html' });
    return <div dangerouslySetInnerHTML={{ __html: htmlDiff }} />;
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
            <Box sx={{ width: '100%', mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Repository Suggestions
              </Typography>
              {searchSuggestions.map((repo) => (
                <Card key={repo.id} sx={{ mb: 1 }}>
                  <CardContent>
                    <Typography variant="h6">
                      <a href={repo.html_url} target="_blank" rel="noopener noreferrer">{repo.full_name}</a>
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {repo.description}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small" onClick={() => handleRepoSelection(repo.full_name)}>
                      Select Repository
                    </Button>
                  </CardActions>
                </Card>
              ))}
            </Box>
          )}
          {repoSelected && prs.length > 0 && (
            <>
              <Box sx={{ width: '100%', mt: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Pull Requests
                </Typography>
                <Grid container spacing={2} sx={{ maxHeight: '400px', overflowY: 'auto' }}>
  {prs.map((pr) => (
    <Grid item xs={12} sm={6} md={4} key={pr.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                border: selectedPrs.some(selected => selected.id === pr.id) ? '2px solid blue' : '1px solid grey',
                cursor: 'pointer',
                overflow: 'hidden',
              }}
              onClick={() => handlePrSelection(pr)}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" noWrap>
                  <a href={pr.url} target="_blank" rel="noopener noreferrer">{pr.title}</a>
                </Typography>
                <Typography variant="body2" color="textSecondary" noWrap>
                  {pr.body}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  {promptOptions.map(option => (
                    <Chip
                      key={option.label}
                      label={option.label}
                      icon={<span>{option.icon}</span>}
                      color={pr.selectedPrompt === option.label ? 'primary' : 'default'}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleChipClick(pr, option.label);
                      }}
                      sx={{ cursor: 'pointer' }}
                    />
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

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
          {analysisResults.length > 0 && analysisResults.map(result => (
            <Box key={result.pr.id} sx={{ width: '100%', mt: 4 }}>
              <Accordion sx={{ mb: 2 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">{result.pr.title}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body1">
                    <strong>URL:</strong> <a href={result.pr.url} target="_blank" rel="noopener noreferrer">{result.pr.url}</a>
                  </Typography>
                  <Typography variant="body1">
                    <strong>State:</strong> {result.pr.state}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Created At:</strong> {new Date(result.pr.created_at).toLocaleString()}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Updated At:</strong> {new Date(result.pr.updated_at).toLocaleString()}
                  </Typography>
                  <Typography variant="body1">
                    <strong>User:</strong> <a href={`https://github.com/${result.pr.user.login}`} target="_blank" rel="noopener noreferrer">{result.pr.user.login}</a>
                  </Typography>
                  <Typography variant="body1">
                    <strong>Contributor Genuineness Score:</strong> {result.pr.user.genuineness.genuineness_score}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Analysis:</strong>
                  </Typography>
                  <Paper sx={{ p: 2, mt: 2, bgcolor: 'background.paper' }}>
                    <ReactMarkdown>{result.pr.analysis || 'No analysis available'}</ReactMarkdown>
                  </Paper>
                  <Typography variant="body1">
                    <strong>Diffs:</strong>
                  </Typography>
                  {result.pr.diffs && result.pr.diffs.length > 0 ? (
                    result.pr.diffs.map(diff => (
                      <Paper key={diff.filename} sx={{ p: 2, mt: 2, bgcolor: 'background.paper' }}>
                        <Typography variant="subtitle1">
                          <a href={`https://github.com/${repo}/blob/main/${diff.filename}`} target="_blank" rel="noopener noreferrer">{diff.filename}</a>
                        </Typography>
                        {renderDiff(diff.patch)}
                      </Paper>
                    ))
                  ) : (
                    <Typography>No diffs available</Typography>
                  )}
                </AccordionDetails>
              </Accordion>
            </Box>
          ))}

        </Box>
      </Container>

      <Modal
        open={modalOpen}
        onClose={closeModal}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <Box sx={{ p: 4, bgcolor: 'background.paper', borderRadius: 2, maxWidth: 'sm', mx: 'auto', mt: '10%' }}>
          <Typography id="modal-title" variant="h6" component="h2">
            Analyze Selected PRs
          </Typography>
          <Typography id="modal-description" sx={{ mt: 2 }}>
            Click "Analyze" to process the selected pull requests.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={handleAnalyze}
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Analyze'}
          </Button>
        </Box>
      </Modal>
    </ThemeProvider>
  );
}

export default App;
