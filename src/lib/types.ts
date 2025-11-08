export type Question = {
  id: string;
  user_id: string | null;
  title: string;
  details: string | null;
  status: "pending" | "answered" | "error";
  created_at: string;
};

export type Answer = {
  id: string;
  question_id: string;
  model: string;
  content: string;
  created_at: string;
};
