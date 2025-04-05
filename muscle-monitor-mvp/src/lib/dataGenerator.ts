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
    // Create a gradual decline that speeds up slightly over time
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

// Generate data patterns based on training type
export const generateSessionData = (
  duration: number = 180, // 3 minutes
  trainingType: TrainingType = 'high-intensity',
  triggerAlert: boolean = true
): SensorReading[] => {
  // Generate default patterns for all muscles
  let leftQuadData = createNormalFatigue(duration);
  const rightQuadData = createNormalFatigue(duration);
  let leftHamData = createNormalFatigue(duration);
  let rightHamData = createNormalFatigue(duration);
  
  // If we want to trigger an alert, create a specific muscle fatigue
  if (triggerAlert) {
    // Right hamstring will have more fatigue to trigger an alert
    rightHamData = createMuscleFatigue(duration);
    
    // If it's high intensity, also make the left quad fatigue more
    if (trainingType === 'high-intensity') {
      leftQuadData = createMuscleFatigue(duration, SENSOR_BASELINE, 0.8);
    }
  }
  
  // Create the full set of readings
  return Array(duration).fill(0).map((_, index) => {
    return {
      timestamp: Date.now() + (index * 1000), // One reading per second
      sensors: [
        {
          ...initialSensorData[0],
          output: leftQuadData[index]
        },
        {
          ...initialSensorData[1],
          output: rightQuadData[index]
        },
        {
          ...initialSensorData[2],
          output: leftHamData[index]
        },
        {
          ...initialSensorData[3],
          output: rightHamData[index]
        }
      ]
    };
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

// Generate a modified dataset after intervention
export const generateRecoveryData = (
  currentReading: SensorReading,
  duration: number = 60 // 1 minute of recovery data
): SensorReading[] => {
  // Create recovery patterns for each sensor
  return Array(duration).fill(0).map((_, index) => {
    return {
      timestamp: currentReading.timestamp + ((index + 1) * 1000),
      sensors: currentReading.sensors.map(sensor => {
        // More recovery for the most fatigued muscles
        const fatigueRatio = sensor.output / sensor.baseline;
        let recoveryPattern: number[];
        
        if (fatigueRatio < 0.75) {
          // Heavily fatigued - significant recovery
          recoveryPattern = createRecoveryPattern(duration, sensor.output, sensor.baseline);
        } else if (fatigueRatio < 0.9) {
          // Moderately fatigued - moderate recovery
          recoveryPattern = createRecoveryPattern(duration, sensor.output, sensor.baseline);
        } else {
          // Not very fatigued - maintain or slight fatigue
          recoveryPattern = createNormalFatigue(duration, sensor.output);
        }
        
        return {
          ...sensor,
          output: recoveryPattern[index]
        };
      })
    };
  });
};
