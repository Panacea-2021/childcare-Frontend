import type { DevelopmentArea, LearningSettings, ScoringScale } from '@/types/learningManage';

export const DEFAULT_AREAS: DevelopmentArea[] = [
  { id: 'area-language', name: 'Language', color: '#5D5FEF', active: true },
  { id: 'area-math', name: 'Mathematics', color: '#2563EB', active: true },
  { id: 'area-motor', name: 'Motor Skills', color: '#0891B2', active: true },
  { id: 'area-social', name: 'Social-Emotional', color: '#0D9488', active: true },
  { id: 'area-cognitive', name: 'Cognitive', color: '#059669', active: true },
  { id: 'area-practical', name: 'Practical Life', color: '#D97706', active: true },
  { id: 'area-sensorial', name: 'Sensorial', color: '#DB2777', active: true },
  { id: 'area-cultural', name: 'Cultural Studies', color: '#7C3AED', active: true },
];

export const DEFAULT_SCALES: ScoringScale[] = [
  {
    id: 'scale-3',
    name: '3-Level Scale',
    levels: ['Emerging', 'Developing', 'Proficient'],
    active: true,
  },
  {
    id: 'scale-4',
    name: '4-Level Scale',
    levels: ['Emerging', 'Developing', 'Proficient', 'Mastered'],
    active: true,
  },
  {
    id: 'scale-5',
    name: '5-Level Scale',
    levels: ['Emerging', 'Developing', 'Proficient', 'Mastered', 'Advanced'],
    active: false,
  },
];

export const DEFAULT_SETTINGS: LearningSettings = {
  defaultAreaId: 'area-language',
  defaultScaleId: 'scale-4',
  allowParentViews: true,
  requireApproval: true,
};
