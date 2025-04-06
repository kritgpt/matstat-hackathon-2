
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Check, Circle, AlertCircle } from 'lucide-react';
import { TrainingType } from '@/lib/types';

interface SessionSetupProps {
  onSessionStart: (trainingType: TrainingType) => void;
}

const SessionSetup: React.FC<SessionSetupProps> = ({ onSessionStart }) => {
  const [sensorStatus, setSensorStatus] = useState({
    'left-quad': 'connecting',
    'right-quad': 'connecting',
    'left-ham': 'connecting',
    'right-ham': 'connecting'
  });
  const [calibrationProgress, setCalibrationProgress] = useState(0);
  const [trainingType, setTrainingType] = useState<TrainingType>('high-intensity');
  const [allSensorsConnected, setAllSensorsConnected] = useState(false);
  const [isCalibrated, setIsCalibrated] = useState(false);

  // Simulate sensor connection
  useEffect(() => {
    const connectSensors = () => {
      // Simulate sensors connecting one by one
      setTimeout(() => {
        setSensorStatus(prev => ({ ...prev, 'left-quad': 'connected' }));
      }, 800);
      
      setTimeout(() => {
        setSensorStatus(prev => ({ ...prev, 'right-quad': 'connected' }));
      }, 1500);
      
      setTimeout(() => {
        setSensorStatus(prev => ({ ...prev, 'left-ham': 'connected' }));
      }, 2300);
      
      setTimeout(() => {
        setSensorStatus(prev => ({ ...prev, 'right-ham': 'connected' }));
      }, 3000);
    };
    
    connectSensors();
  }, []);
  
  // Check if all sensors are connected
  useEffect(() => {
    const allConnected = Object.values(sensorStatus).every(status => status === 'connected');
    setAllSensorsConnected(allConnected);
    
    // Start calibration when all sensors are connected
    if (allConnected) {
      calibrateSensors();
    }
  }, [sensorStatus]);
  
  // Simulate sensor calibration
  const calibrateSensors = () => {
    const interval = setInterval(() => {
      setCalibrationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsCalibrated(true);
          return 100;
        }
        return prev + 2;
      });
    }, 50);
  };
  
  const handleStartSession = () => {
    onSessionStart(trainingType);
  };
  
  const getSensorStatusIcon = (status: string) => {
    if (status === 'connected') {
      return <Check size={18} className="text-matstat-alert-success" />;
    }
    if (status === 'error') {
      return <AlertCircle size={18} className="text-matstat-alert-danger" />;
    }
    return <Circle size={18} className="text-gray-400 animate-pulse" />;
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-matstat-blue-dark mb-8 text-center">Start Training Session</h1>
      
      <div className="grid md:grid-cols-2 gap-8">
        <Card className="shadow-lg">
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-4">Sensor Placement Guide</h2>
            <div className="relative aspect-[3/4] bg-gray-100 rounded-lg mb-4 overflow-hidden">
              <div className="absolute inset-0 bg-[url('../body-map.png')] bg-cover bg-center" />
            </div>
            {/* <ul className="space-y-2">
              <li className="flex items-center">
                <span className="w-6 h-6 rounded-full bg-matstat-blue-light text-white flex items-center justify-center text-sm font-semibold mr-3">1</span>
                <span>Place quadriceps sensors on the middle of the thigh</span>
              </li>
              <li className="flex items-center">
                <span className="w-6 h-6 rounded-full bg-matstat-blue-light text-white flex items-center justify-center text-sm font-semibold mr-3">2</span>
                <span>Place hamstring sensors on the rear middle of the thigh</span>
              </li>
              <li className="flex items-center">
                <span className="w-6 h-6 rounded-full bg-matstat-blue-light text-white flex items-center justify-center text-sm font-semibold mr-3">3</span>
                <span>Ensure sensors are securely fastened</span>
              </li>
            </ul> */}
          </CardContent>
        </Card>
        
        <div className="space-y-6">
          <Card className="shadow-lg">
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">Sensor Status</h2>
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center p-3 bg-gray-50 rounded-md">
                  {getSensorStatusIcon(sensorStatus['left-quad'])}
                  <span className="ml-2"> Left Quadriceps</span>
                </div>
                <div className="flex items-center p-3 bg-gray-50 rounded-md">
                  {getSensorStatusIcon(sensorStatus['right-quad'])}
                  <span className="ml-2">Right Quadriceps</span>
                </div>
                <div className="flex items-center p-3 bg-gray-50 rounded-md">
                  {getSensorStatusIcon(sensorStatus['left-ham'])}
                  <span className="ml-2">Left Hamstring</span>
                </div>
                <div className="flex items-center p-3 bg-gray-50 rounded-md">
                  {getSensorStatusIcon(sensorStatus['right-ham'])}
                  <span className="ml-2">Right Hamstring</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-lg">
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">Training Setup</h2>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Training Type
                </label>
                <Select 
                  value={trainingType} 
                  onValueChange={(value) => setTrainingType(value as TrainingType)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select training type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high-intensity">High Intensity Interval</SelectItem>
                    <SelectItem value="endurance">Endurance Run</SelectItem>
                    <SelectItem value="strength">Strength Training</SelectItem>
                    <SelectItem value="recovery">Recovery Session</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sensor Calibration
                </label>
                <Progress value={calibrationProgress} className="h-2" />
                <p className="text-sm text-gray-500 mt-2">
                  {!allSensorsConnected 
                    ? 'Waiting for all sensors to connect...' 
                    : isCalibrated 
                      ? 'Calibration complete' 
                      : 'Calibrating sensors...'}
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Button 
            className="w-full py-6 text-lg"
            disabled={!isCalibrated} 
            onClick={handleStartSession}
          >
            Start Session
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SessionSetup;
