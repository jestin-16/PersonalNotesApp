-- Migration script for PersonalNotesApp

-- 1. Create folders table
CREATE TABLE IF NOT EXISTS folders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  parent_id UUID REFERENCES folders(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for folders
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own folders" ON folders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own folders" ON folders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own folders" ON folders FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own folders" ON folders FOR DELETE USING (auth.uid() = user_id);

-- 2. Add new columns to notes table
ALTER TABLE notes 
ADD COLUMN IF NOT EXISTS folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_trashed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());
