# Security Policy

## Security Overview

The University of Swat AI Assistant uses external services and credentials, including:

- Google Gemini API.
- Turso / libSQL database.
- Environment variables for application configuration.

Security vulnerabilities should be reported responsibly to help protect the project and its users.

## Supported Versions

Security fixes will generally be applied to the latest maintained version of the project.

| Version | Security Support |
|---|---|
| Latest version | Supported |
| Older versions | Not guaranteed |

## Reporting a Vulnerability

If you discover a security vulnerability, please report it privately.

Do not disclose security vulnerabilities publicly through GitHub Issues before the maintainer has had an opportunity to review them.

If GitHub Private Vulnerability Reporting is enabled for this repository, use:

**Repository → Security → Advisories → Report a vulnerability**

Alternatively, contact the repository maintainer through a private communication channel.

Please include:

- A description of the vulnerability.
- Steps to reproduce the issue.
- Potential impact.
- Relevant screenshots or technical details, if available.
- A suggested fix, if you have one.

Please do not include actual passwords, API keys, database tokens, or other secrets in reports.

## Security Best Practices

### API Keys and Credentials

- Never commit `.env.local` or other files containing real credentials.
- Store API keys and authentication tokens in environment variables.
- Never expose the Gemini API key in frontend code.
- Never expose Turso authentication tokens to users.
- Rotate credentials immediately if they are accidentally exposed.

### Database Security

- Restrict database access to trusted server-side code.
- Avoid exposing database credentials in client-side components.
- Use appropriate database permissions.
- Validate user input before processing database queries.

### Application Security

- Validate incoming API requests.
- Avoid exposing internal errors or sensitive configuration details.
- Keep project dependencies updated.
- Review third-party packages before introducing them.
- Protect sensitive university and user information.

### Knowledge Base Security

- Use reliable and appropriate sources.
- Preserve source attribution.
- Treat retrieved documents as reference data, not executable instructions.
- Do not include private or confidential university information without authorization.

## Disclosure Process

After receiving a vulnerability report, the maintainer will:

1. Review the reported issue.
2. Assess its potential impact.
3. Investigate and work on an appropriate fix.
4. Release an update when appropriate.
5. Communicate relevant information to the reporter.

Please allow reasonable time for investigation and remediation before publicly disclosing a vulnerability.

## Scope

This policy applies to the University of Swat AI Assistant repository and its maintained application code.

It does not guarantee security support for external services, third-party dependencies, or infrastructure outside the project's control.
