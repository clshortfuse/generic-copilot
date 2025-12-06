import { LanguageModelChatRequestMessage } from "vscode";
import { GenerateTextResult, ToolSet } from "ai";
import { ModelItem, ProviderConfig, VercelType } from "../types.js";
import { LM2VercelMessage } from "./conversion.js";
import { ModelMessage, LanguageModel, Provider } from "ai";

export abstract class ProviderClient {
	public type: VercelType;
	protected config: ProviderConfig;
	protected providerInstance: Provider;

	protected constructor(type: VercelType, config: ProviderConfig, providerInstance: Provider) {
		this.type = type;
		this.config = config;
		this.providerInstance = providerInstance;
	}

	abstract generateResponse(
		request: LanguageModelChatRequestMessage[],
		config: ModelItem
	): Promise<GenerateTextResult<ToolSet, never>>;

	getLanguageModel(slug: string): LanguageModel {
		return this.providerInstance.languageModel(slug);
	}

	convertMessages(messages: readonly LanguageModelChatRequestMessage[]): ModelMessage[] {
		return LM2VercelMessage(messages);
	}
}
