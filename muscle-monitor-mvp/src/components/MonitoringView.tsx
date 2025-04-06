
import React from 'react';
import { SensorReading, TrainingType } from '@/lib/types';
import MuscleFatigueMap from './MuscleFatigueMap';
import ForceOutputGraph from './ForceOutputGraph';
import CurrentMetrics from './CurrentMetrics';
import { Activity } from 'lucide-react';

interface MonitoringViewProps {
  currentReading: SensorReading;
  allReadings: SensorReading[];
  trainingType: TrainingType;
  sessionDuration: number; // in seconds
  onEndSession: () => void;
}

const MonitoringView: React.FC<MonitoringViewProps> = ({ 
  currentReading, 
  allReadings,
  trainingType,
  sessionDuration,
  onEndSession
}) => {
  return (
    <div className="w-full max-w-6xl mx-auto py-8 px-4 animate-fade-in">
        <h1 className="text-5xl font-bold text-matstat-blue-dark mb-8 text-center flex items-center justify-center font-[Tahoma]">
          <Activity className="h-7 w-7 mr-2 text-matstat-blue" />
          Real-time Monitoring
        </h1>      

        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
  {/* <h1 className="text-5xl font-bold text-matstat-blue-dark text-center sm:text-left flex items-center justify-center sm:justify-start font-[Tahoma]">
    <Activity className="h-7 w-7 mr-2 text-matstat-blue" />
    Real-time Monitoring
  </h1> */}

  {(
    <button
      className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-md shadow-sm transition"
      onClick={onEndSession}
    >
      End Session
    </button>
  )}
</div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <MuscleFatigueMap sensors={currentReading.sensors} />
        </div>
        
        <div className="md:col-span-2 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ForceOutputGraph 
              readings={allReadings}
              muscleGroup="quads"
            />
            
            <ForceOutputGraph 
              readings={allReadings}
              muscleGroup="hams"
            />
          </div>
          
          <CurrentMetrics 
            reading={currentReading}
            trainingType={trainingType}
            sessionDuration={sessionDuration}
          />
        </div>
      </div>
    </div>
  );
};

export default MonitoringView;
