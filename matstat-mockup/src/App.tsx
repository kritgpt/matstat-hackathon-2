import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import CoachDashboard from './pages/CoachDashboard';
import AthleteDetailView from './pages/AthleteDetailView';
import AthleteDashboard from './pages/AthleteDashboard'; // Import the new dashboard
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from './store/store'; // Import RootState and AppDispatch types
import { runSimulationTick } from './store/athletesSlice'; // Import the action


// Basic MUI theme (can be customized later)
const theme = createTheme({
  palette: {
    mode: 'light', // Or 'dark'
  },
});

const App: React.FC = () => {

  const dispatch = useDispatch<AppDispatch>();

  // Dispatch simulation tick periodically
  useEffect(() => {
    const intervalId = setInterval(() => {
      dispatch(runSimulationTick()); // Dispatch the action
    }, 1000); // Update every 3 seconds

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [dispatch]); // Add dispatch to dependency array

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* Ensures consistent baseline styling */}
      <Router>
        <Routes>
          <Route path="/coach-dashboard" element={<CoachDashboard />} /> {/* Renamed for clarity */}
          <Route path="/athlete/:athleteId" element={<AthleteDetailView />} />
          <Route path="/my-dashboard" element={<AthleteDashboard />} /> {/* Add route for athlete dashboard */}
          {/* Redirect base path to coach dashboard */}
          <Route path="/" element={<Navigate replace to="/coach-dashboard" />} />
          {/* TODO: Add a 404 Not Found page */}
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;
