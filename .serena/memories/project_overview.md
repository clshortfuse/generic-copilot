# Generic Copilot for VS Code

## Project Purpose

A VS Code extension that integrates OpenAI-compatible inference providers with GitHub Copilot Chat. Allows users to use frontier LLMs like Qwen3 Coder, Kimi K2, DeepSeek V3.1, GLM 4.5 and more in VS Code with GitHub Copilot Chat.

## Key Features

- **Provider-First Configuration**: Define providers once with shared settings, then add models that automatically inherit baseUrl, headers, and defaults
- **Multiple Provider Support**: Manage API keys for unlimited providers with automatic per-provider key storage
- **Inheritable Defaults**: Set common parameters (temperature, max_tokens, etc.) at the provider level and override per-model as needed
- **Multiple Configurations per Model**: Define the same model with different settings using `configId` (e.g., thinking vs. no-thinking modes)
- **Vision Model Support**: Configure models with multimodal capabilities for image inputs
- **Thinking & Reasoning**: Control display of model reasoning processes with support for OpenRouter, Zai, and other provider formats
- **Auto-Retry**: Built-in retry mechanism for handling API errors (429, 500, 502, 503, 504)
- **Flexible Headers**: Inherit custom headers from providers or override per-model

## Tech Stack

- **Language**: TypeScript
- **Platform**: VS Code Extension (requires VS Code 1.104.0+)
- **Dependencies**: 
  - GitHub Copilot Chat extension (required)
  - Uses VS Code proposed APIs for chatProvider, languageModelCapabilities, languageModelThinkingPart
- **Development Tools**:
  - TypeScript 5.9.3
  - ESLint 9.39.0
  - Prettier 3.6.2
  - VS Code Extension Manager (vsce) 3.6.2

## Project Structure

```
/src
  extension.ts        # Main extension entry point
  provider.ts         # ChatModelProvider implementation
  types.ts            # TypeScript type definitions
  utils.ts            # Utility functions
  provideModel.ts     # Model handling logic
  provideToken.ts     # Token counting logic
  vscode.proposed.*.d.ts  # Type definition files for proposed VS Code APIs
  /test               # Test files
/out                 # Compiled JavaScript output
/assets              # Static assets (logos, etc.)
/examples            # Example configuration files
/reference           # Reference documentation
```

## Dependencies

- **Runtime**: None
- **Development**: @types/vscode, TypeScript, ESLint, Prettier, @vscode/test-cli
- **Required VS Code Extension**: github.copilot-chat

## Extension Registration

The extension registers:
- Language Model Chat Provider: "generic-copilot"
- Command: "generic-copilot.setProviderApikey" for configuring API keys