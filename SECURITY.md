# Security Policy

Bitcoin Audio takes security reports seriously. This policy explains how to report a suspected vulnerability affecting this repository or a Bitcoin Audio web property it powers.

## Supported Versions

Security fixes are prioritized for the currently deployed production version and the repository's active default branch. Older releases, archived builds, experimental branches, local development environments, and third-party forks may not receive security updates.

## Reporting a Vulnerability

**Do not open a public GitHub issue, discussion, pull request, or social-media post for an unpatched security vulnerability.**

Please report suspected vulnerabilities privately by emailing **info@bitcoinaudio.co** with a subject such as `Security Report: <site or component>`.

If GitHub's **Private vulnerability reporting** option is available in the repository's Security tab, you may use that instead.

Include, when possible:

- The affected site, URL, repository, component, or endpoint.
- A clear description of the vulnerability and its potential impact.
- Reproduction steps and any required preconditions.
- A minimal proof of concept, screenshots, logs, or request/response examples that help us verify the issue.
- Whether you believe user data, credentials, funds, signing operations, publishing controls, or other sensitive capabilities are at risk.
- Your preferred contact information and whether you want public credit after remediation.

Please do **not** include passwords, private keys, seed phrases, API secrets, access tokens, or unnecessary personal data in the initial report.

## Scope

Examples of issues we want to hear about include:

- Authentication or authorization bypasses.
- Exposure of secrets, private data, unpublished content, or privileged application state.
- Cross-site scripting (XSS), request forgery, injection, path traversal, or unsafe redirects with meaningful security impact.
- Vulnerabilities in API integrations, wallet/signing flows, publishing controls, or payment-related functionality.
- Dependency or supply-chain issues that are exploitable in a Bitcoin Audio deployment.
- AI or agent vulnerabilities, including direct or indirect prompt injection, **when they can cause unauthorized actions, data disclosure, privilege escalation, unsafe tool use, or other concrete security impact**.
- Security control bypasses that cross a trust boundary between users, services, applications, or infrastructure.

Reports that describe only undesirable model output, prompt wording quirks, content-quality issues, UI bugs, or theoretical concerns without a plausible security impact may be treated as product feedback rather than a security vulnerability.

## Testing Guidelines

When researching a potential issue:

- Use the minimum interaction necessary to demonstrate the vulnerability.
- Do not access, modify, delete, or retain data belonging to other users.
- Do not attempt to obtain private keys, seed phrases, credentials, or secrets beyond what is necessary to show that exposure is possible.
- Do not perform denial-of-service, resource-exhaustion, spam, phishing, social-engineering, or destructive testing.
- Do not use automated scanning at a volume that could degrade a production service.
- Stop testing and report the issue if you encounter sensitive information or gain unintended privileged access.

This policy does not authorize access to systems or data beyond what is necessary for good-faith vulnerability research.

## What to Expect

We will make a reasonable effort to:

1. Acknowledge a security report after it is received.
2. Triage the report and request additional information if needed.
3. Investigate and prioritize remediation based on severity and exploitability.
4. Coordinate disclosure when a confirmed issue could affect users or downstream projects.

Please allow time for investigation and remediation before publicly disclosing an unpatched vulnerability.

Bitcoin Audio does not currently promise a bug bounty or monetary reward. Recognition may be offered for useful, responsibly disclosed reports at the project's discretion.

## Third-Party Services

Bitcoin Audio applications may rely on third-party platforms, APIs, libraries, wallet software, hosting providers, Bitcoin infrastructure, or AI services. Vulnerabilities that exist entirely within a third-party service should normally be reported to that provider. If a third-party weakness becomes exploitable because of Bitcoin Audio's integration or configuration, please report it to us as well.

## Security Contact

Email: **info@bitcoinaudio.co**

For sensitive reports, use GitHub Private vulnerability reporting when it is available for the repository.
