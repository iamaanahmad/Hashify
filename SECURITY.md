# Security Policy

## Reporting Security Issues

**Do NOT open a public GitHub issue for security vulnerabilities!**

We take security seriously. If you discover a security vulnerability in Hashify, please report it responsibly to us.

### How to Report

1. **Email**: Send a detailed report to [security@cit.org.in](mailto:security@cit.org.in)
   - Include the vulnerability details
   - Steps to reproduce
   - Potential impact
   - Your contact information

2. **PGP Encryption** (Optional):
   - Contact us for our public key
   - Encrypt sensitive information

3. **GitHub Security Advisory** (If you prefer):
   - Go to [Security Advisories](../../security/advisories)
   - Click "Report a vulnerability"

---

## What to Include

Please provide:

- **Description**: Clear explanation of the vulnerability
- **Location**: Where in the code is the issue?
- **Steps to Reproduce**: Detailed steps to trigger the vulnerability
- **Impact**: How severe is this issue?
- **Proof of Concept**: If applicable, provide a PoC
- **Suggested Fix**: If you have one

---

## Response Timeline

- **Initial Response**: Within 48 hours
- **Assessment**: Within 7 days
- **Fix Timeline**: Depends on severity
  - Critical: 24-48 hours
  - High: 3-7 days
  - Medium: 1-2 weeks
  - Low: As scheduled
- **Disclosure**: Coordinated disclosure after patch release

---

## Severity Levels

### Critical 🔴

- Arbitrary code execution
- Complete data compromise
- System-wide impact
- Affects all users

**Fix**: Immediate release

### High 🟠

- Authentication bypass
- Authorization bypass
- Major data exposure
- Affects many users

**Fix**: Within days

### Medium 🟡

- Moderate data exposure
- Limited functionality impact
- Affects some users
- Workaround available

**Fix**: Within weeks

### Low 🟢

- Minor information disclosure
- Edge case vulnerability
- Limited user impact
- No workaround needed

**Fix**: Next scheduled release

---

## Security Best Practices

When using Hashify:

### ✅ Do

- Keep dependencies updated
- Use HTTPS for all communications
- Sanitize user inputs
- Implement rate limiting
- Use strong encryption
- Monitor for anomalies
- Report security issues responsibly

### ❌ Don't

- Expose API keys or secrets
- Use Hashify as sole security measure
- Ignore security updates
- Commit sensitive data
- Skip input validation
- Trust client-side validation alone
- Share vulnerability details publicly before patch

---

## Security Features

### Built-In Protections

- **Input Validation**: All inputs validated
- **XSS Prevention**: Sanitization in place
- **CSRF Protection**: Tokens where applicable
- **Rate Limiting**: Prevent abuse
- **Secure Headers**: Security headers configured
- **Dependency Scanning**: Regular vulnerability checks
- **Code Review**: All changes reviewed

### HashAlgorithms

- **MD5**: Legacy algorithm, suitable for non-cryptographic use
- **SHA-256**: Cryptographically secure
- **SHA-512**: Cryptographically secure

⚠️ **Note**: Hashify is for generating and comparing hashes. It's NOT a password hashing solution. For passwords, use bcrypt, scrypt, or Argon2.

---

## Dependencies

We regularly audit dependencies for vulnerabilities:

```bash
npm audit
```

Updates are applied:
- **Critical**: Immediately
- **High**: Within 48 hours
- **Medium**: Within 1 week
- **Low**: Monthly review

---

## Security Headers

The application includes:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=31536000`
- `Content-Security-Policy: default-src 'self'`

---

## Encryption

- **Transport**: All traffic uses HTTPS/TLS
- **Storage**: No sensitive data stored locally without encryption
- **Hashing**: Uses Web Crypto API for cryptographic operations

---

## Privacy Considerations

- No user data is logged or stored
- No tracking or analytics that identify users
- All hashing is done client-side
- No third-party services have access to user data

---

## Responsible Disclosure

We practice responsible disclosure:

1. **Report privately** to security team
2. **Acknowledge** receipt within 48 hours
3. **Investigate** thoroughly
4. **Fix** the vulnerability
5. **Test** the fix
6. **Release** patch version
7. **Disclose** after users have time to update
8. **Credit** responsible reporter (optional)

---

## Contact

For security concerns:

- 📧 **Email**: [security@cit.org.in](mailto:security@cit.org.in)
- 🔒 **Private Report**: Use GitHub Security Advisory
- 💬 **Questions**: [GitHub Discussions](../../discussions)

---

## Related Documents

- [LICENSE](LICENSE) - MIT License
- [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) - Community guidelines
- [CONTRIBUTING.md](CONTRIBUTING.md) - Contribution guidelines
- [README.md](README.md) - Project documentation

---

## Acknowledgments

Thank you to all security researchers who responsibly report vulnerabilities. Your help makes Hashify safer for everyone. 🙏

---

**Last Updated**: November 11, 2025
