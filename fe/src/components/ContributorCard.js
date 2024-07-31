import React from 'react';
import { Card, CardContent, Typography, Avatar, Grid } from '@mui/material';

const ContributorCard = ({ user }) => {
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <Avatar src={user.avatar_url} alt={user.login} />
          </Grid>
          <Grid item xs>
            <Typography variant="h6">{user.login}</Typography>
            <Typography variant="body2">
              Genuineness: {user.genuineness ? 'Genuine' : 'Not Genuine'}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default ContributorCard;
