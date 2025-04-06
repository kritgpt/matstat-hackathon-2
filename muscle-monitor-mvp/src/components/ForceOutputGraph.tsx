
import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine, Tooltip } from 'recharts';
import { SensorReading } from '@/lib/types';
import { BarChart3 } from 'lucide-react';
import { Legend } from 'recharts';
interface ForceOutputGraphProps {
  readings: SensorReading[];
  muscleGroup: 'quads' | 'hams';
}

interface GraphDataPoint {
  time: string;
  left: number;
  right: number;
}

const ForceOutputGraph: React.FC<ForceOutputGraphProps> = ({ readings, muscleGroup }) => {
  const [graphData, setGraphData] = useState<GraphDataPoint[]>([]);
  
  // Transform readings data for the graph
  useEffect(() => {
    if (!readings.length) return;
    
    const startTime = readings[0].timestamp;
    
    const newGraphData = readings.map((reading) => {
      const timeElapsed = Math.floor((reading.timestamp - startTime) / 1000);
      const minutes = Math.floor(timeElapsed / 60);
      const seconds = timeElapsed % 60;
      const timeLabel = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
      
      const leftSensor = reading.sensors.find(
        s => s.location === (muscleGroup === 'quads' ? 'left-quad' : 'left-ham')
      );
      
      const rightSensor = reading.sensors.find(
        s => s.location === (muscleGroup === 'quads' ? 'right-quad' : 'right-ham')
      );
      
      return {
        time: timeLabel,
        left: leftSensor ? (leftSensor.output / leftSensor.baseline) * 100 : 0,
        right: rightSensor ? (rightSensor.output / rightSensor.baseline) * 100 : 0,
      };
    });
    
    setGraphData(newGraphData);
  }, [readings, muscleGroup]);
  
  const title = muscleGroup === 'quads' ? 'Quadriceps Force Output' : 'Hamstring Force Output';

  return (
    <div className="graph-container">
      <h3 className="text-lg font-semibold mb-2 flex items-center text-matstat-blue-dark">
        <BarChart3 size={18} className="mr-2 text-matstat-blue" />
        {title}
      </h3>
      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={graphData}
            margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 10 }}
              stroke="#94a3b8"
              tickLine={false}
              axisLine={false}
              minTickGap={20}
            />
            <YAxis 
              domain={[40, 100]} 
              tick={{ fontSize: 10 }}
              stroke="#94a3b8"
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e2e8f0'
              }}
            />
            <ReferenceLine y={100} stroke="#94a3b8" strokeDasharray="3 3" label={{ value: 'Baseline', position: 'insideTopLeft', fill: '#94a3b8', fontSize: 10 }} />
            <ReferenceLine y={85} stroke="#f39c12" strokeDasharray="3 3" label={{ value: 'Threshold', position: 'insideBottomLeft', fill: '#f39c12', fontSize: 10 }} />
            
            <Line 
              type="monotone" 
              dataKey="left" 
              name="Left" 
              stroke="#3498db" 
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, strokeWidth: 1 }}
            />
            <Line 
              type="monotone" 
              dataKey="right" 
              name="Right" 
              stroke="#2c3e50" 
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, strokeWidth: 1 }}
            />
            <Legend />
          </LineChart>
        </ResponsiveContainer>

      </div>
    </div>
  );
};

export default ForceOutputGraph;
