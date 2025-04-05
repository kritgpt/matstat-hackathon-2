import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { SessionStatus, TrainingType, SensorReading, AlertData, SessionData } from '@/lib/types';
import { initialSensorData, generateSessionData, checkForAlerts, generateRecoveryData } from '@/lib/dataGenerator';
import SessionSetup from '@/components/SessionSetup';
import MonitoringView from '@/components/MonitoringView';
import AlertModal from '@/components/AlertModal';
import SessionSummary from '@/components/SessionSummary';
import { toast } from '@/components/ui/use-toast';

const Index = () => {
  // Session state
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>('setup');
  const [sessionId, setSessionId] = useState<string>('');
  const [trainingType, setTrainingType] = useState<TrainingType>('high-intensity');
  const [sessionStartTime, setSessionStartTime] = useState<number>(0);
  const [sessionDuration, setSessionDuration] = useState<number>(0);
  
  // Data state
  const [allReadings, setAllReadings] = useState<SensorReading[]>([]);
  const [currentReadingIndex, setCurrentReadingIndex] = useState<number>(0);
  const [currentReading, setCurrentReading] = useState<SensorReading>({
    timestamp: Date.now(),
    sensors: [...initialSensorData]
  });
  
  // Alert state
  const [alertData, setAlertData] = useState<AlertData>({
    triggered: false,
    type: 'none',
    severity: 'low',
    metrics: {
      current: 0,
      threshold: 0
    },
    recommendation: ''
  });
  
  // Final session data for summary
  const [sessionData, setSessionData] = useState<SessionData>({
    id: '',
    trainingType: 'high-intensity',
    startTime: 0,
    readings: []
  });

  // Initialize a new training session
  const handleSessionStart = (type: TrainingType) => {
    const newSessionId = uuidv4();
    const startTime = Date.now();
    
    // Generate simulated data for the training session
    const simulatedData = generateSessionData(180, type, true);
    
    setSessionId(newSessionId);
    setTrainingType(type);
    setSessionStartTime(startTime);
    setAllReadings(simulatedData);
    setCurrentReadingIndex(0);
    setCurrentReading(simulatedData[0]);
    setSessionStatus('monitoring');
    
    toast({
      title: "Session Started",
      description: `${type} training session initialized.`,
    });
  };
  
  // Handle continue training after alert
  const handleContinueTraining = () => {
    // Generate recovery data
    const recoveryData = generateRecoveryData(currentReading, 60);
    
    // Merge existing readings with recovery data
    const remainingReadings = allReadings.slice(currentReadingIndex + 1);
    const newReadings = [...allReadings.slice(0, currentReadingIndex + 1), ...recoveryData, ...remainingReadings];
    
    setAllReadings(newReadings);
    setSessionStatus('monitoring');
    
    toast({
      title: "Modified Training",
      description: "Continuing with reduced intensity.",
    });
  };
  
  // Handle end session
  const handleEndSession = () => {
    // Create the final session data
    const endTime = Date.now();
    
    setSessionData({
      id: sessionId,
      trainingType,
      startTime: sessionStartTime,
      endTime,
      readings: allReadings.slice(0, currentReadingIndex + 1)
    });
    
    setSessionStatus('summary');
    
    toast({
      title: "Session Ended",
      description: "Your training session has been completed.",
    });
  };
  
  // Start a completely new session
  const handleStartNewSession = () => {
    setSessionStatus('setup');
    setAllReadings([]);
    setCurrentReadingIndex(0);
    setCurrentReading({
      timestamp: Date.now(),
      sensors: [...initialSensorData]
    });
    setAlertData({
      triggered: false,
      type: 'none',
      severity: 'low',
      metrics: {
        current: 0,
        threshold: 0
      },
      recommendation: ''
    });
  };

  // Update the real-time monitoring view
  useEffect(() => {
    if (sessionStatus !== 'monitoring' || !allReadings.length) return;
    
    // Create an interval to simulate real-time data feed
    const interval = setInterval(() => {
      if (currentReadingIndex >= allReadings.length - 1) {
        // End of data, finish the session
        clearInterval(interval);
        handleEndSession();
        return;
      }
      
      const nextIndex = currentReadingIndex + 1;
      const nextReading = allReadings[nextIndex];
      
      // Check for alerts
      const alert = checkForAlerts(nextReading);
      
      if (alert.triggered && !alertData.triggered) {
        // New alert triggered
        setAlertData(alert);
        setCurrentReading(nextReading);
        setCurrentReadingIndex(nextIndex);
        setSessionDuration(Math.floor((nextReading.timestamp - sessionStartTime) / 1000));
        setSessionStatus('alert');
      } else {
        // No alert, continue monitoring
        setCurrentReading(nextReading);
        setCurrentReadingIndex(nextIndex);
        setSessionDuration(Math.floor((nextReading.timestamp - sessionStartTime) / 1000));
      }
    }, 300); // Accelerated for MVP demo
    
    return () => {
      clearInterval(interval);
    };
  }, [sessionStatus, currentReadingIndex, allReadings, sessionStartTime, alertData.triggered]);

  // Render the appropriate view based on session status
  const renderCurrentView = () => {
    switch (sessionStatus) {
      case 'setup':
        return <SessionSetup onSessionStart={handleSessionStart} />;
      case 'monitoring':
        return (
          <MonitoringView
            currentReading={currentReading}
            allReadings={allReadings.slice(0, currentReadingIndex + 1)}
            trainingType={trainingType}
            sessionDuration={sessionDuration}
          />
        );
      case 'alert':
        return (
          <>
            <MonitoringView
              currentReading={currentReading}
              allReadings={allReadings.slice(0, currentReadingIndex + 1)}
              trainingType={trainingType}
              sessionDuration={sessionDuration}
            />
            <AlertModal
              alert={alertData}
              onContinueTraining={handleContinueTraining}
              onEndSession={handleEndSession}
            />
          </>
        );
      case 'summary':
        return <SessionSummary sessionData={sessionData} onStartNewSession={handleStartNewSession} />;
      default:
        return <SessionSetup onSessionStart={handleSessionStart} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <header className="app-header">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <div className="font-bold text-xl">MatStat</div>
            <div className="ml-2 text-xs bg-matstat-blue-light/90 rounded-full px-2 py-0.5 shadow-inner">MVP</div>
          </div>
          <div className="text-sm font-medium">Early Detection of Training Overexertion</div>
        </div>
      </header>
      
      <main className="fade-in">
        {renderCurrentView()}
      </main>
    </div>
  );
};

export default Index;
