import React, { useEffect } from 'react';
import { Typography, Container, Grid } from '@mui/material';
import AthleteCard from '../components/AthleteCard';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store/store'; // Import RootState and AppDispatch types
import { runSimulationTick } from '../store/athletesSlice'; // Import the action

const CoachDashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  // Select athletes data from the Redux store
  const athletes = useSelector((state: RootState) => state.athletes.athletes);


  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Coach Dashboard
      </Typography>
      <Grid container spacing={3}>
        {athletes.map((athlete) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={athlete.id}>
            <AthleteCard athlete={athlete} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default CoachDashboard;
