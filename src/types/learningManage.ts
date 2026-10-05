export type DevelopmentArea = {
  id: string;
  name: string;
  color: string;
  active: boolean;
};

export type ScoringScale = {
  id: string;
  name: string;
  levels: string[];
  active: boolean;
};

export type LearningSettings = {
  defaultAreaId: string;
  defaultScaleId: string;
  allowParentViews: boolean;
  requireApproval: boolean;
};
