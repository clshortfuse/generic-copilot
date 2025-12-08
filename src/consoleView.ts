import * as vscode from "vscode";
import { MessageLogger, LoggedInteraction } from "./ai/utils/messageLogger";

export class ConsoleViewProvider implements vscode.WebviewViewProvider {
	public static readonly viewType = "generic-copilot.consoleView";
	private _view?: vscode.WebviewView;

	constructor(private readonly _extensionUri: vscode.Uri) {}

	public resolveWebviewView(
		webviewView: vscode.WebviewView,
		context: vscode.WebviewViewResolveContext,
		_token: vscode.CancellationToken
	) {
		this._view = webviewView;

		webviewView.webview.options = {
			enableScripts: true,
			localResourceRoots: [this._extensionUri],
		};

		webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

		webviewView.webview.onDidReceiveMessage((data) => {
			switch (data.type) {
				case "refresh":
					this._refreshData();
					break;
				case "clear":
					MessageLogger.getInstance().clear();
					this._refreshData();
					break;
			}
		});

		this._refreshData();
	}

	private _refreshData() {
		if (this._view) {
			const logger = MessageLogger.getInstance();
			const logs = logger.get();
			this._view.webview.postMessage({
				type: "update",
				data: this._serializeLogs(logs),
			});
		}
	}

	private _serializeLogs(logs: LoggedInteraction[]): any[] {
		return logs.map((log) => ({
			id: log.id,
			request: log.request
				? {
						timestamp: log.request.timestamp?.toISOString(),
						modelId: log.request.modelConfig.id,
						modelSlug: log.request.modelConfig.slug,
						messageCount: log.request.vscodeMessages.length,
						toolsCount: log.request.vercelTools ? Object.keys(log.request.vercelTools).length : 0,
						messages: log.request.vscodeMessages.map((msg: any) => ({
							role: msg.role,
							content:
								typeof msg.content === "string"
									? msg.content
									: msg.content
											.map((part: any) => {
												if (typeof part === "string") return part;
												if (part.text) return part.text;
												return "[non-text content]";
											})
											.join(""),
						})),
				  }
				: undefined,
			response: log.response
				? {
						timestamp: log.response.timestamp?.toISOString(),
						textPartsCount: log.response.textParts?.length ?? 0,
						thinkingPartsCount: log.response.thinkingParts?.length ?? 0,
						toolCallsCount: log.response.toolCallParts?.length ?? 0,
						textContent: log.response.textParts?.map((p) => p.value).join("") ?? "",
						thinkingContent: log.response.thinkingParts?.map((p) => p.value).join("") ?? "",
						toolCalls:
							log.response.toolCallParts?.map((tc) => ({
								id: tc.callId,
								name: tc.name,
								input: tc.input,
							})) ?? [],
				  }
				: undefined,
		}));
	}

