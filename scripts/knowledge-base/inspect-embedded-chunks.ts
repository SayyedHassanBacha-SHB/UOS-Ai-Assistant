
import fs from "node:fs";
import path from "node:path";

const filePath = path.join(
  process.cwd(),
  "data",
  "processed",
  "embedded-chunks.json"
);

if (!fs.existsSync(filePath)) {
  throw new Error(`File not found: ${filePath}`);
}

const rawData = fs.readFileSync(filePath, "utf-8");
const data: unknown = JSON.parse(rawData);

console.log("\n========== FILE STRUCTURE ==========\n");

console.log(
  "Top-level type:",
  Array.isArray(data) ? "Array" : typeof data
);

let chunks: Record<string, unknown>[] = [];

if (Array.isArray(data)) {
  chunks = data as Record<string, unknown>[];
} else if (typeof data === "object" && data !== null) {
  const arrayEntry = Object.entries(data).find(
    ([, value]) => Array.isArray(value)
  );

  if (arrayEntry) {
    console.log("Chunk array property:", arrayEntry[0]);
    chunks = arrayEntry[1] as Record<string, unknown>[];
  }
}

console.log("\nTotal chunks:", chunks.length);

if (chunks.length === 0) {
  throw new Error("No chunks array found. Inspect the JSON structure.");
}

console.log("\n========== FIRST CHUNK ==========\n");

const firstChunk = chunks[0];

console.log("Chunk properties:", Object.keys(firstChunk));

for (const [key, value] of Object.entries(firstChunk)) {
  if (
    Array.isArray(value) &&
    value.length > 0 &&
    typeof value[0] === "number"
  ) {
    console.log(`${key}:`);
    console.log("  Dimensions:", value.length);
    console.log("  First 5 values:", value.slice(0, 5));
  } else {
    console.log(`${key}:`, value);
  }
}

console.log("\n========== VALIDATION ==========\n");

const vectorEntry = Object.entries(firstChunk).find(
  ([, value]) =>
    Array.isArray(value) &&
    value.length === 768 &&
    value.every((item) => typeof item === "number")
);

console.log(
  "768-dimensional vector found:",
  Boolean(vectorEntry)
);

console.log("\nInspection completed.");
