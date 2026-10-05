import type { Lesson, LessonLabel } from './types';

export const LESSON_SETS = [
  'Morning Session',
  'Afternoon Session',
  'Evening Session',
  'Special Activity',
] as const;

export const AGE_BANDS = [
  '0-1 Years',
  '1-2 Years',
  '2-3 Years',
  '3-4 Years',
  '4-5 Years',
  '5-6 Years',
] as const;

export const DURATION_OPTIONS = [
  '15 mins',
  '30 mins',
  '45 mins',
  '60 mins',
  '90 mins',
  '120 mins',
  'Custom',
] as const;

export const DEFAULT_DEVELOPMENT_AREAS = [
  'Language',
  'Mathematics',
  'Science',
  'Geometry',
  'Geography',
  'History',
  'Arts',
  'Music',
  'Dance',
  'Drama',
  'Communication',
  'Social Skills',
  'Motor Skills',
  'Physical Education',
  'Creative Thinking',
  'Problem Solving',
  'Environmental Awareness',
  'Fine Motor Skills',
  'Gross Motor Skills',
  'STEM',
  'Coding',
  'Storytelling',
  'Reading',
  'Writing',
  'Phonics',
  'Life Skills',
  'Critical Thinking',
] as const;

export const DEFAULT_LABELS: LessonLabel[] = [
  { id: 'lbl-outdoor', name: 'Outdoor', color: '#22C55E' },
  { id: 'lbl-indoor', name: 'Indoor', color: '#3B82F6' },
  { id: 'lbl-activity', name: 'Activity', color: '#5D5FEF' },
  { id: 'lbl-homework', name: 'Homework', color: '#F59E0B' },
  { id: 'lbl-assessment', name: 'Assessment', color: '#EF4444' },
  { id: 'lbl-worksheet', name: 'Worksheet', color: '#8B5CF6' },
  { id: 'lbl-creative', name: 'Creative', color: '#EC4899' },
  { id: 'lbl-project', name: 'Project', color: '#14B8A6' },
  { id: 'lbl-music', name: 'Music', color: '#F97316' },
  { id: 'lbl-dance', name: 'Dance', color: '#E11D48' },
  { id: 'lbl-science', name: 'Science', color: '#0EA5E9' },
];

export const TEACHING_STYLES = [
  'Play Based',
  'Activity Based',
  'Montessori',
  'Interactive',
  'Story Based',
  'Project Based',
] as const;

export const LEARNING_GOALS = [
  'Creativity',
  'Motor Skills',
  'Language',
  'Social Skills',
  'Confidence',
] as const;

export const DIFFICULTY_LEVELS = ['Easy', 'Medium', 'Advanced'] as const;

export const TEACHING_TONES = ['Friendly', 'Professional', 'Fun'] as const;

export const LABEL_COLORS = [
  '#5D5FEF',
  '#3B82F6',
  '#22C55E',
  '#F59E0B',
  '#EF4444',
  '#8B5CF6',
  '#EC4899',
  '#14B8A6',
  '#F97316',
  '#0EA5E9',
];

function isoDaysAgo(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

export const SEED_LESSONS: Lesson[] = [
  {
    id: 'les-1',
    title: 'Rainbow Color Dance',
    lessonSet: 'Morning Session',
    roomId: 'room-3',
    roomName: 'Sunshine Room',
    ageBand: '2-3 Years',
    developmentAreas: ['Dance', 'Music', 'Gross Motor Skills'],
    labels: [DEFAULT_LABELS[2], DEFAULT_LABELS[9]],
    duration: '30 mins',
    customDuration: '',
    descriptionHtml:
      '<h3>Lesson Overview</h3><p>Children explore colors through joyful movement and music.</p><h3>Learning Objectives</h3><ul><li>Identify primary colors</li><li>Move safely with peers</li></ul>',
    youtubeUrl: 'https://www.youtube.com/watch?v=yCjJyiqpAuU',
    attachments: [],
    status: 'Published',
    createdBy: 'Center Administrator',
    createdAt: isoDaysAgo(5),
    updatedAt: isoDaysAgo(1),
  },
  {
    id: 'les-2',
    title: 'Counting with Nature',
    lessonSet: 'Afternoon Session',
    roomId: 'room-4',
    roomName: 'Rainbow Room',
    ageBand: '3-4 Years',
    developmentAreas: ['Mathematics', 'Environmental Awareness', 'Fine Motor Skills'],
    labels: [DEFAULT_LABELS[0], DEFAULT_LABELS[2]],
    duration: '45 mins',
    customDuration: '',
    descriptionHtml:
      '<h3>Lesson Overview</h3><p>Outdoor counting walk using leaves, stones, and flowers.</p>',
    youtubeUrl: '',
    attachments: [],
    status: 'Draft',
    createdBy: 'Maya Chen',
    createdAt: isoDaysAgo(3),
    updatedAt: isoDaysAgo(3),
  },
  {
    id: 'les-3',
    title: 'Story Circle: Animals',
    lessonSet: 'Morning Session',
    roomId: 'room-1',
    roomName: 'Demo Room',
    ageBand: '1-2 Years',
    developmentAreas: ['Storytelling', 'Language', 'Social Skills'],
    labels: [DEFAULT_LABELS[1], DEFAULT_LABELS[6]],
    duration: '20 mins',
    customDuration: '20 mins',
    descriptionHtml:
      '<h3>Lesson Overview</h3><p>Interactive animal story time with puppets and songs.</p>',
    youtubeUrl: '',
    attachments: [],
    status: 'Published',
    createdBy: 'Center Administrator',
    createdAt: isoDaysAgo(12),
    updatedAt: isoDaysAgo(8),
  },
  {
    id: 'les-4',
    title: 'Tiny Scientists: Mixing Colors',
    lessonSet: 'Special Activity',
    roomId: 'room-5',
    roomName: 'Star Room',
    ageBand: '4-5 Years',
    developmentAreas: ['Science', 'Arts', 'Creative Thinking'],
    labels: [DEFAULT_LABELS[10], DEFAULT_LABELS[6]],
    duration: '60 mins',
    customDuration: '',
    descriptionHtml:
      '<h3>Lesson Overview</h3><p>Hands-on color mixing experiment with safe paints.</p>',
    youtubeUrl: '',
    attachments: [],
    status: 'Archived',
    createdBy: 'Jordan Lee',
    createdAt: isoDaysAgo(20),
    updatedAt: isoDaysAgo(15),
  },
];
