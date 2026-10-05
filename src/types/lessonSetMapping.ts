export type MappableClassroom = {
  id: string;
  name: string;
};

export type LessonSetMapping = {
  id: string;
  name: string;
  ageLabel: string;
  classroomIds: string[];
};
