export interface Folder {
  id: string;
  user_id: string;
  name: string;
  parent_id: string | null;
  created_at: string;
}

export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string;
  folder_id: string | null;
  is_pinned: boolean;
  is_favorite: boolean;
  is_archived: boolean;
  is_trashed: boolean;
  tags: string[];
  created_at: string;
  updated_at: string | null;
}
