import { useEffect } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { addRedFlag } from '@/store/slice/redflagsslice';
import { addFollowUp } from '@/store/slice/followupsslice';

/**
 * Hook to add demo data for Red Flags and Follow-up Questions
 * This simulates real-time events during a live session
 * Remove or disable in production
 */
export function useDemoData(caseId: string, enabled: boolean = false) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!enabled || !caseId) return;

    // Add some demo red flags after a delay to simulate real-time detection
    const redFlagTimeout1 = setTimeout(() => {
      dispatch(addRedFlag({
        id: `rf-${Date.now()}-1`,
        caseId,
        type: 'concern',
        title: 'Inconsistent timeline mentioned',
        description: 'The witness stated being at location A at 3 PM, but earlier testimony indicated they were at location B during that time.',
        source: 'Live Transcript',
        timestamp: Date.now(),
        isNew: true,
      }));
    }, 5000);

    const redFlagTimeout2 = setTimeout(() => {
      dispatch(addRedFlag({
        id: `rf-${Date.now()}-2`,
        caseId,
        type: 'critical',
        title: 'Contradictory statement detected',
        description: 'Current testimony directly contradicts previous deposition regarding the sequence of events on June 15th.',
        source: 'Live Transcript',
        timestamp: Date.now(),
        isNew: true,
      }));
    }, 10000);

    const redFlagTimeout3 = setTimeout(() => {
      dispatch(addRedFlag({
        id: `rf-${Date.now()}-3`,
        caseId,
        type: 'inconsistency',
        title: 'Document reference discrepancy',
        description: 'The witness referenced "Exhibit B" but the details provided do not match the actual contents of that exhibit.',
        source: 'Document Analysis',
        timestamp: Date.now(),
        isNew: true,
      }));
    }, 15000);

    // Add some demo follow-up questions
    const followUpTimeout1 = setTimeout(() => {
      dispatch(addFollowUp({
        id: `fu-${Date.now()}-1`,
        questionId: 'demo-question-1',
        text: 'Can you clarify the exact time you arrived at the location mentioned in your previous answer?',
        context: 'Based on timeline inconsistency detected in transcript',
        priority: 1,
        status: 'pending',
        timestamp: Date.now(),
        isNew: true,
      }));
    }, 7000);

    const followUpTimeout2 = setTimeout(() => {
      dispatch(addFollowUp({
        id: `fu-${Date.now()}-2`,
        questionId: 'demo-question-2',
        text: 'What documentation do you have to support the claim made about the contract terms?',
        context: 'Contract terms mentioned differ from Exhibit C',
        priority: 2,
        status: 'pending',
        timestamp: Date.now(),
        isNew: true,
      }));
    }, 12000);

    const followUpTimeout3 = setTimeout(() => {
      dispatch(addFollowUp({
        id: `fu-${Date.now()}-3`,
        questionId: 'demo-question-3',
        text: 'How do you explain the discrepancy between your statement today and the one from the deposition?',
        context: 'Contradictory testimony regarding timeline',
        priority: 1,
        status: 'pending',
        timestamp: Date.now(),
        isNew: true,
      }));
    }, 18000);

    // Cleanup function to clear timeouts
    return () => {
      clearTimeout(redFlagTimeout1);
      clearTimeout(redFlagTimeout2);
      clearTimeout(redFlagTimeout3);
      clearTimeout(followUpTimeout1);
      clearTimeout(followUpTimeout2);
      clearTimeout(followUpTimeout3);
    };
  }, [caseId, enabled, dispatch]);
}
