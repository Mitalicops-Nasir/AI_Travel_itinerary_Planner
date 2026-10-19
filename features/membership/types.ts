export const FREE_TRIP_LIMIT_PER_MONTH = 3;
export const FREE_GROUP_MEMBER_LIMIT = 3;

export type MembershipTierName = "FREE" | "PRO";

export type MembershipStatusName =
  | "ACTIVE"
  | "PAST_DUE"
  | "CANCELED"
  | "EXPIRED";

export type MembershipView = {
  tier: MembershipTierName;
  status: MembershipStatusName;
  currentPeriodEnd: string | null;
};

export type QuotaView = {
  used: number;
  limit: number | null;
  remaining: number | null;
};
