import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PujaCard } from '@/types';

interface PujaState {
  pujas: PujaCard[];
  selectedPuja: PujaCard | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: PujaState = {
  pujas: [],
  selectedPuja: null,
  isLoading: false,
  error: null,
};

const pujaSlice = createSlice({
  name: 'puja',
  initialState,
  reducers: {
    setPujas: (state, action: PayloadAction<PujaCard[]>) => {
      state.pujas = action.payload;
    },
    setSelectedPuja: (state, action: PayloadAction<PujaCard | null>) => {
      state.selectedPuja = action.payload;
    },
    addPuja: (state, action: PayloadAction<PujaCard>) => {
      state.pujas.push(action.payload);
    },
    updatePuja: (state, action: PayloadAction<PujaCard>) => {
      const index = state.pujas.findIndex(puja => puja.id === action.payload.id);
      if (index !== -1) {
        state.pujas[index] = action.payload;
      }
    },
    deletePuja: (state, action: PayloadAction<string>) => {
      state.pujas = state.pujas.filter(puja => puja.id !== action.payload);
    },
    setPujaLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setPujaError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setPujas,
  setSelectedPuja,
  addPuja,
  updatePuja,
  deletePuja,
  setPujaLoading,
  setPujaError,
} = pujaSlice.actions;

export default pujaSlice.reducer;