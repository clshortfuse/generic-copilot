# Task Completion Checklist

## Before Submitting/Pushing Changes

### Code Quality
1. **Run Code Formatter**: `npm run format`
   - Formats all code with Prettier
   - Ensures consistent style across codebase

2. **Run Linting**: `npm run lint`
   - Check for ESLint violations
   - Fix any errors or warnings

3. **Type Check**: `npm run compile`
   - Ensures TypeScript compiles without errors
   - Validates all type definitions

4. **Run Tests**: `npm test`
   - Execute test suite
   - Ensure all tests pass

### Build Verification
- Ensure `npm run compile` completes successfully
- Verify `out/` directory contains compiled JavaScript (if not in gitignore)

### Git Status
- Review changes: `git diff`
- Stage files: `git add <files>`
- Commit with meaningful message: `git commit -m "description"`

## Extension Packaging

### For Distribution
1. **Package Extension**: `npm run package`
   - Creates `generic-copilot-providers.vsix` file
   - Includes compiled code from `out/` directory

2. **Install Locally**: `code --install-extension generic-copilot-providers.vsix`
   - Install in development VS Code instance to test

3. **Test in VS Code**:
   - Reload extension
   - Check Developer Tools console for errors
   - Verify settings and commands work

## Configuration Management

### API Keys
- Test with valid API keys from configured providers
- Verify secrets storage: `generic-copilot.apiKey.<provider-key>`
- Test invalid API key handling

### Model Configuration
- Test with multiple providers
- Verify inheritance from provider to model
- Test override capabilities
- Test multiple configurations per model (configId)

### Error Scenarios
- Test with invalid/expired API keys
- Test with invalid API endpoints
- Test network connectivity issues
- Verify retry mechanism works

## Testing Checklist

### Functional Testing
- [ ] Extension activates without errors
- [ ] Command "GenericCopilot: Set Generic Compatible Multi-Provider Apikey" works
- [ ] Models appear in GitHub Copilot Chat model picker
- [ ] API key prompting works for new providers
- [ ] Requests succeed with valid API keys

### Configuration Testing
- [ ] Provider-first configuration works
- [ ] Model inheritance from providers works
- [ ] Multiple providers can be configured
- [ ] Multiple model configurations per model work
- [ ] Vision models function properly
- [ ] Thinking/reasoning configuration works

### Error Handling
- [ ] Invalid API keys show appropriate errors
- [ ] Network errors are handled gracefully
- [ ] Retry mechanism works for 429/5xx errors
- [ ] Missing configuration shows helpful messages

### Edge Cases
- [ ] Empty configuration handled
- [ ] Malformed configuration handled
- [ ] Duplicate provider/model names handled
- [ ] Large responses handled
- [ ] Very long messages handled

## Development Environment

### Type Definitions
- Run `npm run download-api` when updating to new VS Code versions
- Update version constraints in `package.json` as needed

### Watch Mode
- Use `npm run watch` during active development
- Allows instant recompilation on file changes

### Debugging Tools
- VS Code Developer Tools (`Help > Toggle Developer Tools`)
- Extension output channel
- Console logging for troubleshooting

## Documentation Updates

### README Updates
- Update feature list if new functionality added
- Update configuration examples if schema changes
- Update troubleshooting for new issues

### CHANGELOG
- Document new features
- Document bug fixes
- Document breaking changes

## Release Process

### Version Management
- Update version in `package.json`
- Update CHANGELOG.md
- Create GitHub release with notes

### Quality Gates
- All tests pass
- Linting passes
- Code formatting applied
- TypeScript compiles without errors
- Manual testing completed

## Common Issues & Solutions

### TypeScript Issues
- "Cannot find module": Run `npm run compile`
- Type errors: Check strict mode compliance

### ESLint Issues
- Fix spacing/formatting: Run `npm run format`
- Fix naming conventions: Use camelCase for variables, PascalCase for types
- Check `@typescript-eslint/no-unused-vars` for unused variables

### Testing Issues
- Extension not activating: Check `package.json` configuration
- API calls failing: Verify API key storage and format
- Models not appearing: Check provider/model configuration

### Build Issues
- `out/` directory missing: Run `npm run compile`
- Proposed API types outdated: Run `npm run download-api`
- Dependencies missing: Run `npm install`