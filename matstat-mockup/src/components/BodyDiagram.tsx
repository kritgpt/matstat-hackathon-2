import React from 'react';
import { Box, Typography } from '@mui/material';
import { MuscleData } from '../mockData'; // Import type if needed for props later

interface BodyDiagramProps {
  muscleGroups: { [key: string]: MuscleData };
  // Add props later to highlight specific muscles based on fatigue/asymmetry
}

const BodyDiagram: React.FC<BodyDiagramProps> = ({ muscleGroups }) => {
  // TODO: Implement actual SVG or div-based body diagram
  // For now, just display a placeholder and list muscle status

  const getMuscleStyle = (muscle: MuscleData): React.CSSProperties => {
    let style: React.CSSProperties = {};
    if (muscle.isFatigued) {
      style.color = 'orange';
      style.fontWeight = 'bold';
    }
    if (muscle.isAsymmetrical) {
      // Use a border or background to highlight asymmetry more clearly than just italics
      style.border = '1px solid red';
      style.padding = '2px';
      style.margin = '1px 0';
      style.display = 'inline-block'; // Needed for padding/border to apply correctly on li
    }
    return style;
  };

  return (
    <Box sx={{ border: '1px solid lightgrey', p: 2, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <Typography variant="h6" gutterBottom>Body Diagram (Placeholder)</Typography>
      <Typography variant="caption">Visual representation goes here.</Typography>
      <Box mt={2} sx={{ textAlign: 'left', width: '100%' }}>
        <Typography variant="subtitle2">Monitored Muscles:</Typography>
        <ul style={{ paddingLeft: '20px', marginTop: '5px' }}>
          {Object.values(muscleGroups).map(muscle => (
            <li key={muscle.name}>
              <span style={getMuscleStyle(muscle)}>
                {muscle.name}: {muscle.currentForce.toFixed(1)} / {muscle.baselineForce} ({muscle.fatiguePercentage.toFixed(1)}% fatigue)
                {muscle.isFatigued && " (Fatigued)"}
                {muscle.isAsymmetrical && " (ASYMMETRY DETECTED)"}
              </span>
            </li>
          ))}
        </ul>
      </Box>
    </Box>
  );
};

export default BodyDiagram;
