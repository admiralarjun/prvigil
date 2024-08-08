import React from 'react';
import { Grid } from '@mui/material';
import PRCard from './PRCard';

const PRList = ({ prs, selectedPrs, handlePrSelection, handleChipClick, promptOptions }) => (
  <Grid container spacing={2} sx={{ maxHeight: '400px', overflowY: 'auto' }}>
    {prs.map((pr) => (
      <Grid item xs={12} sm={6} md={4} key={pr.id}>
        <PRCard
          pr={pr}
          selected={selectedPrs.some(selected => selected.id === pr.id)}
          handlePrSelection={handlePrSelection}
          handleChipClick={handleChipClick}
          promptOptions={promptOptions}
        />
      </Grid>
    ))}
  </Grid>
);

export default PRList;
