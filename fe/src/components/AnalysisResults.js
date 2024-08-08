import React from 'react';
import { Box, Accordion, AccordionSummary, AccordionDetails, Typography, Paper } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ReactMarkdown from 'react-markdown';
import * as Diff2Html from 'diff2html';
import 'diff2html/bundles/css/diff2html.min.css';

const renderDiff = (diff) => {
  if (!diff) return null;
  const htmlDiff = Diff2Html.html(diff, { inputFormat: 'diff', outputFormat: 'html' });
  return <div dangerouslySetInnerHTML={{ __html: htmlDiff }} />;
};

const AnalysisResults = ({ analysisResults, repo }) => (
  <>
    {analysisResults.map(result => (
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
  </>
);

export default AnalysisResults;