	private _getHtmlForWebview(webview: vscode.Webview) {
		return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>LLM Console</title>
	<style>
		body {
			padding: 10px;
			font-family: var(--vscode-font-family);
			font-size: var(--vscode-font-size);
			color: var(--vscode-foreground);
		}
		.toolbar {
			margin-bottom: 10px;
			display: flex;
			gap: 8px;
		}
		button {
			background: var(--vscode-button-background);
			color: var(--vscode-button-foreground);
			border: none;
			padding: 6px 12px;
			cursor: pointer;
			border-radius: 2px;
		}
		button:hover {
			background: var(--vscode-button-hoverBackground);
		}
		.interaction {
			margin-bottom: 20px;
			padding: 10px;
			border: 1px solid var(--vscode-panel-border);
			border-radius: 4px;
			background: var(--vscode-editor-background);
		}
		.interaction-header {
			font-weight: bold;
			margin-bottom: 8px;
			color: var(--vscode-textLink-foreground);
		}
		.section {
			margin-top: 8px;
		}
		.section-title {
			font-weight: bold;
			color: var(--vscode-symbolIcon-variableForeground);
			margin-bottom: 4px;
		}
		.message {
			margin: 4px 0;
			padding: 6px;
			background: var(--vscode-textBlockQuote-background);
			border-left: 3px solid var(--vscode-textBlockQuote-border);
		}
		.role {
			font-weight: bold;
			color: var(--vscode-symbolIcon-functionForeground);
		}
		.tool-call {
			margin: 4px 0;
			padding: 6px;
			background: var(--vscode-textCodeBlock-background);
			font-family: var(--vscode-editor-font-family);
			font-size: 0.9em;
		}
		.metadata {
			color: var(--vscode-descriptionForeground);
			font-size: 0.9em;
		}
		.empty-state {
			text-align: center;
			padding: 40px;
			color: var(--vscode-descriptionForeground);
		}
	</style>
</head>
<body>
	<div class="toolbar">
		<button onclick="refresh()">Refresh</button>
		<button onclick="clear()">Clear All</button>
	</div>
	<div id="content"></div>

	<script>
		const vscode = acquireVsCodeApi();

		function refresh() {
			vscode.postMessage({ type: 'refresh' });
		}

		function clear() {
			if (confirm('Clear all logged interactions?')) {
				vscode.postMessage({ type: 'clear' });
			}
		}

		window.addEventListener('message', event => {
			const message = event.data;
			if (message.type === 'update') {
				renderLogs(message.data);
			}
		});

		function renderLogs(logs) {
			const content = document.getElementById('content');

			if (!logs || logs.length === 0) {
				content.innerHTML = '<div class="empty-state">No interactions logged yet.</div>';
				return;
			}

			content.innerHTML = logs.map(log => {
				const parts = [];

				parts.push('<div class="interaction">');
				parts.push(\`<div class="interaction-header">Interaction: \${log.id}</div>\`);

				if (log.request) {
					parts.push('<div class="section">');
					parts.push('<div class="section-title">Request</div>');
					parts.push(\`<div class="metadata">Model: \${log.request.modelId} (\${log.request.modelSlug})</div>\`);
					parts.push(\`<div class="metadata">Time: \${new Date(log.request.timestamp).toLocaleString()}</div>\`);
					parts.push(\`<div class="metadata">Messages: \${log.request.messageCount}, Tools: \${log.request.toolsCount}</div>\`);

					log.request.messages.forEach(msg => {
						parts.push(\`<div class="message"><span class="role">\${msg.role}:</span> \${escapeHtml(msg.content)}</div>\`);
					});

					parts.push('</div>');
				}

				if (log.response) {
					parts.push('<div class="section">');
					parts.push('<div class="section-title">Response</div>');
					parts.push(\`<div class="metadata">Time: \${new Date(log.response.timestamp).toLocaleString()}</div>\`);
					parts.push(\`<div class="metadata">Text parts: \${log.response.textPartsCount}, Thinking: \${log.response.thinkingPartsCount}, Tool calls: \${log.response.toolCallsCount}</div>\`);

					if (log.response.thinkingContent) {
						parts.push(\`<div class="message"><span class="role">Thinking:</span> \${escapeHtml(log.response.thinkingContent)}</div>\`);
					}

					if (log.response.textContent) {
						parts.push(\`<div class="message"><span class="role">Response:</span> \${escapeHtml(log.response.textContent)}</div>\`);
					}

					log.response.toolCalls.forEach(tc => {
						parts.push(\`<div class="tool-call"><strong>\${tc.name}</strong> (\${tc.id})<br><pre>\${escapeHtml(JSON.stringify(tc.input, null, 2))}</pre></div>\`);
					});

					parts.push('</div>');
				}

				parts.push('</div>');
				return parts.join('');
			}).join('');
		}

		function escapeHtml(text) {
			const div = document.createElement('div');
			div.textContent = text;
			return div.innerHTML;
		}

		// Initial refresh request
		refresh();
	</script>
</body>
</html>`;
	}
}
