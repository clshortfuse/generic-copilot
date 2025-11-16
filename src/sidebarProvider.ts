import * as vscode from "vscode";
import type { ModelItem, ProviderConfig, ModelParameters, ModelProperties } from "./types";

// Provider value object for tree items
interface ProviderValue {
	key: string;
	displayName?: string;
	baseUrl: string;
	headers?: Record<string, string>;
}

/**
 * Tree item types for the sidebar
 */
export enum SidebarItemType {
	Provider = "provider",
	Model = "model",
	Property = "property",
	Parameter = "parameter"
}

/**
 * Base tree item class
 */
abstract class SidebarTreeItem extends vscode.TreeItem {
	constructor(
		public readonly label: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		public readonly type: SidebarItemType
	) {
		super(label, collapsibleState);
	}
}

/**
 * Provider tree item
 */
class ProviderTreeItem extends SidebarTreeItem {
	constructor(
		public readonly provider: ProviderValue,
		public readonly modelCount: number
	) {
		super(
			provider.displayName || provider.key,
			vscode.TreeItemCollapsibleState.Collapsed,
			SidebarItemType.Provider
		);

		this.tooltip = `${this.label}\nBase URL: ${provider.baseUrl}\nModels: ${modelCount}`;
		this.iconPath = new vscode.ThemeIcon("cloud");
		this.contextValue = "provider";
	}
}

/**
 * Model tree item
 */
class ModelTreeItem extends SidebarTreeItem {
	constructor(public readonly model: ModelItem) {
		super(
			model.displayName || model.id,
			vscode.TreeItemCollapsibleState.Collapsed,
			SidebarItemType.Model
		);

		const contextLength = model.model_properties.context_length;
		const ownedBy = model.model_properties.owned_by;
		const family = model.model_properties.family;

		this.tooltip = [
			`${this.label}`,
			ownedBy ? `Provider: ${ownedBy}` : "",
			family ? `Family: ${family}` : "",
			contextLength ? `Context: ${contextLength.toLocaleString()} tokens` : ""
		].filter(Boolean).join("\n");

		this.iconPath = new vscode.ThemeIcon("brain");
		this.contextValue = "model";
	}
}

/**
 * Property tree item (like context length, family, etc.)
 */
class PropertyTreeItem extends SidebarTreeItem {
	constructor(
		public readonly key: string,
		public readonly value: string | number
	) {
		super(`${key}: ${value}`, vscode.TreeItemCollapsibleState.None, SidebarItemType.Property);

		this.iconPath = new vscode.ThemeIcon("info");
		this.contextValue = "property";
	}
}

/**
 * Parameter tree item (like temperature, reasoning settings, etc.)
 */
class ParameterTreeItem extends SidebarTreeItem {
	constructor(
		public readonly key: string,
		public readonly value: string | number | boolean | object
	) {
		super(`${key}: ${typeof value === "object" ? JSON.stringify(value) : value}`,
			vscode.TreeItemCollapsibleState.None, SidebarItemType.Parameter);

		this.iconPath = new vscode.ThemeIcon("settings-gear");
		this.contextValue = "parameter";
	}
}

/**
 * Welcome tree item for empty state
 */
class WelcomeTreeItem extends SidebarTreeItem {
	constructor() {
		super("Welcome to Generic Copilot!", vscode.TreeItemCollapsibleState.None, SidebarItemType.Property);
		this.iconPath = new vscode.ThemeIcon("hello");
		this.contextValue = "welcome";
	}
}

/**
 * Tree data provider for the sidebar
 */
export class SidebarTreeDataProvider implements vscode.TreeDataProvider<SidebarTreeItem> {
	private _onDidChangeTreeData = new vscode.EventEmitter<SidebarTreeItem | undefined>();
	public readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

	constructor(private context: vscode.ExtensionContext) {
		// Listen for configuration changes
		vscode.workspace.onDidChangeConfiguration((event) => {
			if (event.affectsConfiguration("generic-copilot")) {
				this.refresh();
			}
		}, this.context.subscriptions);
	}

	refresh(): void {
		this._onDidChangeTreeData.fire(undefined);
	}

	getTreeItem(element: SidebarTreeItem): vscode.TreeItem {
		return element;
	}

	getChildren(element?: SidebarTreeItem): Thenable<SidebarTreeItem[]> {
		// If no element, return root items (providers and models)
		if (!element) {
			return this.getRootItems();
		}

		// If element is a provider, return its models
		if (element.type === SidebarItemType.Provider) {
			return this.getProviderModels((element as ProviderTreeItem).provider);
		}

		// If element is a model, return its properties and parameters
		if (element.type === SidebarItemType.Model) {
			return this.getModelDetails((element as ModelTreeItem).model);
		}

		return Promise.resolve([]);
	}

