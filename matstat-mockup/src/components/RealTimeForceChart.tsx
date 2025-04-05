import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { MuscleData } from '../mockData'; // Assuming we might pass the whole muscle object later

// Define the structure of the data points for the chart
interface ChartDataPoint {
  time: number; // Timestamp (e.g., seconds into session)
  force: number;
}

interface RealTimeForceChartProps {
  muscleName: string;
  baselineForce: number;
  fatigueThresholdPercent?: number; // e.g., 85 for 85%
  initialData?: ChartDataPoint[]; // Optional initial data
  currentForce: number; // The latest force reading to add dynamically
}

const MAX_DATA_POINTS = 30; // Keep only the last N data points

const RealTimeForceChart: React.FC<RealTimeForceChartProps> = ({
  muscleName,
  baselineForce,
  fatigueThresholdPercent = 85, // Default to 85% threshold
  initialData = [],
  currentForce
}) => {
  const [chartData, setChartData] = useState<ChartDataPoint[]>(initialData);
  const [timeCounter, setTimeCounter] = useState(initialData.length); // Start time based on initial data

  const fatigueThresholdValue = baselineForce * (fatigueThresholdPercent / 100);

  useEffect(() => {
    // Add the new data point when currentForce changes
    // In a real app, this update might come from a different source/prop
    const newDataPoint: ChartDataPoint = { time: timeCounter, force: currentForce };

    setChartData(prevData => {
      const updatedData = [...prevData, newDataPoint];
      // Keep only the last MAX_DATA_POINTS
      return updatedData.slice(-MAX_DATA_POINTS);
    });

    setTimeCounter(prevTime => prevTime + 1); // Increment time for the next point

  }, [currentForce]); // Rerun effect when currentForce changes

  // Ensure chartData is never empty to avoid Recharts errors
  const displayData = chartData.length > 0 ? chartData : [{ time: 0, force: baselineForce }];
  const minY = Math.min(...displayData.map(d => d.force), fatigueThresholdValue) * 0.9; // Y-axis min slightly below lowest value
  const maxY = Math.max(...displayData.map(d => d.force), baselineForce) * 1.1; // Y-axis max slightly above highest value

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={displayData}
        margin={{
          top: 5, right: 30, left: 20, bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" label={{ value: 'Time (s)', position: 'insideBottomRight', offset: -5 }} />
        <YAxis domain={[minY, maxY]} label={{ value: 'Force', angle: -90, position: 'insideLeft' }} />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="force" stroke="#8884d8" activeDot={{ r: 8 }} name={muscleName} />
        <ReferenceLine y={baselineForce} label={{ value: 'Baseline', position: 'insideTopRight' }} stroke="green" strokeDasharray="3 3" />
        <ReferenceLine y={fatigueThresholdValue} label={{ value: `Fatigue (${fatigueThresholdPercent}%)`, position: 'insideBottomRight' }} stroke="orange" strokeDasharray="3 3" />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default RealTimeForceChart;
