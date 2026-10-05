import type { ActivityComment, ActivityViewer } from '@/types/activity';
import { MOCK_STUDENTS } from './mockStudents';

const STAFF_VIEWERS = [
  {
    name: 'Sarah Jenkins',
    role: 'Head Educator',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  },
  {
    name: 'Dr. Marcus Vance',
    role: 'STEM Lead',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
  },
  {
    name: 'Priya Nair',
    role: 'Room Lead',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
  },
  {
    name: 'Clara Oswald',
    role: 'Music Instructor',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  {
    name: 'James Okonkwo',
    role: 'Assistant Teacher',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
];

const COMMENT_SNIPPETS = [
  'Thank you for sharing this update — we loved seeing it!',
  'Looks like such a fun session. Please share more photos!',
  'Appreciate the detailed note from the classroom today.',
  'Our child talked about this all evening. Wonderful work!',
  'Could you please share the worksheet as well?',
  'Beautiful moment captured. Thank you, teachers!',
  'Is this happening again next week?',
  'Great to see the progress. Keep it up!',
];

function hashSeed(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i += 1) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h;
}

/** Generate deterministic mock comments for a post (UI only). */
export function getMockComments(postId: string, count: number): ActivityComment[] {
  if (count <= 0) return [];
  const seed = hashSeed(postId);
  return Array.from({ length: count }, (_, i) => {
    const student = MOCK_STUDENTS[(seed + i * 3) % MOCK_STUDENTS.length];
    const staff = STAFF_VIEWERS[(seed + i) % STAFF_VIEWERS.length];
    const useParent = i % 2 === 0;
    return {
      id: `${postId}-c-${i + 1}`,
      authorName: useParent ? `${student.name.split(' ')[0]}'s Parent` : staff.name,
      authorRole: useParent ? `Parent · ${student.room}` : staff.role,
      avatar: useParent
        ? `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(student.name)}`
        : staff.avatar,
      text: COMMENT_SNIPPETS[(seed + i) % COMMENT_SNIPPETS.length],
      createdAt: `${String(9 + (i % 8)).padStart(2, '0')}:${String((i * 7) % 60).padStart(2, '0')} ${i % 3 === 0 ? 'AM' : 'PM'}`,
    };
  });
}

/** Generate deterministic mock viewers for a post (UI only). */
export function getMockViewers(postId: string, count: number): ActivityViewer[] {
  if (count <= 0) return [];
  const seed = hashSeed(postId);
  return Array.from({ length: count }, (_, i) => {
    const useStaff = i % 3 === 0;
    if (useStaff) {
      const staff = STAFF_VIEWERS[(seed + i) % STAFF_VIEWERS.length];
      return {
        id: `${postId}-v-${i + 1}`,
        name: staff.name,
        role: staff.role,
        avatar: staff.avatar,
        viewedAt: `${String(8 + (i % 10)).padStart(2, '0')}:${String((i * 11) % 60).padStart(2, '0')} AM`,
      };
    }
    const student = MOCK_STUDENTS[(seed + i * 5) % MOCK_STUDENTS.length];
    return {
      id: `${postId}-v-${i + 1}`,
      name: `${student.name.split(' ')[0]}'s Parent`,
      role: `Parent · ${student.room}`,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(student.name)}`,
      viewedAt: `${String(10 + (i % 8)).padStart(2, '0')}:${String((i * 13) % 60).padStart(2, '0')} AM`,
    };
  });
}
