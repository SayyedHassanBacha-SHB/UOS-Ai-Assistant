
import { createClient } from "@libsql/client";
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  throw new Error(
    "Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN in .env.local"
  );
}

const db = createClient({
  url,
  authToken,
});

async function setupDatabase() {
  try {
    console.log("Connecting to Turso...");

    const result = await db.execute("SELECT 1 AS connection_test");

    console.log("Connection successful!");
    console.log("Test result:", result.rows[0]);

    console.log("\nCreating knowledge_chunks table...");

    await db.execute(`
      CREATE TABLE IF NOT EXISTS knowledge_chunks (
        id TEXT PRIMARY KEY,
        document_id TEXT NOT NULL,
        content TEXT NOT NULL,
        metadata TEXT,
        embedding F32_BLOB(768) NOT NULL
      )
    `);

    console.log("Table created successfully!");

    console.log("\nCreating vector index...");

    await db.execute(`
      CREATE INDEX IF NOT EXISTS knowledge_chunks_vector_idx
      ON knowledge_chunks (
        libsql_vector_idx(embedding, 'metric=cosine')
      )
    `);

    console.log("Vector index created successfully!");

    const tables = await db.execute(`
      SELECT name
      FROM sqlite_master
      WHERE type = 'table'
      AND name = 'knowledge_chunks'
    `);

    console.log("\nDatabase verification:");
    console.log(tables.rows);

    console.log("\nTurso setup completed successfully!");
  } catch (error) {
    console.error("Database setup failed:", error);
    throw error;
  } finally {
    db.close();
  }
}

setupDatabase();
