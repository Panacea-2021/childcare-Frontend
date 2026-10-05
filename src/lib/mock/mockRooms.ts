import type { RoomOption } from '@/types/activity';
import {
  countStudentsInRoom,
  loadActiveCenterRooms,
} from '@/lib/center-management/programCatalog';
import { liveArray } from '@/lib/center-management/liveList';

export const MOCK_ROOMS: RoomOption[] = liveArray(() =>
  loadActiveCenterRooms().map((room) => ({
    id: room.id,
    name: room.name,
    studentCount: countStudentsInRoom(room.id),
  })),
);
