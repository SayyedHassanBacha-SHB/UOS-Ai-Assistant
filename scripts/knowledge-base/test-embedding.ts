
import fs from "node:fs/promises";
import path from "node:path";
import { loadEnvConfig } from "@next/env";
import { GoogleGenAI } from "@google/genai";

loadEnvConfig(process.cwd());

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const chunksPath = path.join(
    process.cwd(),
    "data",
    "processed",
    "processed-chunks.json"
  );

  const chunks = JSON.parse(
    await fs.readFile(chunksPath, "utf-8")
  ) as { content: string }[];

  if (chunks.length === 0) {
    throw new Error("No chunks found.");
  }

  const response = await ai.models.embedContent({
    model: "gemini-embedding-001",
    contents: chunks[0].content,
    config: {
      taskType: "RETRIEVAL_DOCUMENT",
      outputDimensionality: 768,
    },
  });

  const embedding = response.embeddings?.[0]?.values;

  if (!embedding) {
    throw new Error("Embedding generation failed.");
  }

  console.log("Embedding generated successfully!");
  console.log("Vector dimensions:", embedding.length);
  console.log("First 5 values:", embedding.slice(0, 5));
}

main().catch(console.error);
