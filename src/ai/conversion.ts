import { LanguageModelChatRequestMessage, LanguageModelChatMessageRole, LanguageModelTextPart, LanguageModelToolCallPart, LanguageModelToolResultPart } from "vscode";
import {
  UserModelMessage,
  AssistantModelMessage,
} from "ai";

/**
 * Converts VS Code LanguageModelChatRequestMessage array to AI SDK ModelMessage array
 *
 * Maps the following message types:
 * - User role -> UserModelMessage
 * - Assistant role -> AssistantModelMessage
 *
 * Note: System messages are not directly supported in LanguageModelChatRequestMessage,
 * so only user and assistant roles are converted.
 */
export function LM2VercelMessage(
  messages: readonly LanguageModelChatRequestMessage[]
): (UserModelMessage | AssistantModelMessage)[] {
  return messages.map((message) => {
    // User message
    if (message.role === LanguageModelChatMessageRole.User) {
      // Extract content from parts - can include text parts and tool result parts
      const userContent: Array<any> = [];

      for (const part of message.content) {
        // Text part
        if (part instanceof LanguageModelTextPart) {
          userContent.push({
            type: "text" as const,
            text: part.value,
          });
        }
        // Tool result part - link tool results back to tool calls
        else if (part instanceof LanguageModelToolResultPart) {
          userContent.push({
            type: "tool-result" as const,
            toolCallId: part.callId,
            output: part.content?.[0] ?? null,
          });
        }
      }

      // Mixed content - return as array of parts
      return {
        role: "user" as const,
        content: userContent,
      } as any;
    }

    // Assistant message
    if (message.role === LanguageModelChatMessageRole.Assistant) {
      // Convert assistant message parts to AI SDK format
      const assistantContent = message.content.map((part) => {
        // Text part
        if (part instanceof LanguageModelTextPart) {
          return {
            type: "text" as const,
            text: part.value,
          };
        }

        // Tool call part - convert from VSCode format to AI SDK format
        if (part instanceof LanguageModelToolCallPart) {
          return {
            type: "tool-call" as const,
            toolCallId: part.callId,
            toolName: part.name,
            input: part.input ?? {},
          };
        }

        // Default fallback for unknown part types
        return {
          type: "text" as const,
          text: JSON.stringify(part),
        };
      });

      return {
        role: "assistant" as const,
        content: assistantContent,
      } as AssistantModelMessage;
    }

    // Fallback for unknown message types - treat as user message with empty content
    return {
      role: "user" as const,
      content: "",
    } as UserModelMessage;
  });
}
