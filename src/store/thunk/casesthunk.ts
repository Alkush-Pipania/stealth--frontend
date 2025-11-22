import { AppDispatch } from '..';
import { apiGet, apiPost } from '@/action/server';
import { API_ENDPOINTS } from '@/action/endpoint';
import { setCases, setLoading, setError, Case } from '../slice/casesslice';

interface GetCasesResponse {
  message: string;
  userEmail: string;
  userId: string;
  cases: Case[];
}

/**
 * Fetch all cases for the authenticated user
 * Token is automatically included via axios interceptor
 */
export const fetchCases = () => async (dispatch: AppDispatch) => {
  dispatch(setLoading(true));
  dispatch(setError(null));

  try {
    const response = await apiGet<GetCasesResponse>(API_ENDPOINTS.GET_CASES, {
      includeAuth: true, // Include JWT token in Authorization header
    });

    if (response.success && response.data?.cases) {
      dispatch(setCases(response.data.cases));
    } else {
      dispatch(setError(response.error || 'Failed to fetch cases'));
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    dispatch(setError(errorMessage));
  } finally {
    dispatch(setLoading(false));
  }
};

/**
 * Refresh cases (same as fetchCases but can be used for explicit refresh)
 */
export const refreshCases = () => async (dispatch: AppDispatch) => {
  return dispatch(fetchCases());
};

interface CreateCaseRequest {
  title: string;
  description?: string | null;
  jurisdiction?: string | null;
}

interface CreateCaseResponse {
  message: string;
  case: Case;
}

/**
 * Create a new case
 * Token is automatically included via axios interceptor
 */
export const createCase = (caseData: CreateCaseRequest) => async (dispatch: AppDispatch) => {
  dispatch(setLoading(true));
  dispatch(setError(null));

  try {
    const response = await apiPost<CreateCaseResponse>(API_ENDPOINTS.CREATE_CASE, {
      body: caseData,
      includeAuth: true,
    });

    if (response.success && response.data?.case) {
      // After successfully creating a case, refresh the cases list
      await dispatch(fetchCases());
      return { success: true, case: response.data.case };
    } else {
      dispatch(setError(response.error || 'Failed to create case'));
      return { success: false, error: response.error };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    dispatch(setError(errorMessage));
    return { success: false, error: errorMessage };
  } finally {
    dispatch(setLoading(false));
  }
};
