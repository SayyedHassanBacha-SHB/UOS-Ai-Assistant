
import { GoogleGenAI } from "@google/genai";
import { createClient, type Client } from "@libsql/client";

// Embedding configuration
const EMBEDDING_MODEL = "gemini-embedding-001";
const EMBEDDING_DIMENSIONS = 768;

// Number of relevant knowledge chunks to retrieve
const DEFAULT_TOP_K = 5;

export interface RetrievedChunk {
  id: string;
  documentId: string;
  content: string;
  title: string;
  category: string;
  verificationStatus: string;
  distance: number;
}

let db: Client | null = null;
let ai: GoogleGenAI | null = null;

// Create the Turso database connection when needed.
function getDatabase(): Client {
  if (db) return db;

  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    throw new Error("Turso database configuration is missing.");
  }

  db = createClient({
    url,
    authToken,
  });

  return db;
}

// Create the Gemini client when needed.
function getAI(): GoogleGenAI {
  if (ai) return ai;

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Gemini API configuration is missing.");
  }

  ai = new GoogleGenAI({ apiKey });

  return ai;
}

// Generate an embedding for the user's question.
async function generateQueryEmbedding(
  question: string
): Promise<number[]> {
  const response = await getAI().models.embedContent({
    model: EMBEDDING_MODEL,
    contents: question,
    config: {
      taskType: "RETRIEVAL_QUERY",
      outputDimensionality: EMBEDDING_DIMENSIONS,
    },
  });

  const embedding = response.embeddings?.[0]?.values;

  if (
    !embedding ||
    embedding.length !== EMBEDDING_DIMENSIONS ||
    !embedding.every(
      (value) => typeof value === "number" && Number.isFinite(value)
    )
  ) {
    throw new Error("Failed to generate a valid query embedding.");
  }

  return embedding;
}

// Retrieve the most relevant knowledge chunks from Turso.
export async function retrieveRelevantChunks(
  question: string,
  topK: number = DEFAULT_TOP_K
): Promise<RetrievedChunk[]> {
  const cleanQuestion = question.trim();

  if (!cleanQuestion) {
    return [];
  }

  const safeTopK = Math.min(Math.max(Math.floor(topK), 1), 10);

  try {
    const embedding = await generateQueryEmbedding(cleanQuestion);
    const database = getDatabase();

    const vector = JSON.stringify(embedding);

    const result = await database.execute({
      sql: `
        SELECT
          k.id,
          k.document_id,
          k.content,
          k.metadata,
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
      args: [vector, vector, safeTopK],
    });

    return result.rows.map((row) => {
      const metadata =
        typeof row.metadata === "string"
          ? JSON.parse(row.metadata)
          : {};

      return {
        id: String(row.id),
        documentId: String(row.document_id),
        content: String(row.content),
        title: String(metadata.title ?? "University Document"),
        category: String(metadata.category ?? "General"),
        verificationStatus: String(
          metadata.verificationStatus ?? "unknown"
        ),
        distance: Number(row.distance),
      };
    });
  } catch (error) {
    console.error("RAG retrieval error:", error);
    throw new Error("Unable to retrieve university knowledge.");
  }
}
