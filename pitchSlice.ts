import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface PitchState {
  pitches: Pitch[];
  currentPitch: Pitch | null;
  loading: boolean;
  error: string | null;
}

export interface Pitch {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  skills: string[];
  gigDetails: {
    projectType: string;
    budget: number;
    timeline: string;
    platform: string;
    additionalInfo: string;
  };
  generatedPitch: string;
  editedPitch: string;
  status: 'draft' | 'approved' | 'scheduled';
  calendarEventId?: string;
}

const initialState: PitchState = {
  pitches: [],
  currentPitch: null,
  loading: false,
  error: null,
};

const pitchSlice = createSlice({
  name: 'pitch',
  initialState,
  reducers: {
    fetchPitchesStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchPitchesSuccess: (state, action: PayloadAction<Pitch[]>) => {
      state.pitches = action.payload;
      state.loading = false;
      state.error = null;
    },
    fetchPitchesFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    fetchPitchByIdStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchPitchByIdSuccess: (state, action: PayloadAction<Pitch>) => {
      state.currentPitch = action.payload;
      state.loading = false;
      state.error = null;
    },
    fetchPitchByIdFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    generatePitchStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    generatePitchSuccess: (state, action: PayloadAction<Pitch>) => {
      state.pitches = [action.payload, ...state.pitches];
      state.currentPitch = action.payload;
      state.loading = false;
      state.error = null;
    },
    generatePitchFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    updatePitchStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    updatePitchSuccess: (state, action: PayloadAction<Pitch>) => {
      state.pitches = state.pitches.map((pitch) =>
        pitch.id === action.payload.id ? action.payload : pitch
      );
      state.currentPitch = action.payload;
      state.loading = false;
      state.error = null;
    },
    updatePitchFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    deletePitchStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    deletePitchSuccess: (state, action: PayloadAction<string>) => {
      state.pitches = state.pitches.filter((pitch) => pitch.id !== action.payload);
      state.currentPitch = null;
      state.loading = false;
      state.error = null;
    },
    deletePitchFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    schedulePitchStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    schedulePitchSuccess: (state, action: PayloadAction<Pitch>) => {
      state.pitches = state.pitches.map((pitch) =>
        pitch.id === action.payload.id ? action.payload : pitch
      );
      state.currentPitch = action.payload;
      state.loading = false;
      state.error = null;
    },
    schedulePitchFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    clearCurrentPitch: (state) => {
      state.currentPitch = null;
    },
  },
});

export const {
  fetchPitchesStart,
  fetchPitchesSuccess,
  fetchPitchesFailure,
  fetchPitchByIdStart,
  fetchPitchByIdSuccess,
  fetchPitchByIdFailure,
  generatePitchStart,
  generatePitchSuccess,
  generatePitchFailure,
  updatePitchStart,
  updatePitchSuccess,
  updatePitchFailure,
  deletePitchStart,
  deletePitchSuccess,
  deletePitchFailure,
  schedulePitchStart,
  schedulePitchSuccess,
  schedulePitchFailure,
  clearCurrentPitch,
} = pitchSlice.actions;

export default pitchSlice.reducer;
