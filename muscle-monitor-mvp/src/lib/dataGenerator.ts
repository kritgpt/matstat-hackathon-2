import { SensorReading, SensorData, TrainingType, AlertData } from './types';

// Constants
const SENSOR_BASELINE = 100;
const ASYMMETRY_THRESHOLD = 15; // 15% difference between left/right
const OVEREXERTION_THRESHOLD = 85; // 85% of baseline

// Initial sensor data
export const initialSensorData: SensorData[] = [
  { id: 1, output: SENSOR_BASELINE, location: 'left-quad', label: 'Left Quadriceps', baseline: SENSOR_BASELINE },
  { id: 2, output: SENSOR_BASELINE, location: 'right-quad', label: 'Right Quadriceps', baseline: SENSOR_BASELINE },
  { id: 3, output: SENSOR_BASELINE, location: 'left-ham', label: 'Left Hamstring', baseline: SENSOR_BASELINE },
  { id: 4, output: SENSOR_BASELINE, location: 'right-ham', label: 'Right Hamstring', baseline: SENSOR_BASELINE }
];

// Create a normal fatigue pattern (gradual decline)
const createNormalFatigue = (duration: number, startValue: number = SENSOR_BASELINE): number[] => {
  return Array(duration).fill(0).map((_, index) => {
    // Create a grahttp://localhost:8080/dual decline that speeds up slightly over time
    const timeRatio = index / duration;
    const decline = startValue * (0.05 + (timeRatio * 0.2));
    
    // Add some random noise
    const noise = (Math.random() * 5) - 2.5;
    
    return Math.max(startValue - decline + noise, startValue * 0.6);
  });
};

// Create a specific muscle fatigue pattern (more rapid decline for one muscle)
const createMuscleFatigue = (
  duration: number, 
  startValue: number = SENSOR_BASELINE,
  targetFatigue: number = 0.7 // Target is 70% of baseline
): number[] => {
  const midpoint = Math.floor(duration * 0.6); // Decline until 60% of the way through
  
  return Array(duration).fill(0).map((_, index) => {
    let value: number;
    
    if (index < midpoint) {
      // Accelerated decline phase
      const declineRatio = index / midpoint;
      const targetValue = startValue * (1 - ((1 - targetFatigue) * declineRatio));
      value = targetValue;
    } else {
      // Even more fatigued with slight fluctuation
      const targetValue = startValue * targetFatigue;
      const fluctuation = (Math.random() * 5) - 2;
      value = targetValue + fluctuation;
    }
    
    return Math.max(value, startValue * 0.5); // Never go below 50% of baseline
  });
};

// Create a recovery pattern after intervention
const createRecoveryPattern = (
  duration: number, 
  startValue: number,
  baselineValue: number = SENSOR_BASELINE
): number[] => {
  return Array(duration).fill(0).map((_, index) => {
    // Recovery that starts slow and then accelerates
    const timeRatio = index / duration;
    const recovery = (baselineValue - startValue) * (timeRatio * 1.2);
    
    // Add some random noise
    const noise = (Math.random() * 3) - 1.5;
    
    return Math.min(startValue + recovery + noise, baselineValue * 0.95);
  });
};

// Check for alerts based on sensor data
export const checkForAlerts = (reading: SensorReading): AlertData => {
  const leftQuad = reading.sensors.find(s => s.location === 'left-quad');
  const rightQuad = reading.sensors.find(s => s.location === 'right-quad');
  const leftHam = reading.sensors.find(s => s.location === 'left-ham');
  const rightHam = reading.sensors.find(s => s.location === 'right-ham');
  
  if (!leftQuad || !rightQuad || !leftHam || !rightHam) {
    return {
      triggered: false,
      type: 'none',
      severity: 'low',
      metrics: {
        current: 0,
        threshold: 0
      },
      recommendation: ''
    };
  }
  
  // Check for asymmetry in quads
  const quadDiff = Math.abs((leftQuad.output / leftQuad.baseline) - (rightQuad.output / rightQuad.baseline)) * 100;
  
  // Check for asymmetry in hamstrings
  const hamDiff = Math.abs((leftHam.output / leftHam.baseline) - (rightHam.output / rightHam.baseline)) * 100;
  
  // Check for overexertion
  const muscles = [leftQuad, rightQuad, leftHam, rightHam];
  const lowestOutput = Math.min(...muscles.map(m => (m.output / m.baseline) * 100));
  
  // Find the most fatigued muscle
  const mostFatigued = muscles.reduce((prev, current) => 
    (current.output / current.baseline < prev.output / prev.baseline) ? current : prev
  );
  
  // Generate alert if needed
  if (hamDiff > ASYMMETRY_THRESHOLD || quadDiff > ASYMMETRY_THRESHOLD) {
    // Asymmetry alert
    const diff = Math.max(quadDiff, hamDiff);
    const muscleGroup = quadDiff > hamDiff ? 'Quadriceps' : 'Hamstrings';
    const severity = diff > 25 ? 'high' : diff > 20 ? 'moderate' : 'low';
    
    return {
      triggered: true,
      type: 'asymmetry',
      affectedMuscle: muscleGroup,
      severity,
      metrics: {
        current: Math.round(diff),
        threshold: ASYMMETRY_THRESHOLD,
        difference: Math.round(diff - ASYMMETRY_THRESHOLD)
      },
      recommendation: `Reduce ${muscleGroup.toLowerCase()} training intensity by ${severity === 'high' ? '50%' : '30%'} and focus on balanced technique.`
    };
  } else if (lowestOutput < OVEREXERTION_THRESHOLD) {
    // Overexertion alert
    const percentBelow = Math.round(OVEREXERTION_THRESHOLD - lowestOutput);
    const severity = percentBelow > 15 ? 'high' : percentBelow > 8 ? 'moderate' : 'low';
    
    return {
      triggered: true,
      type: 'overexertion',
      affectedMuscle: mostFatigued.label,
      severity,
      metrics: {
        current: Math.round(lowestOutput),
        threshold: OVEREXERTION_THRESHOLD
      },
      recommendation: `Reduce overall training intensity by ${severity === 'high' ? '50%' : '30%'} for the next 5-10 minutes.`
    };
  }
  
  return {
    triggered: false,
    type: 'none',
    severity: 'low',
    metrics: {
      current: 0,
      threshold: 0
    },
    recommendation: ''
  };
};
