-- Check if tables are in the supabase_realtime publication
SELECT 
  schemaname,
  tablename
FROM 
  pg_publication_tables
WHERE 
  pubname = 'supabase_realtime'
  AND schemaname = 'public'
ORDER BY 
  tablename;

-- If the above returns empty or missing posts/replies, run this:
-- ALTER PUBLICATION supabase_realtime ADD TABLE posts, replies;

-- Also check if REPLICA IDENTITY is set correctly
SELECT 
  schemaname,
  tablename,
  CASE 
    WHEN relreplident = 'd' THEN 'DEFAULT'
    WHEN relreplident = 'n' THEN 'NOTHING'
    WHEN relreplident = 'f' THEN 'FULL'
    WHEN relreplident = 'i' THEN 'INDEX'
  END as replica_identity
FROM 
  pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  JOIN pg_publication_tables pt ON pt.tablename = c.relname AND pt.schemaname = n.nspname
WHERE 
  pt.pubname = 'supabase_realtime'
  AND n.nspname = 'public'
  AND c.relname IN ('posts', 'replies')
ORDER BY 
  c.relname;

