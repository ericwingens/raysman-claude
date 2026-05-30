```markdown
# raysman-claude Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill teaches the core development patterns, coding conventions, and workflows used in the `raysman-claude` TypeScript repository. It covers file organization, import/export styles, commit message habits, and testing patterns to help contributors write consistent, maintainable code.

## Coding Conventions

### File Naming
- Use **camelCase** for file names.
  - Example: `userProfile.ts`, `dataFetcher.test.ts`

### Import Style
- Use **relative imports** for referencing local modules.
  ```typescript
  import { fetchData } from './dataFetcher';
  ```

### Export Style
- Use **named exports** for all modules.
  ```typescript
  // In dataFetcher.ts
  export function fetchData() { ... }
  ```

### Commit Messages
- Freeform style, sometimes with prefixes.
- Average length: ~54 characters.
  - Example: `Add user authentication logic`
  - Example: `fix: correct typo in fetchData`

## Workflows

### Code Contribution
**Trigger:** When adding or updating code in the repository  
**Command:** `/contribute`

1. Create or update files using camelCase naming.
2. Use relative imports to reference other modules.
3. Export all functions or constants using named exports.
4. Write clear, concise commit messages (freeform or with a prefix).
5. If adding new features or fixing bugs, consider writing or updating corresponding test files (`*.test.ts`).

### Testing
**Trigger:** When verifying code correctness  
**Command:** `/test`

1. Create test files alongside implementation files, using the `.test.ts` suffix.
2. Use the project's preferred (unknown) testing framework.
3. Run tests to ensure all cases pass before committing changes.

## Testing Patterns

- Test files are named with the `.test.ts` suffix and placed alongside or near the code they test.
  - Example: `dataFetcher.test.ts`
- The specific testing framework is not detected, so follow existing patterns in the repository for writing and running tests.

## Commands
| Command      | Purpose                                      |
|--------------|----------------------------------------------|
| /contribute  | Steps for contributing code                  |
| /test        | Steps for writing and running tests          |
```