import React from 'react'; // Removed useState, useEffect
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux'; // Import useSelector
import { Typography, Container, Box, Grid, CircularProgress, Alert } from '@mui/material';
import VisualBodyDiagram from '../components/VisualBodyDiagram';
import RealTimeForceChart from '../components/RealTimeForceChart';
import SessionSummary from '../components/SessionSummary';
import TrainingLoadChart from '../components/TrainingLoadChart';
import { RootState } from '../store/store'; // Import RootState type
// Athlete type is implicitly used via RootState

const AthleteDetailView: React.FC = () => {
  const { athleteId } = useParams<{ athleteId: string }>();

  // Select the specific athlete from the Redux store
  const athlete = useSelector((state: RootState) =>
    state.athletes.athletes.find(a => a.id === athleteId)
  );

  // Loading state can be simplified or removed if initial state is guaranteed
  // For robustness, we check if athlete exists after selection
  if (!athlete) {
     // Could show loading spinner briefly, but selector should update quickly
    return <Container sx={{ mt: 5 }}><Alert severity="error">Athlete not found or data loading...</Alert></Container>;
  }

  // Example: Focus on Right Hamstring for the chart
  const targetMuscle = athlete.muscleGroups.rightHamstring;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Athlete Detail: {athlete.name} ({athlete.status})
      </Typography>
      {/* Show recovery specific info if applicable */}
      {athlete.status === 'Recovering' && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Recovery Phase: Focus on gradual load increase and symmetry. Current progress shown below.
        </Alert>
      )}
      <Grid container spacing={3}>
        {/* Left side: Body Diagram */}
        <Grid size={{ xs: 12, md: 5 }}>
          <VisualBodyDiagram muscleGroups={athlete.muscleGroups} /> {/* Use the new component */}
        </Grid>
        {/* Right side: Charts and Info */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Typography variant="h6" gutterBottom>
            {athlete.status === 'Recovering' ? 'Recovery Data' : 'Real-time Data'}
          </Typography>
          {/* Show recovery progress instead of real-time chart if recovering */}
          {athlete.status === 'Recovering' ? (
             <Box sx={{ mt: 2 }}>
               <Typography variant="subtitle1">Recovery Progress:</Typography>
               <ul style={{ paddingLeft: '20px', marginTop: '5px' }}>
                 {Object.values(athlete.muscleGroups).map(muscle => (
                   <li key={muscle.name}>
                     {muscle.name}: {muscle.currentForce.toFixed(1)} / {muscle.baselineForce}
                     ({((muscle.currentForce / muscle.baselineForce) * 100).toFixed(1)}% of Baseline)
                     {muscle.isAsymmetrical && " (Asymmetry Detected)"}
                   </li>
                 ))}
               </ul>
             </Box>
          ) : targetMuscle ? (
            <RealTimeForceChart
              muscleName={targetMuscle.name}
              baselineForce={targetMuscle.baselineForce}
              currentForce={targetMuscle.currentForce}
              fatigueThresholdPercent={85} // Example threshold
            />
          ) : (
            <Typography>Selected muscle data not available.</Typography>
          )}
          {/* TODO: Add AlertNotification component here based on athlete.status or muscle.isFatigued */}
           {athlete.status === 'Fatigued' && (
             <Alert severity="warning" sx={{ mt: 2 }}>
               Fatigue detected in {Object.values(athlete.muscleGroups).find(m => m.isFatigued)?.name || 'a muscle group'}! Consider modifying training.
             </Alert>
           )}
           {/* Check for any asymmetrical muscle */}
           {Object.values(athlete.muscleGroups).some(m => m.isAsymmetrical) && (
             <Alert severity="info" sx={{ mt: 2 }}>
               Asymmetrical load detected in {Object.values(athlete.muscleGroups).filter(m => m.isAsymmetrical).map(m => m.name).join(', ')}! Check movement patterns.
             </Alert>
           )}
        </Grid>
        {/* Session Summary */}
        <Grid size={{ xs: 12 }}>
          {/* Pass a mock session ID */}
          <SessionSummary sessionId={`session-99`} />
        </Grid>
         {/* Training Load Optimization */}
         <Grid size={{ xs: 12 }}>
           <TrainingLoadChart />
        </Grid>
      </Grid>
    </Container>
  );
};

export default AthleteDetailView;
