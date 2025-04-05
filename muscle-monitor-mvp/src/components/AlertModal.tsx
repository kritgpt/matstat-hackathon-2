
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { AlertData } from '@/lib/types';

interface AlertModalProps {
  alert: AlertData;
  onContinueTraining: () => void;
  onEndSession: () => void;
}

const AlertModal: React.FC<AlertModalProps> = ({ alert, onContinueTraining, onEndSession }) => {
  useEffect(() => {
    // Play sound or vibration when alert appears
    const audio = new Audio('/notification.mp3');
    audio.volume = 0.5;
    audio.play().catch(() => {
      // Browser might block autoplay, handle gracefully
      console.log('Audio play was prevented by the browser');
    });
  }, []);

  // Format severity label
  const getSeverityLabel = () => {
    switch(alert.severity) {
      case 'high': return 'High Risk';
      case 'moderate': return 'Moderate Risk';
      default: return 'Low Risk';
    }
  };
  
  // Get color based on severity
  const getSeverityColor = () => {
    switch(alert.severity) {
      case 'high': return 'text-matstat-alert-danger';
      case 'moderate': return 'text-matstat-alert-warning';
      default: return 'text-yellow-500';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full shadow-2xl alert-border animate-fade-in">
        <div className="p-6 md:p-8">
          <div className="flex items-center mb-6">
            <AlertTriangle size={28} className="text-matstat-alert-danger mr-4" />
            <h2 className="text-2xl font-bold text-matstat-alert-danger">
              {alert.type === 'asymmetry' 
                ? `Asymmetry Alert: ${alert.affectedMuscle}`
                : `Overexertion Alert: ${alert.affectedMuscle}`
              }
            </h2>
          </div>
          
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <div className="bg-gray-100 px-4 py-2 rounded-full">
                <span className={`font-semibold ${getSeverityColor()}`}>{getSeverityLabel()}</span>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="font-medium mb-2">Alert Details</h3>
              
              {alert.type === 'asymmetry' ? (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Current Left/Right Difference:</span>
                    <span className="font-bold text-matstat-alert-danger">{alert.metrics.current}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Safe Threshold:</span>
                    <span className="font-bold">{alert.metrics.threshold}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Exceeding Threshold By:</span>
                    <span className="font-bold text-matstat-alert-danger">{alert.metrics.difference}%</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Current Force Output:</span>
                    <span className="font-bold text-matstat-alert-danger">{alert.metrics.current}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Safe Threshold:</span>
                    <span className="font-bold">{alert.metrics.threshold}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Below Threshold:</span>
                    <span className="font-bold text-matstat-alert-danger">
                      {alert.metrics.threshold - alert.metrics.current}%
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="bg-blue-50 border-l-4 border-matstat-blue p-4 rounded-r-lg">
              <h3 className="font-semibold text-matstat-blue mb-2">Recommendation</h3>
              <p>{alert.recommendation}</p>
              <p className="text-sm mt-2 text-gray-700">
                Following this recommendation can help prevent injury and optimize your training recovery.
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              variant="outline"
              className="flex-1 py-6"
              onClick={onContinueTraining}
            >
              Continue with Modified Training
            </Button>
            <Button
              variant="destructive"
              className="flex-1 py-6"
              onClick={onEndSession}
            >
              End Session
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertModal;
