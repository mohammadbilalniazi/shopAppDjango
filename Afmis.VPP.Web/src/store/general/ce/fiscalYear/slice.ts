import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { screenOperations } from "../../../../constants/screens";
import { storeOperations } from "../../../../constants/storeOperations";
import { BaseSlicState, AfmisResponse } from "../../../../types/store/shared";
import { FiscalYear } from "../../../../types/entities/general/ce";

interface InitState extends BaseSlicState<FiscalYear> {
  fiscalYears: FiscalYear[];
  fiscalYear: FiscalYear | null;
}

const initialState = {
  fiscalYears: [],
  pageInfo: {},
  fiscalYear: null,
  updating: false,
  deleting: false,
  inserting: false,
  getting: false,
  searching: false,
  changed: false,
  formData: {},
} as InitState;

const fiscalYearsSlice = createSlice({
  name: "fiscalYears",
  initialState,
  reducers: {
    loadingStart: (state, action: PayloadAction<string>) => {
      if (action.payload === screenOperations.GET_ALL) {
        state.changed = false;
      } else if (action.payload !== screenOperations.GET) {
        state.changed = true;
      }
      
      switch (action.payload) {
        case screenOperations.SEARCH:
          state.searching = true;
          break;
        case screenOperations.GET:
          state.getting = true;
          break;
        case screenOperations.GET_ALL:
          state.gettingAll = true;
          break;
        case screenOperations.INSERT:
          state.inserting = true;
          break;
        case screenOperations.UPDATE:
          state.updating = true;
          break;
        case screenOperations.DELETE:
          state.deleting = true;
          break;
        default:
          break;
      }
    },
    loadingFinished: (state, action: PayloadAction<string>) => {
      switch (action.payload) {
        case screenOperations.SEARCH:
          state.searching = false;
          break;
        case screenOperations.GET:
          state.getting = false;
          break;
        case screenOperations.INSERT:
          state.inserting = false;
          break;
        case screenOperations.UPDATE:
          state.updating = false;
          break;
        case screenOperations.DELETE:
          state.deleting = false;
          break;
        default:
          break;
      }
    },
    fiscalYearsApiSuccess: (
      state,
      action: PayloadAction<AfmisResponse<FiscalYear[]>>
    ) => {
      state.fiscalYears = action.payload.data;
      state.pageInfo = action.payload.pagedInfo;
      state.searching = false;
      state.gettingAll=false;
    },
    fiscalYearApiSuccess: (
      state,
      action: PayloadAction<AfmisResponse<FiscalYear>>
    ) => {
      state.getting = false;
      state.updating = false;
      state.fiscalYear = action.payload.data;
    },
    resetFiscalYears: (state, action: PayloadAction<string>) => {
      if (action.payload === storeOperations.MULTIPLE) {
        state.fiscalYears = [];
        state.pageInfo = {};
      } else if (action.payload === storeOperations.SINGLE) {
        state.fiscalYear = null;
      }
      state.getting = false;
      state.updating = false;
      state.deleting = false;
      state.inserting = false;
      state.searching = false;
      state.gettingAll=false;
    },
    fiscalYearSetFormData: (
      state,
      action: PayloadAction<Partial<FiscalYear>>
    ) => {
      state.formData = action.payload;
    },
    fiscalYearResetFormData: (state) => {
      state.formData = {};
    },
  },
});

export const {
  loadingFinished,
  loadingStart,
  fiscalYearsApiSuccess,
  fiscalYearApiSuccess,
  resetFiscalYears,
  fiscalYearSetFormData,
  fiscalYearResetFormData,
} = fiscalYearsSlice.actions;

export default fiscalYearsSlice.reducer;
