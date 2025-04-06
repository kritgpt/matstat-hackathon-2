import React, { useState, useEffect, useCallback } from 'react'; // Added useCallback
import { v4 as uuidv4 } from 'uuid'; // Keep for potential client-side fallback ID if needed
import { SessionStatus, TrainingType, SensorReading, AlertData, SessionData, SensorData } from '@/lib/types'; // Added SensorData
import { initialSensorData, checkForAlerts } from '@/lib/dataGenerator'; // Removed generateSessionData, generateRecoveryData
import SessionSetup from '@/components/SessionSetup';
import MonitoringView from '@/components/MonitoringView';
import AlertModal from '@/components/AlertModal';
import SessionSummary from '@/components/SessionSummary';
import { toast } from '@/components/ui/use-toast';
import { socket } from '@/lib/socket';

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
    const startTime = Date.now(); // Keep for potential client-side timing if needed

    // Emit session_start event to the backend
    socket.emit('session_start', { trainingType: type });

    // Reset state for the new session
    setSessionId(''); // Will be set by backend confirmation
    setTrainingType(type);
    setSessionStartTime(Date.now()); // Will be set by backend confirmation
    setAllReadings([]);
    // setCurrentReadingIndex(0); // Removed index tracking
    setCurrentReading({ timestamp: Date.now(), sensors: [...initialSensorData] }); // Reset to initial
    setSessionStatus('monitoring'); // Assume monitoring starts, wait for backend confirmation/data

    toast({
      title: "Session Started",
      description: `${type} training session initialized.`,
    });
  };
  
  // Handle continue training after alert - just reset alert state
  const handleContinueTraining = () => {
    setAlertData({ // Reset alert state
      triggered: false,
      type: 'none',
      severity: 'low',
      metrics: { current: 0, threshold: 0 },
      recommendation: ''
    });
    setSessionStatus('monitoring'); // Go back to monitoring

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
      readings: allReadings
    });
    
    // Emit session_end event to the backend
    socket.emit('session_end', { sessionId: sessionId }); // Send current sessionId

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

  // --- Socket.IO Handlers ---

  const onConnect = useCallback(() => {
    console.log('Socket connected:', socket.id);
    toast({ title: "Connected to server" });
  }, []);

  const onDisconnect = useCallback(() => {
    console.log('Socket disconnected');
    toast({ title: "Disconnected from server", variant: "destructive" });
    // Optionally handle reconnection logic or UI changes
  }, []);

  const onSessionStarted = useCallback((data: { session_id: string; start_time: string }) => {
    console.log('Session started confirmation received:', data);
    setSessionId(data.session_id);
    setSessionStartTime(new Date(data.start_time).getTime());
    toast({ title: "Backend confirmed session start", description: `Session ID: ${data.session_id}` });
  }, []);

  const onSessionEnded = useCallback(() => {
    console.log('Session ended confirmation received');
    // UI transition to summary is already handled by handleEndSession
  }, []);

  // Process incoming sensor data
  const onSensorUpdate = useCallback((data: { timestamp: number; sensors: { id: number; output: number }[], session_id: string }) => {
    if (sessionStatus !== 'monitoring' && sessionStatus !== 'alert') return; // Only process if monitoring or alert state
    if (data.session_id !== sessionId && sessionId !== '') return; // Ensure data is for the current session (if ID is known)

    // Map incoming data to full SensorReading structure
    const newReading: SensorReading = {
      timestamp: data.timestamp,
      sensors: data.sensors.map(incomingSensor => {
        const staticData = initialSensorData.find(s => s.id === incomingSensor.id);
        return {
          ...initialSensorData[0], // Default fallback (shouldn't happen)
          ...staticData,
          output: incomingSensor.output,
        };
      }).filter(Boolean) as SensorData[] // Filter out potential undefined if ID mismatch
    };

    if (newReading.sensors.length !== initialSensorData.length) {
      console.warn("Received incomplete sensor data:", data);
      return; // Skip incomplete readings
    }

    // Update state
    setCurrentReading(newReading);
    setAllReadings(prev => [...prev, newReading]);
    if (sessionStartTime > 0) { // Only calculate duration if start time is set
      setSessionDuration(Math.floor((Date.now() - sessionStartTime) / 1000));
    }

    // Check for alerts only if not already in alert state
    if (sessionStatus === 'monitoring') {
      const alert = checkForAlerts(newReading);
      if (alert.triggered) {
        setAlertData(alert);
        setSessionStatus('alert');
      }
    }
  }, [sessionStatus, sessionId, sessionStartTime]); // Dependencies for the callback

  // Effect for Socket.IO connection and event listeners
  useEffect(() => {
    socket.connect(); // Manually connect

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('session_started', onSessionStarted); // Listen for backend confirmation
    socket.on('session_ended', onSessionEnded);     // Listen for backend confirmation
    socket.on('sensor_update', onSensorUpdate);

    // Cleanup on unmount
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('session_started', onSessionStarted);
      socket.off('session_ended', onSessionEnded);
      socket.off('sensor_update', onSensorUpdate);
      socket.disconnect();
    };
  }, [onConnect, onDisconnect, onSessionStarted, onSessionEnded, onSensorUpdate]); // Add callbacks as dependencies

  // Render the appropriate view based on session status
  const renderCurrentView = () => {
    switch (sessionStatus) {
      case 'setup':
        return <SessionSetup onSessionStart={handleSessionStart} />;
      case 'monitoring':
        return (
          <MonitoringView
            currentReading={currentReading}
            allReadings={allReadings} // Pass all readings now
            trainingType={trainingType}
            sessionDuration={sessionDuration}
            onEndSession={handleEndSession}
          />
        );
      case 'alert':
        return (
          <>
            <MonitoringView
              currentReading={currentReading}
              allReadings={allReadings} // Pass all readings now
              trainingType={trainingType}
              sessionDuration={sessionDuration}
              onEndSession={handleEndSession}
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
          <div 
            className="flex items-center cursor-pointer" 
            onClick={() => setSessionStatus('setup')}
            role="button"
            aria-label="Go to home page"
          >
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
