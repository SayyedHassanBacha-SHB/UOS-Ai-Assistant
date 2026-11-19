
import fs from "node:fs/promises";
import path from "node:path";
import { loadEnvConfig } from "@next/env";
import { GoogleGenAI } from "@google/genai";

loadEnvConfig(process.cwd());

const MODEL = "gemini-embedding-001";
const DIMENSIONS = 768;
const BATCH_SIZE = 32;
const MAX_RETRIES = 5;

interface Chunk {
  id: string;
  documentId: string;
  documentPath: string;
  title: string;
  category: string;
  documentType: "university_content" | "source_document";
  sourceType: string | null;
  sourceUrls: string[];
  verificationStatus: string | null;
  sourceKeys: string[];
  isTimeSensitive: boolean | null;
  chunkIndex: number;
  tokenCount: number;
  content: string;
}

interface EmbeddedChunk extends Chunk {
  embedding: number[];
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main(): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const inputPath = path.join(
    process.cwd(),
    "data",
    "processed",
    "processed-chunks.json"
  );

  const outputPath = path.join(
    process.cwd(),
    "data",
    "processed",
    "embedded-chunks.json"
  );

  const chunks = JSON.parse(
    await fs.readFile(inputPath, "utf-8")
  ) as Chunk[];

  if (chunks.length === 0) {
    throw new Error("No chunks found.");
  }

  const embeddedChunks: EmbeddedChunk[] = [];

  console.log(`Starting embedding generation for ${chunks.length} chunks.`);
  console.log(`Model: ${MODEL}`);
  console.log(`Dimensions: ${DIMENSIONS}\n`);

  for (let start = 0; start < chunks.length; start += BATCH_SIZE) {
    const batch = chunks.slice(start, start + BATCH_SIZE);

    console.log(
      `Processing chunks ${start + 1}-${start + batch.length} of ${chunks.length}...`
    );

    let successful = false;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const response = await ai.models.embedContent({
          model: MODEL,
          contents: batch.map((chunk) => chunk.content),
          config: {
            taskType: "RETRIEVAL_DOCUMENT",
            outputDimensionality: DIMENSIONS,
          },
        });

        const embeddings = response.embeddings;

        if (!embeddings || embeddings.length !== batch.length) {
          throw new Error(
            `Expected ${batch.length} embeddings but received ${embeddings?.length ?? 0}.`
          );
        }

        for (let i = 0; i < batch.length; i++) {
          const values = embeddings[i].values;

          if (!values || values.length !== DIMENSIONS) {
            throw new Error(`Invalid embedding for chunk ${batch[i].id}.`);
          }

          embeddedChunks.push({
            ...batch[i],
            embedding: values,
          });
        }

        successful = true;
        break;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : String(error);

        console.error(`Attempt ${attempt} failed: ${message}`);

        if (attempt < MAX_RETRIES) {
          const delay = Math.min(5000 * 2 ** (attempt - 1), 60000);

          console.log(`Retrying in ${delay / 1000} seconds...`);
          await wait(delay);
        }
      }
    }

    if (!successful) {
      // Save completed batches before stopping.
      await fs.writeFile(
        outputPath,
        JSON.stringify(embeddedChunks, null, 2),
        "utf-8"
      );

      throw new Error(
        `Embedding generation stopped at chunk ${start + 1}. Completed results were saved.`
      );
    }

    // Save progress after every successful batch.
    await fs.writeFile(
      outputPath,
      JSON.stringify(embeddedChunks, null, 2),
      "utf-8"
    );

    console.log(`Completed: ${embeddedChunks.length}/${chunks.length}\n`);
  }

  console.log("========== EMBEDDING REPORT ==========");
  console.log(`Total chunks: ${chunks.length}`);
  console.log(`Successfully embedded: ${embeddedChunks.length}`);
  console.log(`Vector dimensions: ${DIMENSIONS}`);
  console.log(`Output: ${outputPath}`);
  console.log("\nEmbedding generation completed!");
}

main().catch((error) => {
  console.error("\nEmbedding generation failed:", error);
  process.exitCode = 1;
});
