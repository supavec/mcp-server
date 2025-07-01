export type Embeddings = {
  documents: {
    content: string;
  }[];
};

export type UserFile = {
  type: string;
  file_id: string;
  created_at: string;
  file_name: string;
  team_id: string;
};

export type UserFilesResponse = {
  success: boolean;
  results: UserFile[];
  pagination: {
    offset: number;
    limit: number;
  };
  count: number;
};

export type UserFilesRequest = {
  pagination?: {
    limit?: number;
    offset?: number;
  };
  order_dir?: "desc" | "asc";
};
