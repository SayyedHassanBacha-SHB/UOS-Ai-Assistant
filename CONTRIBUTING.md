# Contributing to University of Swat AI Assistant

Thank you for your interest in contributing to the University of Swat AI Assistant!

Contributions, suggestions, bug reports, and improvements are welcome. This document explains how to contribute to the project.

## Getting Started

Before contributing, make sure you have:

- Node.js installed.
- npm installed.
- Git installed.
- A Google Gemini API key.
- A Turso database account for testing RAG functionality.

### 1. Fork the Repository

Fork the repository to your GitHub account.

### 2. Clone Your Fork

```bash
git clone https://github.com/YOUR-USERNAME/uos-ai-assistant.git
```

Navigate to the project directory:

```bash
cd uos-ai-assistant
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env.local` file in the project root and configure the required environment variables.

Refer to `.env.example` for the required configuration.

Never commit API keys, database tokens, or other sensitive credentials.

### 5. Start the Development Server

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## How to Contribute

### Reporting Bugs

When reporting a bug, include:

- A clear description of the problem.
- Steps to reproduce the issue.
- Expected behavior.
- Actual behavior.
- Relevant error messages or screenshots.

### Suggesting Features

Feature suggestions should explain:

- What the proposed feature does.
- Why it would be useful.
- How it could improve the chatbot or its knowledge retrieval.

### Submitting Changes

1. Create a new branch for your changes.

```bash
git checkout -b feature/your-feature-name
```

2. Make your changes.

3. Check TypeScript compilation:

```bash
npx tsc --noEmit
```

4. Run lint checks:

```bash
npm run lint
```

5. Test the relevant functionality.

6. Commit your changes with a meaningful message.

```bash
git add .
git commit -m "Add: describe your changes"
```

7. Push your branch.

```bash
git push origin feature/your-feature-name
```

8. Open a Pull Request against the original repository's `main` branch.

## Development Guidelines

Please follow these guidelines:

- Use TypeScript for application development.
- Follow the existing project structure and coding conventions.
- Write readable and maintainable code.
- Avoid unnecessary changes to existing functionality.
- Do not expose API keys, authentication tokens, or private information.
- Test changes before submitting a Pull Request.
- Keep dependencies and packages relevant to the project.

## Knowledge Base Contributions

The project uses a structured Markdown knowledge base for Retrieval-Augmented Generation (RAG).

When contributing university information:

- Prefer official University of Swat sources.
- Include the original source URL.
- Follow the existing YAML frontmatter format.
- Preserve source attribution.
- Include verification status and relevant dates.
- Avoid unsupported or outdated information.
- Do not present unverified information as official fact.

Contributions involving university policies, admission criteria, fees, deadlines, or other time-sensitive information should include reliable supporting sources.

## Pull Request Guidelines

Before submitting a Pull Request:

- Ensure your changes are relevant to the project.
- Provide a clear title and description.
- Explain what you changed and why.
- Mention any related issues.
- Include screenshots when relevant to interface changes.
- Confirm that sensitive information has not been committed.

## License

By contributing to this project, you agree that your contributions will be licensed under the project's MIT License, subject to your ownership or authorization to contribute the submitted material.

Third-party materials and university documents may be subject to separate rights and permissions.

Thank you for helping improve the University of Swat AI Assistant!
