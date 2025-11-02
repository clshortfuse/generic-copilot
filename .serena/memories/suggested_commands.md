# Suggested Commands for Generic Copilot Extension

## Development Commands

### Compile TypeScript
```bash
npm run compile
```
Compiles TypeScript source files to JavaScript in the `out/` directory.

### Watch Mode (during development)
```bash
npm run watch
```
Runs TypeScript compiler in watch mode. Automatically recompiles when source files change. Recommended for active development.

### Download VS Code API Types
```bash
npm run download-api
```
Downloads the latest VS Code proposed API type definitions and moves them to the src directory.

### Run Tests
```bash
npm test
```
Compiles the code and runs the test suite using vscode-test.

### Package Extension
```bash
npm run package
```
Packages the extension into a .vsix file using vsce for distribution.

## Linting and Formatting

### Run ESLint
```bash
npm run lint
```
Runs ESLint to check code quality and style compliance.

### Format Code with Prettier
```bash
npm run format
```
Formats all source code using Prettier.

## Development Workflow

### Initial Setup
1. Install dependencies: `npm install`
2. Download VS Code API types: `npm run download-api`
3. Compile code: `npm run compile`

### Active Development
1. Start watch mode: `npm run watch`
2. Run linting: `npm run lint`
3. Format code: `npm run format`
4. Test changes: `npm test`

### Before Commit
1. Format code: `npm run format`
2. Run lint: `npm run lint`
3. Run tests: `npm test`
4. Compile: `npm run compile`

### Distribution
1. Package extension: `npm run package`
2. Install in VS Code: `code --install-extension generic-copilot-providers.vsix`

## Debugging

### VS Code Developer Console
- Open VS Code: `Help > Toggle Developer Tools`
- View extension logs and errors in Console tab
- Useful for troubleshooting API requests and configuration issues

### Extension Output Channel
- View extension logs: `View > Output`
- Select "Generic Compatible Copilot" from dropdown
- Shows API calls, errors, and configuration warnings

### Testing Changes
1. Package extension: `npm run package`
2. Install in VS Code Insiders: `code-insiders --install-extension generic-copilot-providers.vsix`
3. Reload extension window
4. Check Developer Console for errors