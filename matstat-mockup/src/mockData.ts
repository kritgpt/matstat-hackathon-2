export interface MuscleData {
  name: string; // e.g., "Right Hamstring", "Left Quad"
  baselineForce: number; // Max force when rested
  currentForce: number; // Current force output
  fatiguePercentage: number; // (baseline - current) / baseline * 100
  isFatigued: boolean; // Flag if fatigue threshold crossed
  isAsymmetrical: boolean; // Flag if asymmetry threshold crossed compared to counterpart
}

export interface Athlete {
  id: string;
  name: string;
  sport: string;
  status: 'Idle' | 'Training' | 'Fatigued' | 'Injured' | 'Recovering';
  muscleGroups: {
    [key: string]: MuscleData; // e.g., "hamstrings", "quads"
  };
  // Add more relevant fields as needed
}

export const mockAthletes: Athlete[] = [
  {
    id: 'kabir-mehta',
    name: 'Kabir Mehta',
    sport: 'Soccer',
    status: 'Training',
    muscleGroups: {
      rightHamstring: {
        name: 'Right Hamstring',
        baselineForce: 100,
        currentForce: 95,
        fatiguePercentage: 5,
        isFatigued: false,
        isAsymmetrical: false,
      },
      leftHamstring: {
        name: 'Left Hamstring',
        baselineForce: 100,
        currentForce: 98,
        fatiguePercentage: 2,
        isFatigued: false,
        isAsymmetrical: false,
      },
      rightQuad: {
        name: 'Right Quadriceps',
        baselineForce: 120,
        currentForce: 115,
        fatiguePercentage: 4.17,
        isFatigued: false,
        isAsymmetrical: false,
      },
      leftQuad: {
        name: 'Left Quadriceps',
        baselineForce: 120,
        currentForce: 118,
        fatiguePercentage: 1.67,
        isFatigued: false,
        isAsymmetrical: false,
      },
    },
  },
  {
    id: 'priya-sharma',
    name: 'Priya Sharma',
    sport: 'Cricket',
    status: 'Idle',
    muscleGroups: {
      rightShoulder: {
        name: 'Right Shoulder',
        baselineForce: 80,
        currentForce: 80,
        fatiguePercentage: 0,
        isFatigued: false,
        isAsymmetrical: false,
      },
      leftShoulder: {
        name: 'Left Shoulder',
        baselineForce: 80,
        currentForce: 80,
        fatiguePercentage: 0,
        isFatigued: false,
        isAsymmetrical: false,
      },
    },
  },
  {
    id: 'arjun-singh',
    name: 'Arjun Singh',
    sport: 'Hockey',
    status: 'Recovering',
    muscleGroups: {
      rightKnee: { // Simplified for example
        name: 'Right Knee Area',
        baselineForce: 90,
        currentForce: 70, // Still recovering
        fatiguePercentage: 22.2,
        isFatigued: false, // Not necessarily fatigued, just lower capacity
        isAsymmetrical: true, // Compared to left
      },
      leftKnee: {
        name: 'Left Knee Area',
        baselineForce: 90,
        currentForce: 88,
        fatiguePercentage: 2.2,
        isFatigued: false,
        isAsymmetrical: true,
      },
    },
  },
];

// Simulation logic and state management functions are now moved to athletesSlice.ts
// This file now only exports the types and initial data structure.