	private async getRootItems(): Promise<SidebarTreeItem[]> {
		const config = vscode.workspace.getConfiguration();
		const models = config.get<any[]>("generic-copilot.models", []);
		const providers = config.get<any[]>("generic-copilot.providers", []);

		// If no models configured, show welcome message
		if (models.length === 0) {
			return [new WelcomeTreeItem()];
		}

		const items: SidebarTreeItem[] = [];

		// Add provider section if there are providers
		if (providers.length > 0) {
			// Group models by provider
			const modelsByProvider = new Map<string, any[]>();
			models.forEach(model => {
				const providerKey = model.provider || "unknown";
				if (!modelsByProvider.has(providerKey)) {
					modelsByProvider.set(providerKey, []);
				}
				modelsByProvider.get(providerKey)!.push(model);
			});

			// Create provider items
			providers.forEach((provider: any) => {
				const providerModels = modelsByProvider.get(provider.key) || [];
				items.push(new ProviderTreeItem(provider, providerModels.length));
			});

			// Add models that don't have matching providers
			const allProviderKeys = new Set(providers.map((p: any) => p.key));
			const orphanedModels = models.filter((model: any) =>
				!model.provider || !allProviderKeys.has(model.provider)
			);

			if (orphanedModels.length > 0) {
				const orphanedProvider: ProviderValue = {
					key: "unconfigured",
					displayName: "Unconfigured",
					baseUrl: ""
				};
				items.push(new ProviderTreeItem(orphanedProvider, orphanedModels.length));
			}
		} else {
			// If no providers configured, show all models under a generic provider
			const genericProvider: ProviderValue = {
				key: "models",
				displayName: "Configured Models",
				baseUrl: ""
			};
			items.push(new ProviderTreeItem(genericProvider, models.length));
		}

		return items;
	}

	private async getProviderModels(provider: ProviderValue): Promise<SidebarTreeItem[]> {
		const config = vscode.workspace.getConfiguration();
		const allModels = config.get<any[]>("generic-copilot.models", []);

		let providerModels: any[] = [];

		if (provider.key === "unconfigured") {
			// Show models without matching providers
			const configuredProviders = config.get<any[]>("generic-copilot.providers", []);
			const configuredProviderKeys = new Set(configuredProviders.map((p: any) => p.key));

			providerModels = allModels.filter((model: any) =>
				!model.provider || !configuredProviderKeys.has(model.provider)
			);
		} else if (provider.key === "models") {
			// Show all models when no providers are configured
			providerModels = allModels;
		} else {
			// Show models for this provider
			providerModels = allModels.filter((model: any) => model.provider === provider.key);
		}

		return providerModels.map(model => new ModelTreeItem(model));
	}

	private async getModelDetails(model: any): Promise<SidebarTreeItem[]> {
		const items: SidebarTreeItem[] = [];

		// Add model properties
		if (model.model_properties?.context_length) {
			items.push(new PropertyTreeItem("Context Length", `${model.model_properties.context_length.toLocaleString()} tokens`));
		}
		if (model.model_properties?.owned_by) {
			items.push(new PropertyTreeItem("Provider", model.model_properties.owned_by));
		}
		if (model.model_properties?.family) {
			items.push(new PropertyTreeItem("Family", model.model_properties.family));
		}

		// Add model parameters
		if (model.model_parameters?.temperature !== undefined && model.model_parameters.temperature !== null) {
			items.push(new ParameterTreeItem("Temperature", model.model_parameters.temperature));
		}
		if (model.model_parameters?.max_tokens) {
			items.push(new ParameterTreeItem("Max Tokens", model.model_parameters.max_tokens));
		}
		if (model.model_parameters?.max_completion_tokens) {
			items.push(new ParameterTreeItem("Max Completion Tokens", model.model_parameters.max_completion_tokens));
		}
		if (model.model_parameters?.reasoning_effort) {
			items.push(new ParameterTreeItem("Reasoning Effort", model.model_parameters.reasoning_effort));
		}
		if (model.model_parameters?.thinking) {
			items.push(new ParameterTreeItem("Thinking", model.model_parameters.thinking));
		}
		if (model.model_parameters?.thinking_budget) {
			items.push(new ParameterTreeItem("Thinking Budget", `${model.model_parameters.thinking_budget} tokens`));
		}
		if (model.model_parameters?.reasoning) {
			items.push(new ParameterTreeItem("Reasoning", model.model_parameters.reasoning));
		}
		if (model.model_parameters?.extra && Object.keys(model.model_parameters.extra).length > 0) {
			items.push(new ParameterTreeItem("Extra Parameters", model.model_parameters.extra));
		}

		return items;
	}
}