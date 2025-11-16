import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  throw new Error("Missing Supabase environment variables");
}

const supabase = createClient(url, serviceKey);

async function checkRealtimeSettings() {
  console.log("🔍 Checking Realtime Publication Settings...\n");

  // Check if tables are in the publication
  const { data: pubTables, error: pubError } = await supabase.rpc(
    "exec_sql",
    {
      sql: `
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
      `,
    }
  );

  if (pubError) {
    console.error("❌ Error checking publication:", pubError.message);
    console.log("\n💡 Trying alternative method...\n");

    // Alternative: Check using information_schema
    const { data: tables, error: tablesError } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public")
      .in("table_name", ["posts", "replies"]);

    if (tablesError) {
      console.error("❌ Error checking tables:", tablesError.message);
    } else {
      console.log("✅ Tables found:", tables);
    }
  } else {
    console.log("📋 Tables in supabase_realtime publication:");
    console.log(pubTables);
  }

  // Check RLS policies
  console.log("\n🔒 Checking RLS Policies...\n");

  const { data: policies, error: policiesError } = await supabase.rpc(
    "exec_sql",
    {
      sql: `
        SELECT 
          schemaname,
          tablename,
          policyname,
          cmd,
          qual
        FROM 
          pg_policies
        WHERE 
          schemaname = 'public'
          AND tablename IN ('posts', 'replies')
        ORDER BY 
          tablename, policyname;
      `,
    }
  );

  if (policiesError) {
    console.error("❌ Error checking policies:", policiesError.message);
  } else {
    console.log("📜 RLS Policies:");
    console.log(policies);
  }

  console.log("\n✨ Check complete!");
}

checkRealtimeSettings()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("💥 Fatal error:", error);
    process.exit(1);
  });

