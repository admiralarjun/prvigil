import React from 'react';
import { Card, CardContent, Typography, Stack, Chip } from '@mui/material';

const PRCard = ({ pr, selected, handlePrSelection, handleChipClick, promptOptions }) => (
  <Card
    sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      border: selected ? '2px solid blue' : '1px solid grey',
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
);

export default PRCard;
