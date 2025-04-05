
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SessionData, TrainingType } from '@/lib/types';
import { ArrowDown, ArrowRight, Download, FileText, AlertTriangle, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine, Tooltip } from 'recharts';

// Training type to display name mapping
const trainingTypeNames: Record<TrainingType, string> = {
  'high-intensity': 'High Intensity Interval',
  'endurance': 'Endurance Run',
  'strength': 'Strength Training',
  'recovery': 'Recovery Session'
};

interface SessionSummaryProps {
  sessionData: SessionData;
  onStartNewSession: () => void;
}

// Define a type for the output change data
interface OutputChange {
  start: number;
  end: number;
  change: number;
}

// Define a type for the fatigue analysis data
interface FatigueAnalysis {
  leftQuad?: OutputChange;
  rightQuad?: OutputChange;
  leftHam?: OutputChange;
  rightHam?: OutputChange;
}

const SessionSummary: React.FC<SessionSummaryProps> = ({ sessionData, onStartNewSession }) => {
  // Calculate session duration in minutes
  const sessionDuration = sessionData.endTime 
    ? Math.floor((sessionData.endTime - sessionData.startTime) / 60000)
    : 0;
    
  // Transform readings data for the graph
  const formatGraphData = () => {
    if (!sessionData.readings.length) return [];
    
    const startTime = sessionData.readings[0].timestamp;
    
    return sessionData.readings.map((reading, index) => {
      const timeElapsed = Math.floor((reading.timestamp - startTime) / 1000);
      const minutes = Math.floor(timeElapsed / 60);
      const seconds = timeElapsed % 60;
      const timeLabel = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
      
      const leftQuad = reading.sensors.find(s => s.location === 'left-quad');
      const rightQuad = reading.sensors.find(s => s.location === 'right-quad');
      const leftHam = reading.sensors.find(s => s.location === 'left-ham');
      const rightHam = reading.sensors.find(s => s.location === 'right-ham');
      
      // Check for alert points
      const isAlertPoint = index > 0 && index < sessionData.readings.length - 1 && (
        (rightHam && (rightHam.output / rightHam.baseline) * 100 < 85) ||
        (leftHam && (leftHam.output / leftHam.baseline) * 100 < 85) ||
        (Math.abs((leftQuad?.output || 0) / (leftQuad?.baseline || 1) - (rightQuad?.output || 0) / (rightQuad?.baseline || 1)) * 100 > 15) ||
        (Math.abs((leftHam?.output || 0) / (leftHam?.baseline || 1) - (rightHam?.output || 0) / (rightHam?.baseline || 1)) * 100 > 15)
      );
      
      return {
        time: timeLabel,
        leftQuad: leftQuad ? (leftQuad.output / leftQuad.baseline) * 100 : 0,
        rightQuad: rightQuad ? (rightQuad.output / rightQuad.baseline) * 100 : 0,
        leftHam: leftHam ? (leftHam.output / leftHam.baseline) * 100 : 0,
        rightHam: rightHam ? (rightHam.output / rightHam.baseline) * 100 : 0,
        alert: isAlertPoint
      };
    });
  };
  
  const graphData = formatGraphData();
  
  // Calculate fatigue analysis
  const calculateFatigueAnalysis = (): FatigueAnalysis => {
    if (!sessionData.readings.length) return {};
    
    const firstReading = sessionData.readings[0];
    const lastReading = sessionData.readings[sessionData.readings.length - 1];
    
    const getOutputChange = (location: string): OutputChange | undefined => {
      const firstSensor = firstReading.sensors.find(s => s.location === location);
      const lastSensor = lastReading.sensors.find(s => s.location === location);
      
      if (!firstSensor || !lastSensor) return undefined;
      
      const firstOutput = (firstSensor.output / firstSensor.baseline) * 100;
      const lastOutput = (lastSensor.output / lastSensor.baseline) * 100;
      
      return {
        start: Math.round(firstOutput),
        end: Math.round(lastOutput),
        change: Math.round(lastOutput - firstOutput)
      };
    };
    
    return {
      leftQuad: getOutputChange('left-quad'),
      rightQuad: getOutputChange('right-quad'),
      leftHam: getOutputChange('left-ham'),
      rightHam: getOutputChange('right-ham')
    };
  };
  
  const fatigueAnalysis = calculateFatigueAnalysis();
  
  // Generate recommendations based on session data
  const generateRecommendations = () => {
    const lowestEndValue = Math.min(
      fatigueAnalysis.leftQuad?.end || 100,
      fatigueAnalysis.rightQuad?.end || 100,
      fatigueAnalysis.leftHam?.end || 100,
      fatigueAnalysis.rightHam?.end || 100
    );
    
    const largestChange = Math.min(
      fatigueAnalysis.leftQuad?.change || 0,
      fatigueAnalysis.rightQuad?.change || 0,
      fatigueAnalysis.leftHam?.change || 0,
      fatigueAnalysis.rightHam?.change || 0
    );
    
    const hasAsymmetry = 
      Math.abs((fatigueAnalysis.leftQuad?.end || 0) - (fatigueAnalysis.rightQuad?.end || 0)) > 10 ||
      Math.abs((fatigueAnalysis.leftHam?.end || 0) - (fatigueAnalysis.rightHam?.end || 0)) > 10;
    
    const recommendations = [];
    
    if (lowestEndValue < 70) {
      recommendations.push('Allow 48 hours of recovery before your next intense leg training session.');
    } else if (lowestEndValue < 85) {
      recommendations.push('Allow 24 hours of recovery before your next leg training session.');
    } else {
      recommendations.push('You can resume normal training tomorrow.');
    }
    
    if (largestChange < -20) {
      recommendations.push('Consider a recovery session with gentle stretching and light activity tomorrow.');
    }
    
    if (hasAsymmetry) {
      recommendations.push('Focus on balance exercises to address the muscle asymmetry detected in this session.');
    }
    
    return recommendations;
  };
  
  // Handle PDF export
  const handleExport = () => {
    // This would be implemented with a PDF generation library in a real application
    alert('Session data export would be generated here');
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-matstat-blue-dark mb-8 text-center">Session Summary</h1>
      
      <Card className="shadow-lg mb-8">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <div className="text-sm text-gray-500">Duration</div>
              <div className="text-3xl font-bold">{sessionDuration} min</div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <div className="text-sm text-gray-500">Training Type</div>
              <div className="text-xl font-bold">{trainingTypeNames[sessionData.trainingType]}</div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <div className="text-sm text-gray-500">Performance</div>
              <div className="text-xl font-bold flex items-center justify-center">
                {fatigueAnalysis.rightHam?.change && fatigueAnalysis.rightHam.change < -15 ? (
                  <>
                    <span className="text-matstat-alert-danger">Significant Fatigue</span>
                    <ArrowDown size={18} className="text-matstat-alert-danger ml-1" />
                  </>
                ) : (
                  <>
                    <span className="text-matstat-alert-success">Normal Fatigue</span>
                    <ArrowRight size={18} className="text-matstat-alert-success ml-1" />
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Activity size={20} className="mr-2 text-matstat-blue" />
              Muscle Performance Analysis
            </h2>
            
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={graphData}
                  margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis 
                    dataKey="time" 
                    tick={{ fontSize: 10 }}
                    stroke="#94a3b8"
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    domain={[40, 100]} 
                    tick={{ fontSize: 10 }}
                    stroke="#94a3b8"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip />
                  <ReferenceLine y={85} stroke="#f39c12" strokeDasharray="3 3" />
                  
                  <Line 
                    type="monotone" 
                    dataKey="leftQuad" 
                    name="Left Quad" 
                    stroke="#3498db" 
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="rightQuad" 
                    name="Right Quad" 
                    stroke="#2c3e50" 
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="leftHam" 
                    name="Left Ham" 
                    stroke="#3498db" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="rightHam" 
                    name="Right Ham" 
                    stroke="#2c3e50" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-[#3498db] mr-1"></div>
                <span className="text-xs">Left Quad</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-[#2c3e50] mr-1"></div>
                <span className="text-xs">Right Quad</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-[#3498db] mr-1 border border-[#3498db]"></div>
                <span className="text-xs">Left Ham</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-[#2c3e50] mr-1 border border-[#2c3e50]"></div>
                <span className="text-xs">Right Ham</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <FileText size={20} className="mr-2 text-matstat-blue" />
              Fatigue Analysis
            </h2>
            
            <table className="w-full mb-6">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Muscle</th>
                  <th className="text-center py-2">Start</th>
                  <th className="text-center py-2">End</th>
                  <th className="text-center py-2">Change</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2">Left Quadriceps</td>
                  <td className="text-center">{fatigueAnalysis.leftQuad?.start ?? '-'}%</td>
                  <td className="text-center">{fatigueAnalysis.leftQuad?.end ?? '-'}%</td>
                  <td className="text-center font-medium">
                    <span className={fatigueAnalysis.leftQuad?.change && fatigueAnalysis.leftQuad.change < 0 ? 'text-matstat-alert-danger' : 'text-matstat-alert-success'}>
                      {fatigueAnalysis.leftQuad?.change !== undefined ? (fatigueAnalysis.leftQuad.change > 0 ? '+' : '') + fatigueAnalysis.leftQuad.change + '%' : '-'}
                    </span>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Right Quadriceps</td>
                  <td className="text-center">{fatigueAnalysis.rightQuad?.start ?? '-'}%</td>
                  <td className="text-center">{fatigueAnalysis.rightQuad?.end ?? '-'}%</td>
                  <td className="text-center font-medium">
                    <span className={fatigueAnalysis.rightQuad?.change && fatigueAnalysis.rightQuad.change < 0 ? 'text-matstat-alert-danger' : 'text-matstat-alert-success'}>
                      {fatigueAnalysis.rightQuad?.change !== undefined ? (fatigueAnalysis.rightQuad.change > 0 ? '+' : '') + fatigueAnalysis.rightQuad.change + '%' : '-'}
                    </span>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Left Hamstring</td>
                  <td className="text-center">{fatigueAnalysis.leftHam?.start ?? '-'}%</td>
                  <td className="text-center">{fatigueAnalysis.leftHam?.end ?? '-'}%</td>
                  <td className="text-center font-medium">
                    <span className={fatigueAnalysis.leftHam?.change && fatigueAnalysis.leftHam.change < 0 ? 'text-matstat-alert-danger' : 'text-matstat-alert-success'}>
                      {fatigueAnalysis.leftHam?.change !== undefined ? (fatigueAnalysis.leftHam.change > 0 ? '+' : '') + fatigueAnalysis.leftHam.change + '%' : '-'}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="py-2">Right Hamstring</td>
                  <td className="text-center">{fatigueAnalysis.rightHam?.start ?? '-'}%</td>
                  <td className="text-center">{fatigueAnalysis.rightHam?.end ?? '-'}%</td>
                  <td className="text-center font-medium">
                    <span className={fatigueAnalysis.rightHam?.change && fatigueAnalysis.rightHam.change < 0 ? 'text-matstat-alert-danger' : 'text-matstat-alert-success'}>
                      {fatigueAnalysis.rightHam?.change !== undefined ? (fatigueAnalysis.rightHam.change > 0 ? '+' : '') + fatigueAnalysis.rightHam.change + '%' : '-'}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
            
            {/* Problem areas */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="font-semibold flex items-center mb-2">
                <AlertTriangle size={16} className="mr-1 text-matstat-alert-warning" />
                Potential Problem Areas
              </h3>
              
              {fatigueAnalysis.rightHam?.change && fatigueAnalysis.rightHam.change < -15 ? (
                <div className="flex items-center text-sm">
                  <span className="w-2 h-2 rounded-full bg-matstat-alert-danger mr-2"></span>
                  <span>Right hamstring showed significant fatigue (-{Math.abs(fatigueAnalysis.rightHam.change)}%)</span>
                </div>
              ) : (
                <div className="text-sm">No significant problem areas detected.</div>
              )}
              
              {Math.abs((fatigueAnalysis.leftQuad?.end || 0) - (fatigueAnalysis.rightQuad?.end || 0)) > 10 && (
                <div className="flex items-center text-sm mt-2">
                  <span className="w-2 h-2 rounded-full bg-matstat-alert-warning mr-2"></span>
                  <span>
                    Quad asymmetry: {Math.abs((fatigueAnalysis.leftQuad?.end || 0) - (fatigueAnalysis.rightQuad?.end || 0))}% difference
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="shadow-lg mb-8">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Recommendations</h2>
          
          <ul className="space-y-3">
            {generateRecommendations().map((rec, index) => (
              <li key={index} className="flex items-start">
                <div className="w-6 h-6 rounded-full bg-matstat-blue-light text-white flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">
                  {index + 1}
                </div>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          onClick={onStartNewSession}
          className="flex-1 py-6"
        >
          Start New Session
        </Button>
        <Button
          variant="outline"
          className="flex-1 py-6"
          onClick={handleExport}
        >
          <Download size={18} className="mr-2" /> Download Session Data
        </Button>
      </div>
    </div>
  );
};

export default SessionSummary;
