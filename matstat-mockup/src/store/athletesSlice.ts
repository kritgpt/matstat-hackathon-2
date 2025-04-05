import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { mockAthletes as initialMockAthletes, Athlete, MuscleData } from '../mockData'; // Use initial data

export interface AthletesState {
  athletes: Athlete[];
  simulationCounter: number;
}

const initialState: AthletesState = {
  athletes: initialMockAthletes, // Load initial state from mockData
  simulationCounter: 0,
};

// Moved simulation logic here
const simulateAthleteUpdate = (athlete: Athlete, counter: number): Athlete => {
   if (athlete.id === 'kabir-mehta' && (athlete.status === 'Training' || athlete.status === 'Fatigued')) {
      const updatedGroups = { ...athlete.muscleGroups };
      const rh = { ...updatedGroups.rightHamstring }; // Ensure deep copy for modification
      const lh = { ...updatedGroups.leftHamstring }; // Ensure deep copy

      // Simulate fatigue in right hamstring - make it deterministic after 5 ticks
      if (counter > 5) {
        rh.currentForce = rh.baselineForce * 0.80; // Force fatigue (80% = 20% fatigue)
      } else if (counter > 1) { // Start decreasing after tick 1
        rh.currentForce = Math.max(rh.baselineForce * 0.80, rh.currentForce - rh.baselineForce * 0.02 * Math.random());
      }
      // Keep left hamstring relatively high
      lh.currentForce = Math.max(lh.baselineForce * 0.90, lh.currentForce - lh.baselineForce * 0.01 * Math.random());

      // Recalculate percentages and flags
      rh.fatiguePercentage = ((rh.baselineForce - rh.currentForce) / rh.baselineForce) * 100;
      lh.fatiguePercentage = ((lh.baselineForce - lh.currentForce) / lh.baselineForce) * 100;
      rh.isFatigued = rh.fatiguePercentage > 15;
      lh.isFatigued = lh.fatiguePercentage > 15;

       // Check asymmetry
      const asymmetryThresholdPercent = 15;
      const rhPercentOfBaseline = (rh.currentForce / rh.baselineForce) * 100;
      const lhPercentOfBaseline = (lh.currentForce / lh.baselineForce) * 100;
      const asymmetryDifference = Math.abs(rhPercentOfBaseline - lhPercentOfBaseline);

      rh.isAsymmetrical = asymmetryDifference > asymmetryThresholdPercent;
      lh.isAsymmetrical = asymmetryDifference > asymmetryThresholdPercent;

      // Update athlete status based on fatigue
      const overallStatus = rh.isFatigued ? 'Fatigued' : 'Training';

      // Return updated athlete object
      return {
          ...athlete,
          status: overallStatus,
          muscleGroups: {
              ...updatedGroups, // Spread existing groups
              rightHamstring: rh, // Overwrite with updated muscle data
              leftHamstring: lh,  // Overwrite with updated muscle data
          }
      };
    }
    // Return unchanged athlete if not Kabir or not training/fatigued
    return athlete;
};


const athletesSlice = createSlice({
  name: 'athletes',
  initialState,
  reducers: {
    // Action to run one step of the simulation
    runSimulationTick: (state) => {
      state.simulationCounter += 1;
      state.athletes = state.athletes.map(athlete =>
        simulateAthleteUpdate(athlete, state.simulationCounter)
      );
    },
    // Add other reducers if needed, e.g., to add/remove athletes, reset state etc.
    // Example: resetSimulation: (state) => {
    //   state.athletes = initialMockAthletes;
    //   state.simulationCounter = 0;
    // }
  },
});

export const { runSimulationTick } = athletesSlice.actions;

export default athletesSlice.reducer;
