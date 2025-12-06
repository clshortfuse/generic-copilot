import { VercelType, ProviderConfig } from '../types.js';
import { OpenRouterProviderClient } from './openrouter.js';
import { ProviderClient } from './providerClient.js';

export class ProviderClientFactory {
  private static instances: Map<string, ProviderClient> = new Map();

  static getClient(config: ProviderConfig): ProviderClient {
    const key = `${config.vercelType}-${config.id}`;

    if (this.instances.has(key)) {
      return this.instances.get(key)!;
    }

    let client: ProviderClient;

    switch (config.vercelType as VercelType) {
      case 'openrouter':
        client = new OpenRouterProviderClient(config);
        break;
      default:
        throw new Error(`Unsupported provider type: ${config.vercelType}`);
    }

    this.instances.set(key, client);
    return client;
  }

  static clearCache(): void {
    this.instances.clear();
  }

  static getCachedClients(): ProviderClient[] {
    return Array.from(this.instances.values());
  }
}
export { ProviderClient };
