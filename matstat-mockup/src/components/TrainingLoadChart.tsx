import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Paper, Typography } from '@mui/material';

// Mock historical data for fatigue onset
const mockHistoricalData = [
  { session: 'S-5', fatigueOnsetTime: 35 }, // Time in minutes when fatigue > 15% was first detected
  { session: 'S-4', fatigueOnsetTime: 38 },
  { session: 'S-3', fatigueOnsetTime: 32 }, // Maybe pushed too hard
  { session: 'S-2', fatigueOnsetTime: 40 },
  { session: 'S-1', fatigueOnsetTime: 42 }, // Showing improvement
];

const TrainingLoadChart: React.FC = () => {
  return (
    <Paper elevation={2} sx={{ p: 2, mt: 2 }}>
      <Typography variant="h6" gutterBottom>Training Load Optimization (Example Trend)</Typography>
      <Typography variant="body2" sx={{ mb: 2 }}>
        Example: Time to reach fatigue threshold (15%) over recent sessions. Higher values suggest better load management or fitness.
      </Typography>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart
          data={mockHistoricalData}
          margin={{
            top: 5, right: 30, left: 20, bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="session" />
          <YAxis label={{ value: 'Time (min)', angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Legend />
          <Bar dataKey="fatigueOnsetTime" fill="#82ca9d" name="Time to Fatigue Threshold" />
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export default TrainingLoadChart;
