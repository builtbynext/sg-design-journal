export type Project = {
  id: string;
  title: string;
  category: string;
  description: string;
  cover_image_url: string;
  author_name: string;
  project_url?: string;
  status: "pending" | "approved";
  created_at: string;
};
