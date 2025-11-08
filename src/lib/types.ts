export type Profile = {
  id: string;
  username: string | null;
  created_at: string | null;
};

export type Post = {
  id: string;
  author: string | null;
  title: string;
  body: string;
  tags: string[] | null;
  created_at: string;
};

export type Reply = {
  id: string;
  post_id: string;
  author: string | null;
  body: string;
  is_ai: boolean;
  created_at: string;
};

export type WallPost = Post & {
  replies: Reply[];
};
