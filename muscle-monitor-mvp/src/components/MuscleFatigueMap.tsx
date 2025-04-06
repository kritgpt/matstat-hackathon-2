
import React from 'react';
import { SensorData } from '@/lib/types';
import { ArrowDown, ArrowUp, MonitorSmartphone } from 'lucide-react';

interface MuscleFatigueMapProps {
  sensors: SensorData[];
}

const MuscleFatigueMap: React.FC<MuscleFatigueMapProps> = ({ sensors }) => {
  // Function to determine sensor status based on output
  const getSensorStatus = (sensor: SensorData) => {
    const outputPercentage = (sensor.output / sensor.baseline) * 100;
    
    if (outputPercentage >= 90) return 'good';
    if (outputPercentage >= 80) return 'warning';
    return 'danger';
  };
  
  // Get sensors by location
  const leftQuad = sensors.find(s => s.location === 'left-quad');
  const rightQuad = sensors.find(s => s.location === 'right-quad');
  const leftHam = sensors.find(s => s.location === 'left-ham');
  const rightHam = sensors.find(s => s.location === 'right-ham');
  
  // Calculate output percentages
  const getOutputPercentage = (sensor?: SensorData) => {
    if (!sensor) return 0;
    return Math.round((sensor.output / sensor.baseline) * 100);
  };
  
  // Determine if a sensor's value is trending up or down
  const getTrend = (percentage: number) => {
    if (percentage < 95) return 'down';
    if (percentage > 102) return 'up';
    return 'stable';
  };
  
  const renderTrendIndicator = (percentage: number) => {
    const trend = getTrend(percentage);
    if (trend === 'down') {
      return <ArrowDown size={14} className="text-matstat-alert-danger" />;
    }
    if (trend === 'up') {
      return <ArrowUp size={14} className="text-matstat-alert-success" />;
    }
    return null;
  };

  return (
    <div className="card-base p-5 h-full flex flex-col">
      <h3 className="section-title">
        <MonitorSmartphone size={20} className="mr-2 text-matstat-blue" />
        Muscle Fatigue Map
      </h3>
      
      <div className="relative flex-grow bg-[url('../thighs.png')] bg-contain bg-center bg-no-repeat flex items-center justify-center">        {/* Human figure (stylized) */}
        <div className="relative w-[240px] h-[360px]">
          {/* Body outline */}
          {/* <div className="absolute inset-0 bg-gradient-to-b from-gray-100 to-gray-50 rounded-full" style={{ clipPath: 'polygon(40% 0, 60% 0, 65% 10%, 60% 30%, 60% 45%, 80% 90%, 70% 100%, 30% 100%, 20% 90%, 40% 45%, 40% 30%, 35% 10%)' }}></div> */}
          
          {/* Sensor points */}
          {leftQuad && (
            <div 
              className={`absolute top-[35%] left-[30%] sensor-indicator sensor-${getSensorStatus(leftQuad)} diagram-text`}
              title={`Left Quadriceps: ${getOutputPercentage(leftQuad)}%`}
            >
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white px-2 py-1 rounded-full shadow-sm border text-xs font-medium flex items-center gap-1">
                {getOutputPercentage(leftQuad)}%
                {renderTrendIndicator(getOutputPercentage(leftQuad))}
              </div>
            </div>
          )}
          
          {rightQuad && (
            <div 
              className={`absolute top-[35%] left-[70%] sensor-indicator sensor-${getSensorStatus(rightQuad)} diagram-text`}
              title={`Right Quadriceps: ${getOutputPercentage(rightQuad)}%`}
            >
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white px-2 py-1 rounded-full shadow-sm border text-xs font-medium flex items-center gap-1">
                {getOutputPercentage(rightQuad)}%
                {renderTrendIndicator(getOutputPercentage(rightQuad))}
              </div>
            </div>
          )}
          
          {leftHam && (
            <div 
              className={`absolute top-[65%] left-[30%] sensor-indicator sensor-${getSensorStatus(leftHam)} diagram-text`}
              title={`Left Hamstring: ${getOutputPercentage(leftHam)}%`}
            >
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white px-2 py-1 rounded-full shadow-sm border text-xs font-medium flex items-center gap-1">
                {getOutputPercentage(leftHam)}%
                {renderTrendIndicator(getOutputPercentage(leftHam))}
              </div>
            </div>
          )}
          
          {rightHam && (
            <div 
              className={`absolute top-[65%] left-[70%] sensor-indicator sensor-${getSensorStatus(rightHam)} diagram-text`}
              title={`Right Hamstring: ${getOutputPercentage(rightHam)}%`}
            >
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white px-2 py-1 rounded-full shadow-sm border text-xs font-medium flex items-center gap-1">
                {getOutputPercentage(rightHam)}%
                {renderTrendIndicator(getOutputPercentage(rightHam))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-4 pt-3 border-t border-gray-100 grid grid-cols-2 gap-3">
        <div className="stat-card">
          <div className="text-xs text-gray-500">Left/Right Comparison</div>
          <div className="font-semibold text-matstat-blue-dark">
            Quads: {Math.abs(getOutputPercentage(leftQuad) - getOutputPercentage(rightQuad))}% diff
          </div>
        </div>
        <div className="stat-card">
          <div className="text-xs text-gray-500">Left/Right Comparison</div>
          <div className="font-semibold text-matstat-blue-dark">
            Hams: {Math.abs(getOutputPercentage(leftHam) - getOutputPercentage(rightHam))}% diff
          </div>
        </div>
      </div>
    </div>
  );
};

export default MuscleFatigueMap;
