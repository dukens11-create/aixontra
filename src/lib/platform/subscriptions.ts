export type SubscriptionPlan = 'FREE' | 'CREATOR' | 'PRO' | 'STUDIO';

export type PlanCapabilities = {
  monthlyCredits: number;
  maxSongLengthSeconds: number;
  commercialRights: boolean;
  stemsExport: boolean;
  priorityQueue: boolean;
  marketplaceSelling: boolean;
};

export const PLAN_CAPABILITIES: Record<SubscriptionPlan, PlanCapabilities> = {
  FREE: {
    monthlyCredits: 25,
    maxSongLengthSeconds: 120,
    commercialRights: false,
    stemsExport: false,
    priorityQueue: false,
    marketplaceSelling: false,
  },
  CREATOR: {
    monthlyCredits: 150,
    maxSongLengthSeconds: 180,
    commercialRights: true,
    stemsExport: false,
    priorityQueue: false,
    marketplaceSelling: true,
  },
  PRO: {
    monthlyCredits: 500,
    maxSongLengthSeconds: 300,
    commercialRights: true,
    stemsExport: true,
    priorityQueue: true,
    marketplaceSelling: true,
  },
  STUDIO: {
    monthlyCredits: 1500,
    maxSongLengthSeconds: 480,
    commercialRights: true,
    stemsExport: true,
    priorityQueue: true,
    marketplaceSelling: true,
  },
};

export const getPlanCapabilities = (plan: SubscriptionPlan): PlanCapabilities => PLAN_CAPABILITIES[plan];
