# Contributing to AIXONTRA

Thank you for your interest in contributing to AIXONTRA! This document provides guidelines and instructions for contributing.

## Code of Conduct

Please be respectful and constructive in all interactions with the community.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/aixontra.git`
3. Follow the [Setup Guide](SETUP.md) to get the project running locally
4. Create a new branch for your feature: `git checkout -b feature/your-feature-name`

## Development Workflow

### 1. Pick an Issue or Create One

- Browse [existing issues](https://github.com/dukens11-create/aixontra/issues)
- Comment on an issue to let others know you're working on it
- For new features, create an issue first to discuss the approach

### 2. Make Your Changes

- Write clean, readable code
- Follow the existing code style
- Add comments for complex logic
- Keep commits focused and atomic

### 3. Test Your Changes

- Test manually in the browser
- Ensure no console errors
- Verify responsive design on mobile
- Test with different user roles (user, admin)

### 4. Commit Your Changes

Use conventional commit messages:

```
feat: add playlist sharing feature
fix: resolve audio player skip bug
docs: update API documentation
style: format code with prettier
refactor: simplify track upload logic
test: add tests for comment system
```

### 5. Push and Create a Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a pull request on GitHub with:
- Clear title describing the change
- Description of what changed and why
- Screenshots/videos for UI changes
- Reference to related issues

## Code Style Guide

### TypeScript

- Use TypeScript for all new code
- Define interfaces for data structures
- Avoid `any` type when possible
- Use meaningful variable names

### React Components

- Use functional components with hooks
- Keep components small and focused
- Extract reusable logic into custom hooks
- Use proper TypeScript types for props

### File Naming

- Components: `PascalCase.tsx` (e.g., `TrackCard.tsx`)
- Utilities: `camelCase.ts` (e.g., `formatDuration.ts`)
- Hooks: `useCamelCase.ts` (e.g., `usePlayer.ts`)

### Imports

Organize imports in this order:
1. React/Next.js
2. Third-party libraries
3. Internal components
4. Internal utilities
5. Types
6. Styles

```typescript
import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { formatDuration } from '@/lib/utils';
import type { Track } from '@/types';
```

## Project Structure

```
src/
├── app/          # Next.js pages and API routes
├── components/   # React components
│   └── ui/      # Reusable UI components
├── lib/         # Utilities and helpers
├── stores/      # Zustand state stores
├── hooks/       # Custom React hooks
└── types/       # TypeScript types
```

## What to Contribute

### Good First Issues

- UI improvements
- Bug fixes
- Documentation updates
- Accessibility improvements

### Feature Ideas

- Enhanced search and filtering
- Social features (shares, mentions)
- Analytics dashboard
- Mobile app (React Native)
- API for third-party integrations

### Areas Needing Help

- Test coverage
- Accessibility
- Performance optimization
- Documentation
- Internationalization

## Pull Request Review Process

1. A maintainer will review your PR
2. You may be asked to make changes
3. Once approved, your PR will be merged
4. Your contribution will be credited in the release notes

## Questions?

- Open a [GitHub Discussion](https://github.com/dukens11-create/aixontra/discussions)
- Ask in PR comments
- Check existing documentation

Thank you for contributing to AIXONTRA! 🎵
