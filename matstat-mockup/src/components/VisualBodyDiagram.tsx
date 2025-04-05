import React from 'react';
import { Box, Typography, Tooltip } from '@mui/material';
import { MuscleData } from '../mockData';

interface VisualBodyDiagramProps {
  muscleGroups: { [key: string]: MuscleData };
}

// Simple mapping from our data keys to body parts (can be expanded)
const muscleToPartMapping: { [key: string]: string } = {
  rightHamstring: 'rightLeg',
  leftHamstring: 'leftLeg',
  rightQuad: 'rightLeg',
  leftQuad: 'leftLeg',
  rightShoulder: 'rightArm',
  leftShoulder: 'leftArm',
  rightKnee: 'rightLeg', // Simplified
  leftKnee: 'leftLeg', // Simplified
  // Add more mappings as needed
};

const VisualBodyDiagram: React.FC<VisualBodyDiagramProps> = ({ muscleGroups }) => {

  const getPartStatus = (partName: string): { fatigue: number, asymmetry: boolean, muscles: MuscleData[] } => {
    const relevantMuscles = Object.values(muscleGroups).filter(
      muscle => muscleToPartMapping[muscle.name.toLowerCase().replace(/ /g, '')] === partName
    );

    if (relevantMuscles.length === 0) {
      return { fatigue: 0, asymmetry: false, muscles: [] };
    }

    const maxFatigue = Math.max(0, ...relevantMuscles.map(m => m.fatiguePercentage));
    const hasAsymmetry = relevantMuscles.some(m => m.isAsymmetrical);

    return { fatigue: maxFatigue, asymmetry: hasAsymmetry, muscles: relevantMuscles };
  };

  const getPartStyle = (partName: string): React.CSSProperties => {
    const status = getPartStatus(partName);
    let style: React.CSSProperties = {
      border: '1px solid grey',
      minHeight: '50px',
      margin: '2px',
      textAlign: 'center',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'background-color 0.3s ease',
      backgroundColor: 'rgba(0, 0, 255, 0.1)', // Default light blue
    };

    if (status.asymmetry) {
      style.border = '2px solid red'; // Highlight asymmetry strongly
    }

    if (status.fatigue > 0) {
      // Fade to orange/red based on fatigue level (max 50% fatigue for full orange)
      const fatigueRatio = Math.min(1, status.fatigue / 50);
      style.backgroundColor = `rgba(255, ${165 * (1 - fatigueRatio)}, 0, ${0.2 + fatigueRatio * 0.4})`; // Blend towards orange
    }

    return style;
  };

  const renderTooltipContent = (partName: string) => {
    const status = getPartStatus(partName);
    if (status.muscles.length === 0) return "No data";
    return (
      <div>
        {status.muscles.map(m => (
          <Typography key={m.name} variant="caption" display="block">
            {m.name}: {m.currentForce.toFixed(1)}/{m.baselineForce} ({m.fatiguePercentage.toFixed(1)}% fatigue)
            {m.isFatigued ? ' (F!)' : ''}
            {m.isAsymmetrical ? ' (A!)' : ''}
          </Typography>
        ))}
      </div>
    );
  };

  // Basic layout using Boxes
  return (
    <Box sx={{ width: '150px', margin: 'auto' }}>
      {/* Head */}
      {/* <Box sx={{ ...getPartStyle('head'), height: '30px', borderRadius: '50%' }}><Typography variant="caption">Head</Typography></Box> */}
      {/* Torso */}
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        {/* Left Arm */}
        <Tooltip title={renderTooltipContent('leftArm')} placement="left">
          <Box sx={{ ...getPartStyle('leftArm'), width: '30px', height: '80px' }}>
             <Typography variant="caption" sx={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>L Arm</Typography>
          </Box>
        </Tooltip>
        {/* Torso */}
         <Tooltip title={renderTooltipContent('torso')} placement="top">
            <Box sx={{ ...getPartStyle('torso'), width: '60px', height: '100px' }}>
                <Typography variant="caption">Torso</Typography>
            </Box>
        </Tooltip>
        {/* Right Arm */}
         <Tooltip title={renderTooltipContent('rightArm')} placement="right">
            <Box sx={{ ...getPartStyle('rightArm'), width: '30px', height: '80px' }}>
                 <Typography variant="caption" sx={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>R Arm</Typography>
            </Box>
        </Tooltip>
      </Box>
      {/* Legs */}
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        {/* Left Leg */}
         <Tooltip title={renderTooltipContent('leftLeg')} placement="left">
            <Box sx={{ ...getPartStyle('leftLeg'), width: '40px', height: '100px' }}>
                 <Typography variant="caption">L Leg</Typography>
            </Box>
        </Tooltip>
        {/* Right Leg */}
         <Tooltip title={renderTooltipContent('rightLeg')} placement="right">
            <Box sx={{ ...getPartStyle('rightLeg'), width: '40px', height: '100px' }}>
                 <Typography variant="caption">R Leg</Typography>
            </Box>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default VisualBodyDiagram;
