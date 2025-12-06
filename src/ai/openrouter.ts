import { ModelItem, ProviderConfig, VercelType } from "../types.js";
import { GenerateTextResult, ToolSet, generateText } from "ai";
import { createOpenRouter, OpenRouterProviderSettings } from "@openrouter/ai-sdk-provider";
import { LanguageModelChatRequestMessage } from "vscode";
import { ProviderClient } from "./providerClient.js";

export class OpenRouterProviderClient extends ProviderClient {
	// public readonly type: VercelType = "openrouter";
	// readonly config: ProviderConfig;
	// readonly providerInstance: OpenRouterProvider;

	constructor(config: ProviderConfig) {
		super(
			"openrouter",
			config,
			createOpenRouter({
				apiKey: config.apiKey,
				...(config.baseUrl && { baseURL: config.baseUrl }),
				...(config.headers && { headers: config.headers }),
			} as OpenRouterProviderSettings)
		);
	}


	override async generateResponse(
		request: LanguageModelChatRequestMessage[],
		config: ModelItem
	): Promise<GenerateTextResult<ToolSet, never>> {
		const languageModel = this.getLanguageModel(config.slug);
		const messages = this.convertMessages(request);
		const result = await generateText({
			model: languageModel,
			messages: messages
		});
		return result;

		// Minimal stub implementation so TypeScript compilation succeeds.
		// This returns an object matching GenerateTextResult<ToolSet, never>
		// with an immediate `response` iterator that yields a single empty
		// completion and then completes. Adjust later to integrate real
		// provider streaming behavior.
		// Minimal compile-safe stub: cast an empty object through unknown.
		// This keeps the implementation intentionally small until real
		// provider integration is added.
		//return {} as unknown as GenerateTextResult<ToolSet, never>;
	}
}
