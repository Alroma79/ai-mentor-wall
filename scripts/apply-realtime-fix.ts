import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

dotenv.config({ path: ".env.local" });

function requireEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing ${name} in .env.local`);
  }

  return value;
}

const supabaseUrl = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
const serviceKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false },
});

async function applyRealtimeFix() {
  console.log("🔧 Applying Realtime Fix Migration...\n");

  // Read the migration file
  const migrationPath = path.join(
    process.cwd(),
    "supabase",
    "migrations",
    "20250109000000_fix_realtime.sql"
  );

  const sql = fs.readFileSync(migrationPath, "utf-8");

  console.log("📄 Migration SQL:");
  console.log("─".repeat(60));
  console.log(sql);
  console.log("─".repeat(60));
  console.log();

  // Note: Supabase client doesn't support raw SQL execution directly
  // We need to use the Management API or run this through the SQL Editor

  console.log("⚠️  To apply this migration, you have two options:\n");
  console.log("Option 1: Use Supabase Dashboard SQL Editor");
  console.log(
    `  1. Go to: ${supabaseUrl.replace(
      "https://",
      "https://supabase.com/dashboard/project/"
    )}/sql/new`
  );
  console.log("  2. Copy the SQL from: supabase/migrations/20250109000000_fix_realtime.sql");
  console.log("  3. Paste and run it\n");

  console.log("Option 2: Use Supabase CLI (requires Docker)");
  console.log("  npx supabase db push\n");

  console.log("Option 3: Manual check in Dashboard");
  console.log(
    `  1. Go to: ${supabaseUrl.replace(
      "https://",
      "https://supabase.com/dashboard/project/"
    )}/database/replication`
  );
  console.log("  2. Ensure 'posts' and 'replies' tables have replication enabled");
  console.log("  3. Look for the toggle switches next to each table\n");

  console.log("🔍 After applying, refresh your Railway app and check the console!");
}

applyRealtimeFix()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("💥 Error:", error);
    process.exit(1);
  });

