// redux/slices/stepSlice.ts

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Định nghĩa kiểu dữ liệu stepper
interface StepState {
  currentStep: number;
  isComplete: boolean;
}

// Trạng thái ban đầu
const initialState: StepState = {
  currentStep: 1,
  isComplete: false,
};

// Slice Redux
const stepSlice = createSlice({
  name: "step",
  initialState,
  reducers: {
    nextStep: (state) => {
      state.currentStep += 1;
    },
    prevStep: (state) => {
      if (state.currentStep > 0) state.currentStep -= 1;
    },
    goToStep: (state, action: PayloadAction<number>) => {
      state.currentStep = action.payload;
    },
    markComplete: (state) => {
      state.isComplete = true;
    },
    resetStep: (state) => {
      state.currentStep = 1;
      state.isComplete = false;
    },
  },
});

// Export actions & reducer
export const {
  nextStep,
  prevStep,
  goToStep,
  markComplete,
  resetStep,
} = stepSlice.actions;

export default stepSlice.reducer;
