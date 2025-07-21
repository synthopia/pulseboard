# Security Policy

## Supported Versions

We actively support the following versions of Pulseboard with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security issue, please follow these steps:

### 1. **Do Not** Create a Public Issue

Please **do not** report security vulnerabilities through public GitHub issues, discussions, or pull requests.

### 2. Report Privately

Send your report to our security team at: **security@pulseboard.dev** (or create a private security advisory on GitHub)

Include the following information:

- Description of the vulnerability
- Steps to reproduce the issue
- Potential impact of the vulnerability
- Any suggested fixes (if you have them)

### 3. Response Timeline

We aim to respond to security reports within:

- **24 hours**: Initial acknowledgment
- **72 hours**: Initial assessment
- **7 days**: Regular updates on progress
- **30 days**: Resolution or detailed explanation if more time is needed

### 4. Responsible Disclosure

We follow a coordinated disclosure policy:

1. **Report received**: We acknowledge your report and begin investigation
2. **Investigation**: We work to reproduce and understand the issue
3. **Fix developed**: We develop and test a fix
4. **Fix released**: We release the fix in a new version
5. **Public disclosure**: After the fix is widely deployed, we may publicly disclose the vulnerability

## Security Best Practices

When using Pulseboard, we recommend:

### Environment Variables

- Never commit `.env` files to version control
- Use strong, unique passwords for databases
- Rotate API keys and secrets regularly
- Use environment-specific configurations

### Production Deployment

- Always use HTTPS in production
- Configure proper CORS origins (not `*`)
- Enable rate limiting appropriate for your use case
- Keep dependencies updated
- Use a reverse proxy (nginx, Cloudflare, etc.)
- Monitor logs for suspicious activity

### Database Security

- Use strong database passwords
- Limit database user permissions
- Enable SSL/TLS for database connections
- Regularly backup your data
- Keep your database server updated

### Docker Security

- Use official base images
- Run containers as non-root users when possible
- Regularly update base images
- Scan images for vulnerabilities
- Use multi-stage builds to minimize attack surface

## Security Features

Pulseboard includes several built-in security features:

- **Helmet.js**: Sets various HTTP headers to secure your app
- **CORS**: Configurable Cross-Origin Resource Sharing
- **Rate Limiting**: Protection against brute force attacks
- **Input Validation**: Zod schemas for request validation
- **Error Handling**: Prevents information leakage in error messages
- **Environment Validation**: Ensures required configuration is present

## Dependency Security

We regularly:

- Monitor dependencies for known vulnerabilities
- Update dependencies to patch security issues
- Use automated tools to detect vulnerable packages
- Follow semantic versioning for security updates

## Third-Party Security Research

We appreciate security researchers who help make Pulseboard safer. If you find a security vulnerability:

1. Follow our responsible disclosure process
2. Allow us reasonable time to fix the issue
3. Avoid accessing, modifying, or deleting user data
4. Don't perform actions that could harm our users or services

## Recognition

We believe in recognizing security researchers who help improve our security:

- Security researchers who follow our policy may be acknowledged in our security advisories (with permission)
- We maintain a list of security contributors in our documentation
- For significant findings, we may offer public recognition or swag

## Questions?

If you have questions about this security policy, please contact us at:

- Email: security@pulseboard.dev
- GitHub: Create a private security advisory

Thank you for helping keep Pulseboard and our users safe! 🔒
