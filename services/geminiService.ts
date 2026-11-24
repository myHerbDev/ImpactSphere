import type {
  AssessmentScores, Challenge, EsgPlaybookCategory, IndustryAverageData,
  Initiative, LibraryCategory, LibraryItem, ResourceItem, SustainabilityData,
} from '../types';

type Request =
  | { operation: 'playbook'; category: EsgPlaybookCategory }
  | { operation: 'initiatives' }
  | { operation: 'report'; data: SustainabilityData }
  | { operation: 'assessment'; scores: AssessmentScores }
  | { operation: 'analysis'; data: SustainabilityData; averages: IndustryAverageData };

async function generate<T>(request: Request, signal?: AbortSignal): Promise<T> {
  const timeout = AbortSignal.timeout(30000);
  const response = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
    signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
  });
  if (!response.ok) throw new Error('AI is temporarily unavailable. Please try again.');
  const { result } = await response.json();
  if (request.operation === 'playbook' || request.operation === 'initiatives') {
    if (!Array.isArray(result) || result.length === 0) throw new Error('No suggestions were returned.');
  } else if (typeof result !== 'string' || !result.trim()) {
    throw new Error('No analysis was returned.');
  }
  return result as T;
}

export const getEsgPlaybookContent = (category: EsgPlaybookCategory, signal?: AbortSignal) =>
  generate<ResourceItem[]>({ operation: 'playbook', category }, signal);
export const getEsgInitiatives = (signal?: AbortSignal) => generate<Initiative[]>({ operation: 'initiatives' }, signal);
export const getReportSummary = (data: SustainabilityData) =>
  generate<string>({ operation: 'report', data: { ...data, businessName: 'Organization' } });
export const getKpiAnalysis = (data: SustainabilityData, averages: IndustryAverageData) =>
  generate<string>({ operation: 'analysis', data: { ...data, businessName: 'Organization' }, averages });
export const getAssessmentRecommendations = (scores: AssessmentScores) => generate<string>({ operation: 'assessment', scores });

// Legacy components outside the published navigation.
export const getStrategicInsight = async (): Promise<string> => 'AI insight is unavailable in this view.';
export const getDailyRecommendation = getStrategicInsight;
export const getLibraryContent = async (_category: LibraryCategory): Promise<LibraryItem[]> => [];
export const getWeeklyChallenges = async (): Promise<Challenge[]> => [];
