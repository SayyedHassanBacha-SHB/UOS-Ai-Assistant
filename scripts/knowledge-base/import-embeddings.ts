
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@libsql/client";
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

interface EmbeddedChunk {
  id: string;
  documentId: string;
  documentPath: string;
  title: string;
  category: string;
  documentType: string;
  sourceType: string;
  sourceUrls: string[];
  verificationStatus: string;
  sourceKeys: string[];
  isTimeSensitive: boolean;
  chunkIndex: number;
  tokenCount: number;
  content: string;
  embedding: number[];
}

const INPUT_FILE = path.join(
  process.cwd(),
  "data",
  "processed",
  "embedded-chunks.json"
);

const BATCH_SIZE = 25;
const VECTOR_DIMENSIONS = 768;

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  throw new Error(
    "Missing Turso credentials in .env.local"
  );
}

const db = createClient({ url, authToken });

function loadChunks(): EmbeddedChunk[] {
  if (!fs.existsSync(INPUT_FILE)) {
    throw new Error(`Input file not found: ${INPUT_FILE}`);
  }

  const chunks = JSON.parse(
    fs.readFileSync(INPUT_FILE, "utf-8")
  ) as EmbeddedChunk[];

  if (!Array.isArray(chunks) || chunks.length === 0) {
    throw new Error("No embedded chunks found.");
  }

  for (const [index, chunk] of chunks.entries()) {
    if (
      !chunk.id ||
      !chunk.documentId ||
      !chunk.content ||
      !Array.isArray(chunk.embedding) ||
      chunk.embedding.length !== VECTOR_DIMENSIONS ||
      !chunk.embedding.every(
        (value) => typeof value === "number" && Number.isFinite(value)
      )
    ) {
      throw new Error(
        `Invalid chunk or embedding at position ${index}: ${chunk.id ?? "unknown"}`
      );
    }
  }

  return chunks;
}

async function importChunks() {
  try {
    console.log("Loading embedded chunks...");

    const chunks = loadChunks();

    console.log(`Found ${chunks.length} valid chunks.`);
    console.log(`Vector dimensions: ${VECTOR_DIMENSIONS}`);
    console.log(`Batch size: ${BATCH_SIZE}\n`);

    const insertSQL = `
      INSERT OR REPLACE INTO knowledge_chunks (
        id,
        document_id,
        content,
        metadata,
        embedding
      )
      VALUES (?, ?, ?, ?, vector32(?))
    `;

    let imported = 0;

    for (
      let start = 0;
      start < chunks.length;
      start += BATCH_SIZE
    ) {
      const batch = chunks.slice(
        start,
        start + BATCH_SIZE
      );

      const tx = await db.transaction("write");

      try {
        for (const chunk of batch) {
          const metadata = {
            documentPath: chunk.documentPath,
            title: chunk.title,
            category: chunk.category,
            documentType: chunk.documentType,
            sourceType: chunk.sourceType,
            sourceUrls: chunk.sourceUrls,
            verificationStatus: chunk.verificationStatus,
            sourceKeys: chunk.sourceKeys,
            isTimeSensitive: chunk.isTimeSensitive,
            chunkIndex: chunk.chunkIndex,
            tokenCount: chunk.tokenCount,
          };

          await tx.execute({
            sql: insertSQL,
            args: [
              chunk.id,
              chunk.documentId,
              chunk.content,
              JSON.stringify(metadata),
              JSON.stringify(chunk.embedding),
            ],
          });
        }

        await tx.commit();

        imported += batch.length;

        console.log(
          `Imported ${imported}/${chunks.length} chunks`
        );
      } catch (error) {
        await tx.rollback();
        throw error;
      }
    }

    console.log("\nVerifying database...");

    const countResult = await db.execute(
      "SELECT COUNT(*) AS total FROM knowledge_chunks"
    );

    const total = Number(countResult.rows[0].total);

    console.log(`Chunks stored in Turso: ${total}`);

    if (total < chunks.length) {
      throw new Error(
        `Expected at least ${chunks.length} chunks, but found ${total}.`
      );
    }

    const sample = await db.execute({
      sql: `
        SELECT id, document_id, content, metadata,
               vector_dims(embedding) AS dimensions
        FROM knowledge_chunks
        LIMIT 1
      `,
      args: [],
    });

    console.log("\nSample imported record:");
    console.log(sample.rows[0]);

    if (Number(sample.rows[0].dimensions) !== VECTOR_DIMENSIONS) {
      throw new Error("Stored embedding dimensions do not match.");
    }

    console.log("\nAll chunks imported and verified successfully!");
  } finally {
    db.close();
  }
}

importChunks().catch((error) => {
  console.error("\nImport failed:", error);
  process.exitCode = 1;
});
