import React from 'react';
import { Box, Typography, Card, CardContent, CardActions, Button } from '@mui/material';

const RepoSuggestions = ({ searchSuggestions, handleRepoSelection }) => (
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
);

export default RepoSuggestions;
