```markdown
# skill Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill teaches best practices for developing JavaScript projects without a framework, focusing on consistent coding conventions, commit patterns, and testing strategies. It emphasizes maintainable code structure, clear naming, and modular design, as observed in the `skill` repository.

## Coding Conventions

### File Naming
- Use **camelCase** for file names.
  - Example: `myUtility.js`, `userProfile.test.js`

### Import Style
- Use **relative imports** for modules within the project.
  - Example:
    ```javascript
    import { fetchData } from './apiUtils';
    ```

### Export Style
- Use **named exports** to export functions or variables.
  - Example:
    ```javascript
    // In utils.js
    export function calculateSum(a, b) {
      return a + b;
    }

    // In another file
    import { calculateSum } from './utils';
    ```

### Commit Patterns
- Follow **conventional commit** format.
- Use the `fix` prefix for bug fixes.
  - Example:
    ```
    fix: correct calculation in sum function
    ```
- Keep commit messages concise (average 44 characters).

## Workflows

### Commit Changes
**Trigger:** When you have made code changes and are ready to commit.
**Command:** `/commit-changes`

1. Stage your changes:
    ```
    git add .
    ```
2. Write a conventional commit message, using the `fix` prefix for bug fixes:
    ```
    git commit -m "fix: correct typo in userProfile"
    ```
3. Push your changes:
    ```
    git push
    ```

### Run Tests
**Trigger:** When you want to verify code correctness.
**Command:** `/run-tests`

1. Identify test files (pattern: `*.test.*`).
2. Run your test runner (framework is unknown; replace with your tool):
    ```
    # Example using Jest
    npx jest
    ```
    or
    ```
    # Example using Mocha
    npx mocha "**/*.test.js"
    ```

## Testing Patterns

- Test files follow the pattern: `*.test.*` (e.g., `apiUtils.test.js`).
- Testing framework is not specified; use your preferred JavaScript test runner.
- Example test file:
    ```javascript
    // sum.test.js
    import { calculateSum } from './utils';

    test('adds two numbers', () => {
      expect(calculateSum(2, 3)).toBe(5);
    });
    ```

## Commands
| Command         | Purpose                                 |
|-----------------|-----------------------------------------|
| /commit-changes | Guide to committing code changes        |
| /run-tests      | Instructions for running test suites    |
```
