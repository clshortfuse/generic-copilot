# Code Style & Conventions

## TypeScript Configuration

The project uses TypeScript with strict mode enabled and the following key settings:
- **Target**: ES2024
- **Module**: Node16
- **Strict Mode**: Enabled
- **No Implicit Returns**: Enabled
- **No Fallthrough Cases in Switch**: Enabled
- **No Unused Parameters**: Enabled

## Naming Conventions

### Variables and Functions
- Use camelCase for variables and function names
- Example: `parseModelId`, `executeWithRetry`, `userAgent`

### Classes and Interfaces
- Use PascalCase for class and interface names
- Example: `ChatModelProvider`, `ModelItem`, `ProviderConfig`

### Constants
- Use UPPER_SNAKE_CASE with const
- Example: `RETRY_MAX_ATTEMPTS`, `MAX_TOOLS_PER_REQUEST`

### Private Members
- Use underscore prefix for private members (not TypeScript private keyword)
- Example: `_toolCallBuffers`, `_completedToolCallIndices`, `_lastRequestTime`

### Imports
- Use named imports when importing specific items
- Example: `import { parseModelId, executeWithRetry } from "./utils"`
- Use PascalCase for VS Code namespace imports
- Example: `import * as vscode from "vscode"`

## Code Style Rules

### ESLint Configuration

The project uses ESLint with the following key rules:

**Code Style Rules:**
- `curly`: Use braces for control structures (warn)
- `@stylistic/semi`: Always use semicolons (warn)

**Naming Conventions:**
- Import statements must use camelCase or PascalCase format

**TypeScript Specific:**
- `@typescript-eslint/naming-convention`: Enforces camelCase for imports and PascalCase for classes

**Code Quality:**
- `@typescript-eslint/no-unused-vars`: Report errors on unused parameters
  - Exception: Parameters starting with `_` are ignored
- `@typescript-eslint/no-empty-function`: Disabled (allows empty functions if needed)

**Ignored Checks:**
- Array type checking is disabled
- Empty function bodies allowed

## Formatting

### Code Formatting with Prettier
- Use Prettier for consistent code formatting
- Run `npm run format` to format all code
- Prettier is configured with default settings

### Indentation
- Use 4 spaces for indentation
- No tabs in source code

### Quotes
- Use double quotes for strings (Prettier default)

### Line Length
- Follow Prettier's default line wrapping

## Documentation Standards

### JSDoc Comments
- Document public APIs and complex functions with JSDoc
- Include parameter types and descriptions
- Example:
  ```typescript
  /**
   * Parse a model ID that may contain a configuration ID separator.
   * @param modelId The model ID to parse
   * @returns Object containing baseId and optional configId
   */
  ```

### Inline Comments
- Use multi-line comments for complex logic
- Use single-line comments for inline hints
- Comment TODO items with `// TODO:`
- Comment FIXME items with `// FIXME:`

## File Organization

### Import Order
1. Standard library imports (node modules)
2. Third-party library imports (vscode)
3. Local application imports

Within each group, use alphabetical order.

Example:
```typescript
import * as vscode from "vscode";

import type {
	ModelItem,
	ReasoningDetail,
	ReasoningConfig,
} from "./types";

import {
	parseModelId,
	executeWithRetry,
	resolveModelWithProvider,
} from "./utils";
```

### Type-Only Imports
- Use `import type` for type-only imports when possible
- Improves type checking performance

Example:
```typescript
import type { ModelItem, ProviderConfig } from "./types";
```

## Error Handling

### VS Code Error Handling
- Use VS Code's `vscode.window.showErrorMessage` for user-facing errors
- Use VS Code's `vscode.window.showInformationMessage` for success/info messages
- Log internal errors to console with appropriate context

### HTTP/Retry Errors
- Use configured retry mechanism for transient API errors
- Retryable status codes: 429, 500, 502, 503, 504
- Respect retry configuration from settings

## TypeScript Best Practices

### Interface vs Type
- Use `interface` for object shapes and contracts
- Use `type` for unions, primitives, and complex type manipulations
- Prefer interface for public APIs

### Optional Properties
- Use `?` syntax for optional properties
- Use `undefined` rather than `null` unless required by API
- Example: `provider?: string`

### Null Handling
- Use `| null` union type for nullable values
- Example: `temperature?: number | null;`
- Allow explicit null to disable provider defaults

### Type Assertions
- Avoid using `as` assertions when possible
- Prefer more specific type checking
- Use JSDoc comments for complex type logic

## Function Design

### Parameter Ordering
1. Required parameters first
2. Optional parameters last
3. Context/lifecycle parameters first
4. Configuration parameters last

### Return Types
- Always specify return types for functions
- Use `void` explicitly when function doesn't return
- Use union types for functions with multiple return scenarios

### Arrow Functions
- Use for short, single-expression return values
- Use regular function syntax for methods or complex logic
- Use function keyword for constructors and class methods

## VS Code Extension Specific

### Extension Lifecycle
- Use `activate(context)` for initialization
- Use `deactivate()` for cleanup
- Properly dispose subscriptions in deactivate function

### Secret Storage
- Use `context.secrets` for storing API keys
- Key format: `generic-copilot.apiKey.<provider-key>`

### Command Registration
- Register commands in activation function
- Store subscriptions in `context.subscriptions`
- Use async/await for command handlers

### API Usage
- Use VS Code proposed APIs with proper feature flags
- Handle features gracefully when APIs change
- Reference proposed API types in `.d.ts` files