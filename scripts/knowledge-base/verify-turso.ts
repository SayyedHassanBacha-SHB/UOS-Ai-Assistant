
import { createClient } from "@libsql/client";
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  throw new Error("Missing Turso credentials in .env.local");
}

const db = createClient({ url, authToken });

async function verifyDatabase() {
  try {
    console.log("Verifying Turso database...\n");

    // Verify total imported chunks
    const countResult = await db.execute(
      "SELECT COUNT(*) AS total FROM knowledge_chunks"
    );

    const total = Number(countResult.rows[0].total);

    console.log("Total chunks:", total);

    // Inspect one stored embedding
    const sample = await db.execute(`
  SELECT
    id,
    document_id,
    json_extract(metadata, '$.title') AS title,
    length(embedding) AS embedding_bytes,
    content
  FROM knowledge_chunks
  LIMIT 1
`);

    if (sample.rows.length === 0) {
      throw new Error("No records found in the database.");
    }

    const record = sample.rows[0];
    const embeddingBytes = Number(record.embedding_bytes);

    console.log("\nSample record:");
    console.log("ID:", record.id);
    console.log("Document ID:", record.document_id);
    console.log("Title:", record.title ?? "Stored in metadata");
    console.log("Embedding bytes:", embeddingBytes);

    // A 768-dimensional float32 vector occupies 768 * 4 bytes.
    const expectedBytes = 768 * 4;

    if (embeddingBytes !== expectedBytes) {
      throw new Error(
        `Unexpected embedding size: ${embeddingBytes} bytes. Expected ${expectedBytes}.`
      );
    }

    if (total !== 183) {
      throw new Error(`Expected 183 chunks, found ${total}.`);
    }

    console.log("\nDatabase verification successful!");
    console.log("183 chunks are stored.");
    console.log("768-dimensional vectors are stored as expected.");
  } finally {
    db.close();
  }
}

verifyDatabase().catch((error) => {
  console.error("\nVerification failed:", error);
  process.exitCode = 1;
});
