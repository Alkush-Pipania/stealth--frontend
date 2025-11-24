import { AppDispatch } from '..';
import { apiGet } from '@/action/server';
import { API_ENDPOINTS } from '@/action/endpoint';
import { setQuestions, setLoading, setError, Question } from '../slice/questionsslice';

interface GetQuestionsResponse {
  message: string;
  questionsCount: number;
  data: Question[];
}

/**
 * Fetch all questions for a specific case
 * Token is automatically included via axios interceptor
 */
export const fetchCaseQuestions = (caseId: string) => async (dispatch: AppDispatch) => {
  dispatch(setLoading(true));
  dispatch(setError(''));

  try {
    const response = await apiGet<GetQuestionsResponse>(
      API_ENDPOINTS.GET_QUESTIONS(caseId),
      { includeAuth: true }
    );

    if (response.success && response.data?.data) {
      dispatch(setQuestions({
        caseId: caseId,
        questions: response.data.data,
      }));
    } else {
      dispatch(setError(response.error || 'Failed to fetch questions'));
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    dispatch(setError(errorMessage));
  } finally {
    dispatch(setLoading(false));
  }
};
