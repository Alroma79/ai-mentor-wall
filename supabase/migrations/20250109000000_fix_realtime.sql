-- Ensure tables are added to the realtime publication
-- This is idempotent - safe to run multiple times

-- First, check if tables are already in the publication
-- If not, add them
DO $$
BEGIN
  -- Add posts table to realtime publication if not already added
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'posts'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE posts;
    RAISE NOTICE 'Added posts table to supabase_realtime publication';
  ELSE
    RAISE NOTICE 'posts table already in supabase_realtime publication';
  END IF;

  -- Add replies table to realtime publication if not already added
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'replies'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE replies;
    RAISE NOTICE 'Added replies table to supabase_realtime publication';
  ELSE
    RAISE NOTICE 'replies table already in supabase_realtime publication';
  END IF;
END $$;

-- Ensure REPLICA IDENTITY is set to FULL for realtime to work properly
-- This allows Supabase to track all changes
ALTER TABLE posts REPLICA IDENTITY FULL;
ALTER TABLE replies REPLICA IDENTITY FULL;

-- Verify the setup
SELECT 
  'supabase_realtime publication tables:' as info,
  schemaname,
  tablename
FROM 
  pg_publication_tables
WHERE 
  pubname = 'supabase_realtime'
  AND schemaname = 'public'
  AND tablename IN ('posts', 'replies')
ORDER BY 
  tablename;

