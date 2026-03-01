-- Create the notes table
CREATE TABLE notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Create Policies

-- 1. Users can only view their own notes
CREATE POLICY "Users can view their own notes" 
ON notes FOR SELECT 
USING (auth.uid() = user_id);

-- 2. Users can insert their own notes
CREATE POLICY "Users can insert their own notes" 
ON notes FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 3. Users can update their own notes
CREATE POLICY "Users can update their own notes" 
ON notes FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 4. Users can delete their own notes
CREATE POLICY "Users can delete their own notes" 
ON notes FOR DELETE 
USING (auth.uid() = user_id);
