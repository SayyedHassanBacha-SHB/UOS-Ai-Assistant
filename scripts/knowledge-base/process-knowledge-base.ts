
import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { cleanText } from "./text-cleaner";
import { chunkText } from "./chunker";

const ROOT_DIR = process.cwd();

const KNOWLEDGE_BASE_DIR = path.join(ROOT_DIR, "knowledge-base");
const OUTPUT_DIR = path.join(ROOT_DIR, "data", "processed");

interface ProcessedDocument {
  id: string;
  path: string;
  title: string;
  category: string;
  documentType: "university_content" | "source_document" | "project_document";
  includeInRag: boolean;
  sourceType: string | null;
  sourceUrls: string[];
  verificationStatus: string | null;
  sourceKeys: string[];
  isTimeSensitive: boolean | null;
  wordCount: number;
  hasFrontmatter: boolean;
  content: string;
}

interface ProcessedChunk {
  id: string;
  documentId: string;
  documentPath: string;
  title: string;
  category: string;
  documentType: "university_content" | "source_document" |"project_document";
  sourceType: string | null;
  sourceUrls: string[];
  verificationStatus: string | null;
  sourceKeys: string[];
  isTimeSensitive: boolean | null;
  chunkIndex: number;
  tokenCount: number;
  content: string;
}

async function getMarkdownFiles(
  directory: string
): Promise<string[]> {
  const entries = await fs.readdir(directory, {
    withFileTypes: true,
  });

  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      if (entry.name === "metadata") continue;

      files.push(...(await getMarkdownFiles(fullPath)));
    } else if (
      entry.isFile() &&
      entry.name.toLowerCase().endsWith(".md")
    ) {
      files.push(fullPath);
    }
  }

  return files;
}

function calculateWordCount(text: string): number {
  const normalizedText = text.trim();

  return normalizedText ? normalizedText.split(/\s+/).length : 0;
}

