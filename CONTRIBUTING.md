# Contributing to Happy Drives

Thank you for considering contributing to Happy Drives! We welcome contributions from the community.

## How to Contribute

### Reporting Bugs

If you find a bug, please open an issue with:
- A clear, descriptive title
- Steps to reproduce the bug
- Expected behavior vs actual behavior
- Screenshots if applicable
- Your environment (OS, browser, versions)

### Suggesting Features

We love new ideas! To suggest a feature:
- Open an issue with the "enhancement" label
- Describe the feature and why it would be useful
- Provide examples or mockups if possible

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Make your changes** with clear, descriptive commits
3. **Test your changes** thoroughly
4. **Update documentation** if needed
5. **Submit a pull request** with a clear description

### Code Style

#### Frontend (React)
- Use functional components with hooks
- Follow React best practices
- Use Tailwind CSS for styling (no inline styles)
- Use Lucide React for icons (no emojis)
- Use meaningful variable and function names
- Add comments for complex logic

#### Backend (FastAPI)
- Follow PEP 8 style guide
- Use type hints for function parameters and returns
- Write docstrings for all functions and classes
- Use async/await for I/O operations
- Handle errors gracefully

### Commit Messages

Write clear commit messages:
```
feat: Add car availability calendar
fix: Resolve payment gateway timeout issue
docs: Update API documentation
style: Format code according to PEP 8
refactor: Simplify booking validation logic
test: Add tests for payment verification
```

### Development Workflow

1. Create a new branch: `git checkout -b feature/your-feature-name`
2. Make your changes and commit: `git commit -m "feat: your feature"`
3. Push to your fork: `git push origin feature/your-feature-name`
4. Open a Pull Request

### Testing

Before submitting a PR:
- Run linters: `yarn lint` (frontend) and `ruff check .` (backend)
- Test locally with both frontend and backend running
- Ensure no console errors
- Test responsive design on different screen sizes

### Code Review

All PRs will be reviewed by maintainers. We may:
- Ask questions or request clarifications
- Suggest improvements or changes
- Approve and merge your PR

Please be patient and respectful during the review process.

## Community Guidelines

- Be respectful and inclusive
- Provide constructive feedback
- Help others when you can
- Follow the [Code of Conduct](CODE_OF_CONDUCT.md)

## Questions?

If you have questions, feel free to:
- Open an issue with the "question" label
- Email us at dev@happydrives.com
- Join our Discord community (coming soon)

Thank you for contributing to Happy Drives! 🚗
