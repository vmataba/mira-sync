# Contributing to Mira Sync

Thank you for your interest in contributing to Mira Sync! This document provides guidelines and instructions for contributing.

## 🚀 Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/mira-sync.git
   cd mira-sync
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Set up environment variables** (see README.md)
5. **Create a branch** for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 💻 Development Workflow

### Running the App

```bash
npm run dev
```

### Running Tests

```bash
npm run test
```

### Linting

```bash
npm run lint
```

### Building

```bash
npm run build
```

## 📝 Code Style Guidelines

### TypeScript

- Use TypeScript for all new files
- Define proper interfaces and types
- Avoid `any` type when possible
- Use meaningful variable and function names

### React Components

- Use functional components with hooks
- Keep components small and focused
- Extract reusable logic into custom hooks
- Use proper prop typing with TypeScript interfaces

### File Organization

```
src/
├── components/     # Reusable UI components
├── services/       # Firebase and API services
├── auth/          # Authentication logic
├── utils/         # Utility functions
└── models.ts      # TypeScript interfaces
```

### Naming Conventions

- **Components**: PascalCase (e.g., `TaskCard.tsx`)
- **Functions**: camelCase (e.g., `handleSubmit`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `DEFAULT_TIMEOUT`)
- **Interfaces**: PascalCase with descriptive names (e.g., `TaskFormState`)

## 🎯 Commit Guidelines

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks

### Examples

```bash
feat(tasks): add priority-based sorting
fix(auth): resolve login redirect issue
docs(readme): update installation instructions
style(components): format TaskCard component
```

## 🐛 Reporting Bugs

When reporting bugs, please include:

1. **Description**: Clear description of the issue
2. **Steps to Reproduce**: Detailed steps to reproduce the bug
3. **Expected Behavior**: What you expected to happen
4. **Actual Behavior**: What actually happened
5. **Screenshots**: If applicable
6. **Environment**: Browser, OS, Node version, etc.

## ✨ Feature Requests

When requesting features, please include:

1. **Use Case**: Why is this feature needed?
2. **Proposed Solution**: How should it work?
3. **Alternatives**: Any alternative solutions considered?
4. **Additional Context**: Screenshots, mockups, etc.

## 🔍 Pull Request Process

1. **Update Documentation**: Update README.md if needed
2. **Add Tests**: Include tests for new features
3. **Follow Code Style**: Ensure code follows project conventions
4. **Test Thoroughly**: Test your changes locally
5. **Write Clear Description**: Explain what and why in PR description
6. **Link Issues**: Reference related issues in PR description

### PR Checklist

- [ ] Code follows project style guidelines
- [ ] Tests added/updated and passing
- [ ] Documentation updated
- [ ] No console errors or warnings
- [ ] Builds successfully (`npm run build`)
- [ ] Linting passes (`npm run lint`)

## 🔒 Security

- **Never commit sensitive data** (API keys, passwords, etc.)
- **Use environment variables** for configuration
- **Review Firebase security rules** before deployment
- **Report security vulnerabilities** privately to maintainers

## 📚 Resources

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Material-UI Documentation](https://mui.com/)
- [Firebase Documentation](https://firebase.google.com/docs)

## 💬 Questions?

Feel free to open an issue for questions or discussions!

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.
