# Contributing to Hashify

Thank you for your interest in contributing to **Hashify**! We welcome contributions from everyone, whether it's reporting bugs, suggesting features, or submitting code improvements.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Reporting Issues](#reporting-issues)
- [Suggesting Enhancements](#suggesting-enhancements)

---

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

---

## Getting Started

### Prerequisites

- Node.js 18+ ([download](https://nodejs.org/))
- npm or yarn
- Git

### Fork and Clone

1. **Fork the repository** on GitHub
2. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR-USERNAME/Hashify.git
   cd Hashify
   ```

3. **Add upstream remote** (optional, but recommended):
   ```bash
   git remote add upstream https://github.com/Centre-for-Information-Technology-India/Hashify.git
   ```

---

## How to Contribute

### 1. **Report a Bug** 🐛

Found a bug? Please create an issue with:
- **Clear title**: "Bug: Description of the issue"
- **Detailed description**: What happened and what was expected?
- **Steps to reproduce**: How can we recreate it?
- **Screenshots/GIFs**: If applicable
- **Environment**: Browser, OS, Node version

### 2. **Suggest an Enhancement** ✨

Have an idea? We'd love to hear it!
- **Clear title**: "Feature: Brief description"
- **Motivation**: Why would this be useful?
- **Examples**: How would it work?
- **Alternatives**: Have you considered other approaches?

### 3. **Submit Code** 💻

Ready to code? Follow these steps:

---

## Development Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### 3. Run Tests

```bash
npm test
```

### 4. Build for Production

```bash
npm run build
npm start
```

### 5. Lint Code

```bash
npm run lint
```

---

## Commit Guidelines

We follow conventional commit messages for consistency:

### Commit Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that don't affect code meaning (formatting, etc.)
- **refactor**: Code change that neither fixes a bug nor adds a feature
- **perf**: Improvement in performance
- **test**: Adding or updating tests
- **chore**: Changes to build process, dependencies, or tools

### Examples

```bash
git commit -m "feat(hash-generator): add SHA-512 algorithm support"
git commit -m "fix(ui): improve dark theme text contrast"
git commit -m "docs: update README with installation steps"
git commit -m "refactor(utils): simplify hash validation logic"
```

---

## Pull Request Process

### Before You Start

1. **Create a branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

2. **Make your changes**:
   - Keep commits small and focused
   - Write meaningful commit messages
   - Follow the code style of the project

3. **Test thoroughly**:
   ```bash
   npm run dev      # Test in browser
   npm run build    # Check production build
   npm run lint     # Run linter
   ```

### Submitting a Pull Request

1. **Push your branch**:
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create a Pull Request** on GitHub with:
   - **Clear title**: What does this PR do?
   - **Description**: 
     - What changes are included?
     - Why are these changes needed?
     - How were they tested?
   - **Checklist**:
     - [ ] My code follows the code style
     - [ ] I've tested the changes locally
     - [ ] I've updated documentation if needed
     - [ ] I've added/updated tests if needed
     - [ ] My commits follow conventional commit format

3. **Review Process**:
   - At least one review is required before merge
   - CI/CD checks must pass
   - All conversations must be resolved
   - Keep the PR focused on one feature/fix

---

## Code Style Guidelines

### General

- Use **TypeScript** for all new code
- Follow **Tailwind CSS** for styling
- Use **Next.js 15+** patterns and best practices
- Keep components small and focused
- Write meaningful variable and function names

### React Components

```typescript
// ✅ Good
export function HashGenerator() {
  const [hash, setHash] = useState("");
  
  const handleGenerate = useCallback(() => {
    // logic
  }, []);
  
  return <div>{/* JSX */}</div>;
}

// ❌ Avoid
const HashGenerator = () => {
  let hash;
  // ...
};
```

### Imports

```typescript
// Group imports in this order:
// 1. External libraries
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

// 2. Internal modules
import { md5 } from '@/lib/md5';

// 3. Styles
import styles from './style.css';
```

---

## Testing

### Running Tests

```bash
npm test
```

### Writing Tests

- Write tests for new features
- Ensure existing tests still pass
- Aim for >80% code coverage

### Example Test

```typescript
import { md5 } from '@/lib/md5';

describe('MD5 Hash', () => {
  it('should generate correct hash', () => {
    const result = md5('hello');
    expect(result).toBe('5d41402abc4b2a76b9719d911017c592');
  });
});
```

---

## Documentation

### Updating Docs

- Update relevant `.md` files
- Keep documentation clear and concise
- Add examples where helpful
- Include links to related documentation

### File Examples

- Feature in `src/components/`: Update component docs
- New utility: Add JSDoc comments
- Breaking change: Update CHANGELOG.md

---

## Reporting Issues

### Security Issues

⚠️ **Do NOT open a public issue for security vulnerabilities!**

Instead, email `security@cit.org.in` or follow the [SECURITY.md](SECURITY.md) guidelines.

### Bug Reports

Use the [Bug Report](../../issues/new?template=bug_report.md) template.

### Feature Requests

Use the [Feature Request](../../issues/new?template=feature_request.md) template.

---

## Additional Notes

### Questions?

- Check the [README.md](README.md)
- Review [existing issues](../../issues)
- Check [Discussions](../../discussions)
- Email: [contact@cit.org.in](mailto:contact@cit.org.in)

### Recognition

Contributors will be recognized in:
- README.md contributors section
- GitHub contributors page
- Release notes for significant contributions

### Need Help?

- 📚 Read the [Developer Guide](docs/DEVELOPER_GUIDE.md)
- 🐛 Search [existing issues](../../issues)
- 💬 Start a [discussion](../../discussions)
- 📧 Reach out to the team

---

## License

By contributing to Hashify, you agree that your contributions will be licensed under its [MIT License](LICENSE).

Thank you for contributing! 🎉
