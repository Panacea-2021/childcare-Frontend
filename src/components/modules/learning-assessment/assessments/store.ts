import type { StudentAssessment, PortfolioEntry } from '@/types/assessment';
import { MOCK_ASSESSMENTS, MOCK_PORTFOLIO } from '@/lib/mock/mockAssessments';

const ASSESSMENTS_KEY = 'panacea.learningAssessment.assessments';
const PORTFOLIO_KEY = 'panacea.learningAssessment.portfolio';

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw) as T;
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

export function loadAssessments(): StudentAssessment[] {
  if (typeof window === 'undefined') return MOCK_ASSESSMENTS;
  try {
    const raw = localStorage.getItem(ASSESSMENTS_KEY);
    if (!raw) {
      localStorage.setItem(ASSESSMENTS_KEY, JSON.stringify(MOCK_ASSESSMENTS));
      return MOCK_ASSESSMENTS;
    }
    const parsed = safeParse<StudentAssessment[]>(raw, MOCK_ASSESSMENTS);
    return Array.isArray(parsed) && parsed.length ? parsed : MOCK_ASSESSMENTS;
  } catch {
    return MOCK_ASSESSMENTS;
  }
}

export function saveAssessments(list: StudentAssessment[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ASSESSMENTS_KEY, JSON.stringify(list));
  } catch (err) {
    console.error('Failed to save assessments:', err);
  }
}

export function loadPortfolio(): PortfolioEntry[] {
  if (typeof window === 'undefined') return MOCK_PORTFOLIO;
  try {
    const raw = localStorage.getItem(PORTFOLIO_KEY);
    if (!raw) {
      localStorage.setItem(PORTFOLIO_KEY, JSON.stringify(MOCK_PORTFOLIO));
      return MOCK_PORTFOLIO;
    }
    const parsed = safeParse<PortfolioEntry[]>(raw, MOCK_PORTFOLIO);
    return Array.isArray(parsed) && parsed.length ? parsed : MOCK_PORTFOLIO;
  } catch {
    return MOCK_PORTFOLIO;
  }
}

export function savePortfolio(list: PortfolioEntry[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PORTFOLIO_KEY, JSON.stringify(list));
  } catch (err) {
    console.error('Failed to save portfolio:', err);
  }
}
