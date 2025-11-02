export type RewardType = 'medal' | 'diamond';

export interface Reward {
  id: string;
  type: RewardType;
  minutes: number;
  createdAt: Date;
}

export interface RewardSummary {
  medals: number;
  diamonds: number;
  totalMinutes: number;
}
