import React from 'react';
import { Box, Typography, Paper, Grid } from '@mui/material';

interface SessionSummaryProps {
  // In a real app, this would take session data as props
  sessionId: string; // Example prop
}

// Mock data for the summary
const mockSummary = {
  duration: '45 min',
  maxFatiguePercent: 28.5,
  fatiguedMuscles: ['Right Hamstring'],
  asymmetryEvents: 3,
  peakForceMuscle: 'Left Quadriceps',
  peakForceValue: 119.5,
};

const SessionSummary: React.FC<SessionSummaryProps> = ({ sessionId }) => {
  return (
    <Paper elevation={2} sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>Session Summary (ID: {sessionId})</Typography>
      <Grid container spacing={1}>
        <Grid size={{ xs: 6 }}><Typography variant="body2">Duration:</Typography></Grid>
        <Grid size={{ xs: 6 }}><Typography variant="body2">{mockSummary.duration}</Typography></Grid>

        <Grid size={{ xs: 6 }}><Typography variant="body2">Max Fatigue:</Typography></Grid>
        <Grid size={{ xs: 6 }}><Typography variant="body2">{mockSummary.maxFatiguePercent.toFixed(1)}% ({mockSummary.fatiguedMuscles.join(', ')})</Typography></Grid>

        <Grid size={{ xs: 6 }}><Typography variant="body2">Asymmetry Events:</Typography></Grid>
        <Grid size={{ xs: 6 }}><Typography variant="body2">{mockSummary.asymmetryEvents}</Typography></Grid>

        <Grid size={{ xs: 6 }}><Typography variant="body2">Peak Force:</Typography></Grid>
        <Grid size={{ xs: 6 }}><Typography variant="body2">{mockSummary.peakForceValue.toFixed(1)} ({mockSummary.peakForceMuscle})</Typography></Grid>
      </Grid>
    </Paper>
  );
};

export default SessionSummary;
