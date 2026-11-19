
import { createClient } from "@libsql/client";
import { GoogleGenAI } from "@google/genai";
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

const databaseUrl = process.env.TURSO_DATABASE_URL;
const databaseToken = process.env.TURSO_AUTH_TOKEN;
const geminiApiKey = process.env.GEMINI_API_KEY;

if (!databaseUrl || !databaseToken || !geminiApiKey) {
  throw new Error(
    "Missing Turso or Gemini environment variables in .env.local"
  );
}

const db = createClient({
  url: databaseUrl,
  authToken: databaseToken,
});

const ai = new GoogleGenAI({
  apiKey: geminiApiKey,
});

const EMBEDDING_MODEL = "gemini-embedding-001";
const EMBEDDING_DIMENSIONS = 768;
const TOP_K = 5;

interface SearchResult {
  id: string;
  document_id: string;
  content: string;
  title: string | null;
  category: string | null;
  verification_status: string | null;
  distance: number;
}

async function generateQueryEmbedding(
  question: string
): Promise<number[]> {
  console.log("\nGenerating question embedding...");

  const response = await ai.models.embedContent({
    model: EMBEDDING_MODEL,
    contents: question,
    config: {
      taskType: "RETRIEVAL_QUERY",
      outputDimensionality: EMBEDDING_DIMENSIONS,
    },
  });

  const embedding = response.embeddings?.[0]?.values;

  if (!embedding || embedding.length !== EMBEDDING_DIMENSIONS) {
    throw new Error(
      "Failed to generate a valid 768-dimensional query embedding."
    );
  }

  console.log("Question embedding generated successfully.");

  return embedding;
}

async function searchKnowledgeBase(
  question: string
): Promise<SearchResult[]> {
  const embedding = await generateQueryEmbedding(question);
  const vector = JSON.stringify(embedding);

  console.log("\nSearching Turso vector index...");

  const result = await db.execute({
    sql: `
      SELECT
        k.id,
        k.document_id,
        k.content,
        json_extract(k.metadata, '$.title') AS title,
        json_extract(k.metadata, '$.category') AS category,
        json_extract(k.metadata, '$.verificationStatus')
          AS verification_status,
        vector_distance_cos(
          k.embedding,
          vector32(?)
        ) AS distance

      FROM vector_top_k(
        'knowledge_chunks_vector_idx',
        vector32(?),
        ?
      ) AS search

      JOIN knowledge_chunks AS k
        ON k.rowid = search.id

      ORDER BY distance ASC
    `,
    args: [vector, vector, TOP_K],
  });

  return result.rows.map((row) => ({
    id: String(row.id),
    document_id: String(row.document_id),
    content: String(row.content),
    title: row.title === null ? null : String(row.title),
    category: row.category === null ? null : String(row.category),
    verification_status:
      row.verification_status === null
        ? null
        : String(row.verification_status),
    distance: Number(row.distance),
  }));
}

async function main() {
  const question =
    "Where is the University of Swat's main campus located?";

  try {
    console.log("==================================");
    console.log("UNIVERSITY OF SWAT VECTOR SEARCH");
    console.log("==================================");

    console.log("\nQuestion:", question);

    const results = await searchKnowledgeBase(question);

    console.log("\n========== SEARCH RESULTS ==========");

    if (results.length === 0) {
      console.log("No matching chunks found.");
      return;
    }

    results.forEach((item, index) => {
      console.log(`\nRESULT ${index + 1}`);
      console.log("----------------------------------");
      console.log("Title:", item.title);
      console.log("Category:", item.category);
      console.log("Document ID:", item.document_id);
      console.log("Chunk ID:", item.id);
      console.log("Verification:", item.verification_status);
      console.log("Cosine distance:", item.distance.toFixed(4));
      console.log("\nContent:\n", item.content);
    });

    console.log("\n==================================");
    console.log(`Retrieved ${results.length} relevant chunks.`);
    console.log("Vector search completed successfully!");
  } finally {
    db.close();
  }
}

main().catch((error) => {
  console.error("\nVector search failed:", error);
  process.exitCode = 1;
});
