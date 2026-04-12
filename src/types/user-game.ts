export type UserGameUI = {
  id: string;
  relationship: "OWNED" | "PLAYED_ELSEWHERE" | "WISHLIST";
  source?: string | null;
  acquiredAt?: string | null;
  boardGame: {
    name: string;
  };
  sessions: {
    id: string;
    date: string;
  }[];

  // derived UI fields
  plays?: number;
  lastPlayedAt?: string | null;
};
