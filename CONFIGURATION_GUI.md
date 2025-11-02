# Configuration GUI

The Generic Copilot extension now includes a graphical user interface for managing providers and models, making configuration easier and more intuitive.

## Opening the Configuration GUI

There are two ways to open the configuration GUI:

1. **Command Palette**:
   - Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (macOS)
   - Type "GenericCopilot: Open Configuration GUI"
   - Press Enter

2. **Quick Access**:
   - The command is available in the command palette under "GenericCopilot: Open Configuration GUI"

## Using the Configuration GUI

### Managing Providers

Providers are the foundation of your configuration. Each provider represents an API endpoint with shared settings.

#### Adding a Provider

1. Click the **"+ Add Provider"** button in the Providers section
2. Fill in the required fields:
   - **Key** (required): A unique identifier for the provider (e.g., "openai", "anthropic")
   - **Base URL** (required): The API endpoint (e.g., "https://api.openai.com/v1")
3. Optionally fill in:
   - **Display Name**: A human-readable name for the provider
4. Optionally configure default parameters by checking **"Configure Default Parameters"**:
   - Context Length
   - Max Tokens
   - Temperature
   - Top P
   - Family
   - Vision Support

#### Editing a Provider

Simply modify the values in any field, and your changes will be saved when you click the "Save Configuration" button.

#### Removing a Provider

Click the **"Remove"** button next to the provider you want to delete.

### Managing Models

Models reference providers and can inherit or override their settings.

#### Adding a Model

1. Click the **"+ Add Model"** button in the Models section
2. Fill in the required fields:
   - **Model ID** (required): The model identifier (e.g., "gpt-4", "claude-3-opus")
3. Optionally configure:
   - **Provider**: Select from configured providers to inherit settings
   - **Owned By**: The provider that owns the model
   - **Config ID**: Unique identifier for multiple configurations of the same model
   - **Base URL**: Override the provider's base URL
   - **Family**: Model family (e.g., "gpt-4", "claude-3", "gemini")
   - **Context Length**: Maximum context window size
   - **Max Tokens**: Maximum number of tokens to generate
   - **Temperature**: Sampling temperature (0-2)
   - **Top P**: Nucleus sampling parameter (0-1)
   - **Vision Support**: Enable multimodal image input

#### Editing a Model

Simply modify the values in any field, and your changes will be saved when you click the "Save Configuration" button.

#### Removing a Model

Click the **"Remove"** button next to the model you want to delete.

### Saving Your Configuration

After making all your changes:

1. Click the **"Save Configuration"** button at the bottom of the page
2. You'll receive a confirmation message when the configuration is saved successfully
3. The configuration is immediately available to the extension

## Validation

The GUI validates your configuration before saving:

- **Required Fields**: Provider keys, base URLs, and model IDs must be filled in
- **Error Messages**: Red error messages appear below required fields when they're empty
- The Save button will show an error if validation fails

## Configuration Storage

All configuration data is stored in your VS Code settings:

- **Providers**: `generic-copilot.providers`
- **Models**: `generic-copilot.models`

You can still manually edit these settings in your VS Code settings.json if you prefer.

## API Keys

API keys are managed separately through the **"GenericCopilot: Set Generic Compatible Multi-Provider Apikey"** command. The configuration GUI does not handle API keys for security reasons - they remain stored in VS Code's secure secret storage.

## Tips

1. **Provider-First Approach**: Configure providers first, then add models that reference them
2. **Inheritance**: Use provider defaults to avoid repetitive configuration across models
3. **Multiple Configurations**: Use Config ID to create multiple variants of the same model with different settings
4. **Validation**: The GUI prevents saving invalid configurations and shows clear error messages

## Troubleshooting

- **Configuration not appearing**: Try reloading the VS Code window after saving
- **Models not showing in Copilot**: Ensure you've set API keys for your providers
- **Validation errors**: Check that all required fields are filled in before saving
