
// Sensor data types
export interface SensorData {
  id: number;
  output: number;
  location: 'left-quad' | 'right-quad' | 'left-ham' | 'right-ham';
  label: string;
  baseline: number;
}

export interface SensorReading {
  timestamp: number;
  sensors: SensorData[];
}

export type TrainingType = 'high-intensity' | 'endurance' | 'strength' | 'recovery';

export interface SessionData {
  id: string;
  trainingType: TrainingType;
  startTime: number;
  endTime?: number;
  readings: SensorReading[];
}

export interface AlertData {
  triggered: boolean;
  type: 'asymmetry' | 'overexertion' | 'none';
  affectedMuscle?: string;
  severity: 'low' | 'moderate' | 'high';
  metrics: {
    current: number;
    threshold: number;
    difference?: number;
  };
  recommendation: string;
}

export type SessionStatus = 'setup' | 'monitoring' | 'alert' | 'summary';
