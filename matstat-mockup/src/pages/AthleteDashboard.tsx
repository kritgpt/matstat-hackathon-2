import React from 'react'; // Removed useState, useEffect
import { useSelector } from 'react-redux'; // Import useSelector
import { Typography, Container, Box, Grid, CircularProgress, Alert } from '@mui/material';
import VisualBodyDiagram from '../components/VisualBodyDiagram';
import RealTimeForceChart from '../components/RealTimeForceChart';
import SessionSummary from '../components/SessionSummary';
import TrainingLoadChart from '../components/TrainingLoadChart';
import { RootState } from '../store/store'; // Import RootState type
// Athlete type is implicitly used via RootState

// Hardcode the athlete ID for this specific dashboard mockup
const ATHLETE_ID = 'kabir-mehta';

const AthleteDashboard: React.FC = () => {

  // Select the specific athlete from the Redux store
  const athlete = useSelector((state: RootState) =>
    state.athletes.athletes.find(a => a.id === ATHLETE_ID)
  );

  if (!athlete) {
     // Could show loading spinner briefly, but selector should update quickly
    return <Container sx={{ mt: 5 }}><Alert severity="error">Athlete data not found or data loading...</Alert></Container>;
  }

  // Example: Focus on Right Hamstring for the chart, as it's injury-prone for Kabir
  const targetMuscle = athlete.muscleGroups.rightHamstring;
  const otherMuscle = athlete.muscleGroups.leftHamstring; // For comparison maybe

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        My Dashboard ({athlete.name})
      </Typography>
       <Typography variant="h6" component="h2" gutterBottom>
        Current Status: {athlete.status}
      </Typography>
       {athlete.status === 'Fatigued' && (
         <Alert severity="warning" sx={{ mb: 2 }}>
           Fatigue detected in {Object.values(athlete.muscleGroups).find(m => m.isFatigued)?.name || 'a muscle group'}! Consider modifying training or resting.
         </Alert>
       )}
      <Grid container spacing={3}>
        {/* Left side: Body Diagram */}
        <Grid size={{ xs: 12, md: 5 }}>
          <VisualBodyDiagram muscleGroups={athlete.muscleGroups} /> {/* Use the new component */}
        </Grid>
        {/* Right side: Charts and Info */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Typography variant="h6" gutterBottom>Key Muscle Data (Right Hamstring)</Typography>
          {targetMuscle ? (
            <RealTimeForceChart
              muscleName={targetMuscle.name}
              baselineForce={targetMuscle.baselineForce}
              currentForce={targetMuscle.currentForce}
              fatigueThresholdPercent={85} // Example threshold
            />
          ) : (
            <Typography>Right Hamstring data not available.</Typography>
          )}
          {/* Could add another chart for comparison or other key muscles */}
        </Grid>
        {/* Session Summary */}
        <Grid size={{ xs: 12 }}>
           {/* Pass a mock session ID */}
           <SessionSummary sessionId={`session-${Date.now().toString().slice(-6)}`} />
        </Grid>
         {/* Training Load Optimization */}
         <Grid size={{ xs: 12 }}>
           <TrainingLoadChart />
        </Grid>
      </Grid>
    </Container>
  );
};

export default AthleteDashboard;
