import React from 'react';
import { Card, CardContent, Typography, Chip, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { Athlete } from '../mockData'; // Import the Athlete type

interface AthleteCardProps {
  athlete: Athlete;
}

const getStatusColor = (status: Athlete['status']): 'default' | 'warning' | 'error' | 'success' | 'info' => {
  switch (status) {
    case 'Training':
      return 'info';
    case 'Fatigued':
      return 'warning';
    case 'Injured':
      return 'error';
    case 'Recovering':
      return 'success';
    case 'Idle':
    default:
      return 'default';
  }
};

const AthleteCard: React.FC<AthleteCardProps> = ({ athlete }) => {
  return (
    <Card sx={{ minWidth: 275, mb: 2, textDecoration: 'none' }} component={RouterLink} to={`/athlete/${athlete.id}`}>
      <CardContent>
        <Typography variant="h6" component="div" gutterBottom>
          {athlete.name}
        </Typography>
        <Typography sx={{ mb: 1.5 }} color="text.secondary">
          {athlete.sport}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Chip label={athlete.status} color={getStatusColor(athlete.status)} size="small" />
        </Box>
      </CardContent>
    </Card>
  );
};

export default AthleteCard;
