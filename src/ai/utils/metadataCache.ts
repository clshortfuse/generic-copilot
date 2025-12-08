/**
 * Cache for storing provider-specific metadata (like Google's thoughtSignature)
 * that needs to be preserved across conversation turns.
 * 
 * This is necessary because VSCode doesn't persist custom properties on
 * LanguageModelToolCallPart instances when they're sent back in conversation history.
 */

export interface ToolCallMetadata {
	providerMetadata?: Record<string, Record<string, unknown>>;
}

/**
 * Singleton class for caching tool call metadata across conversation turns.
 */
export class MetadataCache {
	private static instance: MetadataCache;
	private cache: Map<string, ToolCallMetadata>;

	private constructor() {
		this.cache = new Map();
	}

	/**
	 * Get the singleton instance
	 */
	public static getInstance(): MetadataCache {
		if (!MetadataCache.instance) {
			MetadataCache.instance = new MetadataCache();
		}
		return MetadataCache.instance;
	}

	/**
	 * Store metadata for a tool call
	 * @param toolCallId The unique identifier for the tool call
	 * @param metadata The metadata to store
	 */
	public set(toolCallId: string, metadata: ToolCallMetadata): void {
		this.cache.set(toolCallId, metadata);
	}

	/**
	 * Retrieve metadata for a tool call
	 * @param toolCallId The unique identifier for the tool call
	 * @returns The stored metadata, or undefined if not found
	 */
	public get(toolCallId: string): ToolCallMetadata | undefined {
		return this.cache.get(toolCallId);
	}

	/**
	 * Remove metadata for a tool call
	 * @param toolCallId The unique identifier for the tool call
	 */
	public delete(toolCallId: string): void {
		this.cache.delete(toolCallId);
	}

	/**
	 * Clear all cached metadata
	 */
	public clear(): void {
		this.cache.clear();
	}

	/**
	 * Get the number of cached entries
	 */
	public size(): number {
		return this.cache.size;
	}
}
