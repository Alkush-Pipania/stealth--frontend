import { AppDispatch } from '..';
import { apiGet } from '@/action/server';
import { API_ENDPOINTS } from '@/action/endpoint';
import { setDocuments, setLoading, setError, Document } from '../slice/documentslice';

interface GetDocumentsResponse {
  message: string;
  caseId: string;
  documents: Document[];
}

/**
 * Fetch all documents for a specific case
 * Token is automatically included via axios interceptor
 */
export const fetchCaseDocuments = (caseId: string) => async (dispatch: AppDispatch) => {
  dispatch(setLoading(true));
  dispatch(setError(''));

  try {
    const response = await apiGet<GetDocumentsResponse>(
      API_ENDPOINTS.GET_CASE_DOCUMENTS(caseId),
      { includeAuth: true }
    );

    if (response.success && response.data?.documents) {
      dispatch(setDocuments({
        caseId: response.data.caseId,
        documents: response.data.documents,
      }));
    } else {
      dispatch(setError(response.error || 'Failed to fetch documents'));
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    dispatch(setError(errorMessage));
  } finally {
    dispatch(setLoading(false));
  }
};