function createDocumentId(relativePath: string): string {
  return relativePath
    .replace(/\\/g, "/")
    .replace(/\.md$/i, "")
    .replace(/[^a-zA-Z0-9/_-]/g, "-")
    .replace(/\//g, "__");
}

function classifyDocument(
  relativePath: string
): {
  documentType: ProcessedDocument["documentType"];
  includeInRag: boolean;
} {
  const normalizedPath = relativePath.toLowerCase();

  if (path.basename(normalizedPath) === "readme.md") {
    return {
      documentType: "project_document",
      includeInRag: false,
    };
  }

  if (normalizedPath.startsWith("13-source-registry/")) {
    return {
      documentType: "source_document",
      includeInRag: true,
    };
  }

  return {
    documentType: "university_content",
    includeInRag: true,
  };
}

async function processDocument(
  filePath: string
): Promise<ProcessedDocument> {
  const rawContent = await fs.readFile(filePath, "utf-8");

  const parsed = matter(rawContent);

  const relativePath = path
    .relative(KNOWLEDGE_BASE_DIR, filePath)
    .replace(/\\/g, "/");

  const metadata = parsed.data;
  const content = cleanText(parsed.content);

  const classification = classifyDocument(relativePath);

  return {
    id: createDocumentId(relativePath),
    path: relativePath,

    title:
      typeof metadata.title === "string"
        ? metadata.title
        : path.basename(filePath, ".md"),

    category:
      typeof metadata.category === "string"
        ? metadata.category
        : "Uncategorized",

    documentType: classification.documentType,
    includeInRag: classification.includeInRag,

    sourceType:
      typeof metadata.source_type === "string"
        ? metadata.source_type
        : null,

    sourceUrls: Array.isArray(metadata.source_urls)
      ? metadata.source_urls.filter(
          (url: unknown): url is string =>
            typeof url === "string"
        )
      : [],

    verificationStatus:
      typeof metadata.verification_status === "string"
        ? metadata.verification_status
        : null,

    sourceKeys: Array.isArray(metadata.source_keys)
      ? metadata.source_keys.filter(
          (key: unknown): key is string =>
            typeof key === "string"
        )
      : [],

    isTimeSensitive:
      typeof metadata.is_time_sensitive === "boolean"
        ? metadata.is_time_sensitive
        : null,

    wordCount: calculateWordCount(content),
    hasFrontmatter: Object.keys(metadata).length > 0,
    content,
  };
}

async function main(): Promise<void> {
  console.log("Starting knowledge-base processing...\n");

  await fs.access(KNOWLEDGE_BASE_DIR);
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  const markdownFiles = await getMarkdownFiles(
    KNOWLEDGE_BASE_DIR
  );

  console.log(`Found ${markdownFiles.length} Markdown files.\n`);

  const documents: ProcessedDocument[] = [];
  const errors: string[] = [];

  for (const file of markdownFiles) {
    try {
      const document = await processDocument(file);

      documents.push(document);

      if (!document.hasFrontmatter) {
        console.warn(`Warning: Missing frontmatter: ${document.path}`);
      }

      if (document.category === "Uncategorized") {
        console.warn(`Warning: Missing category: ${document.path}`);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : String(error);

      errors.push(`${file}: ${message}`);
      console.error(`Failed: ${file}`);
    }
  }

  const outputPath = path.join(
    OUTPUT_DIR,
    "processed-documents.json"
  );

  await fs.writeFile(
    outputPath,
    JSON.stringify(documents, null, 2),
    "utf-8"
  );

  const ragDocuments = documents.filter(
    (document) => document.includeInRag
  );

  const chunks: ProcessedChunk[] = [];

  for (const document of ragDocuments) {
    const documentChunks = chunkText(document.content, {
      targetTokens: 500,
      maxTokens: 800,
      overlapTokens: 80,
    });

    documentChunks.forEach((chunk) => {
      chunks.push({
        id: `${document.id}__chunk_${chunk.index}`,
        documentId: document.id,
        documentPath: document.path,
        title: document.title,
        category: document.category,
        documentType: document.documentType,
        sourceType: document.sourceType,
        sourceUrls: document.sourceUrls,
        verificationStatus: document.verificationStatus,
        sourceKeys: document.sourceKeys,
        isTimeSensitive: document.isTimeSensitive,
        chunkIndex: chunk.index,
        tokenCount: chunk.tokenCount,
        content: chunk.content,
      });
    });
  }

  const chunksOutputPath = path.join(
    OUTPUT_DIR,
    "processed-chunks.json"
  );

  await fs.writeFile(
    chunksOutputPath,
    JSON.stringify(chunks, null, 2),
    "utf-8"
  );

  console.log("\n========== PROCESSING REPORT ==========");

  console.log(`Markdown files found: ${markdownFiles.length}`);
  console.log(`Successfully processed: ${documents.length}`);
  console.log(`Failed: ${errors.length}`);

  console.log(
    `University content: ${
      documents.filter((doc) => doc.documentType === "university_content").length
    }`
  );

  console.log(
    `Source documents: ${
      documents.filter((doc) => doc.documentType === "source_document").length
    }`
  );

  console.log(
    `Project documents: ${
      documents.filter((doc) => doc.documentType === "project_document").length
    }`
  );

  console.log(`RAG-eligible documents: ${ragDocuments.length}`);

  console.log(
    `Without frontmatter: ${
      documents.filter((doc) => !doc.hasFrontmatter).length
    }`
  );

  console.log(
    `Without source URLs: ${
      documents.filter((doc) => doc.sourceUrls.length === 0).length
    }`
  );

  console.log(
    `Total words: ${
      documents.reduce((total, doc) => total + doc.wordCount, 0)
    }`
  );

  console.log(`\nOutput: ${outputPath}`);

  if (errors.length > 0) {
    console.log("\nProcessing errors:");
    errors.forEach((error) => console.log(error));
  }

  console.log(`Total chunks generated: ${chunks.length}`);
  console.log(`Chunks output: ${chunksOutputPath}`);

  console.log("\nProcessing completed.");
}

main().catch((error) => {
  console.error("Fatal processing error:", error);
  process.exitCode = 1;
});
