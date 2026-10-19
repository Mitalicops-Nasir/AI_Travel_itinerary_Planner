export type MemberView = {
  userId: string;
  name: string | null;
  email: string;
  image: string | null;
  role: "OWNER" | "MEMBER";
  joinedAt: string;
};

export type SuggestionStatusView = "OPEN" | "APPROVED" | "DECLINED";

export type SuggestionView = {
  id: string;
  day: number;
  title: string;
  notes: string | null;
  status: SuggestionStatusView;
  authorId: string;
  authorName: string;
  voteCount: number;
  votedByMe: boolean;
  createdAt: string;
  resolvedAt: string | null;
};

export type GroupActionResult<T = object> =
  | ({ success: true } & T)
  | { success: false; error: string };
