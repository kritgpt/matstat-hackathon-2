
import React from 'react';
import { SensorReading, TrainingType } from '@/lib/types';
import { ArrowDown, ArrowUp, ArrowRight, AlertTriangle, Timer, Activity, Scale, BarChart2 } from 'lucide-react';

interface CurrentMetricsProps {
  reading: SensorReading;
  trainingType: TrainingType;
  sessionDuration: number; // in seconds
}

// Training type to display name mapping
const trainingTypeNames: Record<TrainingType, string> = {
  'high-intensity': 'High Intensity',
  'endurance': 'Endurance',
  'strength': 'Strength',
  'recovery': 'Recovery'
};

// Training type to intensity level mapping
const trainingIntensityLevels: Record<TrainingType, string> = {
  'high-intensity': 'High',
  'endurance': 'Moderate',
  'strength': 'High',
  'recovery': 'Low'
};

const CurrentMetrics: React.FC<CurrentMetricsProps> = ({ reading, trainingType, sessionDuration }) => {
  // Get metrics for each sensor
  const getMetrics = () => {
    return reading.sensors.map(sensor => {
      const outputPercentage = (sensor.output / sensor.baseline) * 100;
      let trend: 'up' | 'down' | 'stable' = 'stable';
      
      // Determine trend based on output percentage
      if (outputPercentage < 95) trend = 'down';
      else if (outputPercentage > 105) trend = 'up';
      
      return {
        id: sensor.id,
        label: sensor.label,
        output: Math.round(outputPercentage),
        trend
      };
    });
  };
  
  const metrics = getMetrics();
  
  // Calculate left/right differences
  const leftQuad = metrics.find(m => m.label.includes('Left Quadriceps'));
  const rightQuad = metrics.find(m => m.label.includes('Right Quadriceps'));
  const leftHam = metrics.find(m => m.label.includes('Left Hamstring'));
  const rightHam = metrics.find(m => m.label.includes('Right Hamstring'));
  
  const quadDiff = leftQuad && rightQuad ? Math.abs(leftQuad.output - rightQuad.output) : 0;
  const hamDiff = leftHam && rightHam ? Math.abs(leftHam.output - rightHam.output) : 0;
  
  // Format session duration display
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };
  
  // Render trend indicator icon
  const renderTrendIcon = (trend: string) => {
    if (trend === 'down') {
      return <ArrowDown size={16} className="text-matstat-alert-danger" />;
    }
    if (trend === 'up') {
      return <ArrowUp size={16} className="text-matstat-alert-success" />;
    }
    return <ArrowRight size={16} className="text-gray-400" />;
  };

  return (
    <div className="card-base p-5">
      <h3 className="section-title mb-4">
        <Scale size={18} className="mr-2 text-matstat-blue" />
        Current Metrics
      </h3>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {metrics.map(metric => (
          <div key={metric.id} className="stat-card">
            <div className="text-sm text-gray-500 mb-1">{metric.label}</div>
            <div className="flex items-center">
              <span className="text-xl font-bold text-matstat-blue-dark">{metric.output}%</span>
              <span className="ml-2">{renderTrendIcon(metric.trend)}</span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="stat-card">
          <div className="text-sm text-gray-500 mb-1 flex items-center">
            <Timer size={14} className="mr-1 text-matstat-blue" />
            Time Elapsed
          </div>
          <div className="text-xl font-bold text-matstat-blue-dark">
            {formatDuration(sessionDuration)}
          </div>
        </div>
        
        <div className="stat-card">
          <div className="text-sm text-gray-500 mb-1 flex items-center">
            <Activity size={14} className="mr-1 text-matstat-blue" />
            Training Type
          </div>
          <div className="text-xl font-bold text-matstat-blue-dark">
            {trainingTypeNames[trainingType]}
          </div>
        </div>
      </div>
      
      <div className="mt-4 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-100 space-y-2.5">
        <div className="flex justify-between items-center">
          <span className="text-sm flex items-center text-matstat-blue-dark">
            <BarChart2 size={14} className="mr-1.5 text-matstat-blue" />
            Intensity Level:
          </span>
          <span className="font-medium text-matstat-blue-dark">{trainingIntensityLevels[trainingType]}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm">Quad Asymmetry:</span>
          <div className="flex items-center">
            <span className={`font-medium ${quadDiff > 10 ? 'text-matstat-alert-danger' : 'text-matstat-blue-dark'}`}>
              {quadDiff}%
            </span>
            {quadDiff > 10 && (
              <AlertTriangle size={14} className="ml-1 text-matstat-alert-danger" />
            )}
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm">Ham Asymmetry:</span>
          <div className="flex items-center">
            <span className={`font-medium ${hamDiff > 10 ? 'text-matstat-alert-danger' : 'text-matstat-blue-dark'}`}>
              {hamDiff}%
            </span>
            {hamDiff > 10 && (
              <AlertTriangle size={14} className="ml-1 text-matstat-alert-danger" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrentMetrics;
