
export interface ChunkingOptions {
  targetTokens: number;
  maxTokens: number;
  overlapTokens: number;
}

export interface TextChunk {
  content: string;
  tokenCount: number;
  index: number;
}

interface TextBlock {
  content: string;
  headingContext: string;
}

const DEFAULT_OPTIONS: ChunkingOptions = {
  targetTokens: 500,
  maxTokens: 800,
  overlapTokens: 80,
};

// Temporary approximation. A real tokenizer will be used later.
function estimateTokens(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

function splitIntoBlocks(text: string): TextBlock[] {
  const lines = text.replace(/\r\n?/g, "\n").split("\n");

  const blocks: TextBlock[] = [];
  const headingStack: { level: number; text: string }[] = [];

  let paragraphLines: string[] = [];

  function saveParagraph(): void {
    const content = paragraphLines.join("\n").trim();
    paragraphLines = [];

    if (!content) return;

    blocks.push({
      content,
        headingContext: headingStack
        .map((heading) => `${"#".repeat(heading.level)} ${heading.text}`)
        .join("\n"),
    });
  }

  for (const line of lines) {
    const match = line.match(/^(#{1,6})\s+(.+?)\s*#*$/);

    if (match) {
      saveParagraph();

      const level = match[1].length;
      const heading = match[2];

      while (
        headingStack.length > 0 &&
        headingStack[headingStack.length - 1].level >= level
      ) {
        headingStack.pop();
      }

      headingStack.push({ level, text: heading });
    } else if (!line.trim()) {
      saveParagraph();
    } else {
      paragraphLines.push(line);
    }
  }

  saveParagraph();

  return blocks;
}

function buildChunk(
  blocks: TextBlock[],
  headingContext: string
): string {
  const body = blocks.map((block) => block.content).join("\n\n");

  return [headingContext, body].filter(Boolean).join("\n\n");
}

export function chunkText(
  text: string,
  options: ChunkingOptions = DEFAULT_OPTIONS
): TextChunk[] {
  const blocks = splitIntoBlocks(text);
  const chunks: TextChunk[] = [];

  let currentBlocks: TextBlock[] = [];
  let currentContext = "";

  function saveChunk(): void {
    if (currentBlocks.length === 0) return;

    const content = buildChunk(currentBlocks, currentContext);

    chunks.push({
      content,
      tokenCount: estimateTokens(content),
      index: chunks.length,
    });

    currentBlocks = [];
  }

  for (const block of blocks) {
    const nextContext = block.headingContext;

    const candidate = [...currentBlocks, block];
    const candidateContent = buildChunk(candidate, nextContext);

    if (
    currentBlocks.length > 0 &&
    (
        nextContext !== currentContext ||
        estimateTokens(candidateContent) > options.targetTokens
    )
    ) {
    saveChunk();
    }

    if (estimateTokens(block.content) > options.maxTokens) {
      saveChunk();

      const words = block.content.split(/\s+/);
      const step = Math.max(
        1,
        options.maxTokens - options.overlapTokens
      );

      for (let i = 0; i < words.length; i += step) {
        const part = words.slice(i, i + options.maxTokens).join(" ");
        const content = buildChunk(
          [{ content: part, headingContext: nextContext }],
          nextContext
        );

        chunks.push({
          content,
          tokenCount: estimateTokens(content),
          index: chunks.length,
        });
      }

      continue;
    }

    if (currentBlocks.length === 0) {
      currentContext = nextContext;
    }

    currentBlocks.push(block);
  }

  saveChunk();

  return chunks;
}


