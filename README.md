# University of Swat AI Assistant

An AI-powered chatbot designed to help visitors, prospective students, current students, and other users find information about the University of Swat through natural-language conversations.

The project uses **Retrieval-Augmented Generation (RAG)** to retrieve relevant information from a structured university knowledge base and provide context-aware responses using Google's Gemini AI.

> **Disclaimer:** This is an independent educational project. It is not an official product of, or endorsed by, the University of Swat.

## Overview

The University of Swat AI Assistant aims to make university information easier to access. Instead of manually searching through multiple webpages and documents, users can ask questions in natural language and receive conversational answers.

The chatbot combines a university-specific knowledge base, semantic vector search, and a generative AI model.

## Features

- Natural-language conversations about the University of Swat.
- Retrieval-Augmented Generation (RAG) for university-specific information.
- Semantic search using vector embeddings.
- Structured Markdown knowledge base.
- Vector storage and similarity search using Turso.
- Gemini-powered response generation.
- Streaming responses for a responsive chat experience.
- Conversation history support.
- Support for general educational and informational questions.

## Technology Stack

| Technology | Purpose |
|---|---|
| Next.js | Application framework |
| React | User interface |
| TypeScript | Type-safe development |
| Tailwind CSS | Interface styling |
| Google Gemini API | AI response generation and embeddings |
| Turso / libSQL | Vector database |
| `gemini-embedding-001` | Text embedding model |
| React Markdown | Rendering formatted chatbot responses |

## How It Works

The chatbot follows a Retrieval-Augmented Generation workflow:

1. A user submits a question.
2. Gemini converts the question into a vector embedding.
3. Turso performs semantic similarity search against the university knowledge base.
4. Relevant knowledge chunks are retrieved.
5. The retrieved information is provided to Gemini as context.
6. Gemini generates a response based on the question and available context.
7. The response is streamed to the chatbot interface.

### RAG Architecture

```text
User Question
      |
      v
Query Embedding
      |
      v
Turso Vector Search
      |
      v
Relevant Knowledge Chunks
      |
      v
Gemini AI + Retrieved Context
      |
      v
Generated Response
      |
      v
Chatbot Interface
```

## Project Structure

```text
uos-ai-assistant/
│
├── public/
├── src/
│   ├── app/
│   │   └── api/
│   │       └── chat/
│   ├── components/
│   │   └── chatbot/
│   └── lib/
│       └── rag/
│           └── retrieval.ts
│
├── knowledge-base/
├── scripts/
│   └── knowledge-base/
│
├── data/
│   └── processed/
│
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

Generated files and additional folders may vary as the project develops.

## Getting Started

### Prerequisites

Before running the project, make sure you have:

- Node.js installed.
- npm installed.
- A Google Gemini API key.
- A Turso account and database.

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR-USERNAME/uos-ai-assistant.git
```

### 2. Navigate to the Project

```bash
cd uos-ai-assistant
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env.local` file in the project root.

Add the following variables:

```env
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=your_gemini_model

TURSO_DATABASE_URL=your_turso_database_url
TURSO_AUTH_TOKEN=your_turso_auth_token
```

Replace the placeholder values with your actual credentials.

**Never commit `.env.local` or expose API keys and database authentication tokens.**

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Knowledge Base

The knowledge base contains structured university information stored in Markdown files.

It is organized into categories such as:

- University overview
- Admissions
- Academics
- Departments and faculty
- Student services
- Administration
- Research and development
- Policies and regulations
- News and announcements
- Careers and opportunities
- Official documents
- Contacts and FAQs
- Source registry

### Knowledge Processing Pipeline

The knowledge-base processing workflow consists of three main stages:

1. **Document processing:** Reads Markdown files and extracts their content and metadata.
2. **Chunking and embedding:** Splits documents into smaller chunks and generates vector embeddings.
3. **Database import:** Stores the embeddings and associated metadata in Turso.

The corresponding scripts are located in:

```text
scripts/knowledge-base/
```

## Development Commands

```bash
# Start development server
npm run dev

# Create production build
npm run build

# Run production server
npm run start

# Run lint checks
npm run lint
```

## Current Project Status

The project has a working chatbot interface, Gemini-powered response generation, a structured university knowledge base, and a functioning RAG retrieval pipeline connected to Turso.

Development is ongoing. Further improvements will focus on expanding and maintaining the knowledge base, improving retrieval quality, and making responses more reliable and informative.

## Future Improvements

- Expand the university knowledge base.
- Improve retrieval accuracy and relevance filtering.
- Add document-based source references to answers.
- Improve handling of outdated and time-sensitive information.
- Develop a knowledge-base management workflow.
- Evaluate chatbot accuracy using predefined questions.
- Improve user experience and accessibility.

## Contributing

Contributions, suggestions, and bug reports are welcome.

Please read [CONTRIBUTING.md](CONTRIBUTING.md) before submitting changes.

## Security

Please do not publish API keys, database tokens, or other confidential information.

For security-related concerns, follow the instructions in [SECURITY.md](SECURITY.md).

## Acknowledgements

- University of Swat — for publicly available university information used as the basis of the knowledge base.
- Google — for Gemini AI and embedding services.
- Turso — for vector database functionality.
- The open-source developers and communities behind the technologies used in this project.

## License

See the [LICENSE](LICENSE) file for the terms governing the project's original source code. University documents and third-party materials may have separate ownership and usage terms.
