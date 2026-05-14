import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import {
	DEFAULT_MAX_BYTES,
	DEFAULT_MAX_LINES,
	formatSize,
	truncateHead,
	withFileMutationQueue,
} from "@mariozechner/pi-coding-agent";
import { StringEnum, Type } from "@mariozechner/pi-ai";

const SUPABASE_MCP_URL = "https://mcp.supabase.com/mcp?project_ref=dlndxvnjwkehaggstlik";
const SUPABASE_AUTH_ENV_NAMES = ["SUPABASE_ACCESS_TOKEN", "SUPABASE_MCP_ACCESS_TOKEN", "SUPABASE_MCP_BEARER_TOKEN"] as const;
const CLIENT_NAME = "kakofi-webadmin-supabase-mcp";
const CLIENT_VERSION = "1.0.0";
const PROTOCOL_VERSION = "2025-03-26";

interface McpTool {
	name: string;
	description?: string;
	inputSchema?: unknown;
}

interface JsonRpcError {
	code?: number;
	message?: string;
	data?: unknown;
}

function formatJson(value: unknown): string {
	return JSON.stringify(value, null, 2);
}

function getSupabaseAuthToken(): string | undefined {
	for (const envName of SUPABASE_AUTH_ENV_NAMES) {
		const value = process.env[envName]?.trim();
		if (value) return value;
	}
	return undefined;
}

function parseJsonText(input: string): unknown {
	return JSON.parse(input);
}

function parseResponseBody(raw: string): unknown {
	const text = raw.trim();
	if (!text) return undefined;

	try {
		return JSON.parse(text);
	} catch {
		// Fall through and try SSE-style parsing.
	}

	const ssePayloads = text
		.split(/\r?\n/)
		.filter((line) => line.startsWith("data:"))
		.map((line) => line.slice(5).trim())
		.filter((line) => line && line !== "[DONE]");

	for (let i = ssePayloads.length - 1; i >= 0; i--) {
		try {
			return JSON.parse(ssePayloads[i]);
		} catch {
			// Try the previous payload.
		}
	}

	throw new Error(`Unable to parse MCP response: ${text.slice(0, 1200)}`);
}

function unwrapJsonRpcPayload(payload: unknown, requestId?: number): unknown {
	if (Array.isArray(payload)) {
		const matching = payload.find((entry) => {
			if (!entry || typeof entry !== "object") return false;
			const candidate = entry as { id?: unknown; result?: unknown; error?: unknown };
			if (requestId === undefined) {
				return candidate.result !== undefined || candidate.error !== undefined;
			}
			return candidate.id === requestId;
		});
		return unwrapJsonRpcPayload(matching, requestId);
	}

	if (!payload || typeof payload !== "object") {
		return payload;
	}

	const message = payload as {
		id?: unknown;
		result?: unknown;
		error?: JsonRpcError;
	};

	if (message.error) {
		const suffix = message.error.data !== undefined ? `\n${formatJson(message.error.data)}` : "";
		throw new Error(`MCP error ${message.error.code ?? "unknown"}: ${message.error.message ?? "Unknown error"}${suffix}`);
	}

	if (message.result !== undefined) {
		return message.result;
	}

	return payload;
}

function formatToolList(tools: McpTool[]): string {
	if (tools.length === 0) {
		return "No tools were returned by the Supabase MCP server.";
	}

	return tools
		.map((tool, index) => {
			const description = tool.description?.trim() || "No description provided.";
			const schema = tool.inputSchema ? `\nInput schema:\n${formatJson(tool.inputSchema)}` : "";
			return `${index + 1}. ${tool.name}\n${description}${schema}`;
		})
		.join("\n\n");
}

function formatMcpToolResult(result: unknown): string {
	if (!result || typeof result !== "object") {
		return result === undefined ? "Tool returned no result." : String(result);
	}

	const response = result as {
		content?: Array<Record<string, unknown>>;
		structuredContent?: unknown;
		isError?: boolean;
		[_: string]: unknown;
	};

	const parts: string[] = [];

	if (response.isError) {
		parts.push("Remote tool reported an error.");
	}

	if (Array.isArray(response.content) && response.content.length > 0) {
		for (const item of response.content) {
			if (!item || typeof item !== "object") continue;

			const type = typeof item.type === "string" ? item.type : "unknown";

			if (type === "text" && typeof item.text === "string") {
				parts.push(item.text);
				continue;
			}

			if (type === "image") {
				parts.push(`[image content omitted]`);
				continue;
			}

			if (type === "resource") {
				parts.push(formatJson(item));
				continue;
			}

			parts.push(formatJson(item));
		}
	}

	if (response.structuredContent !== undefined) {
		parts.push(`Structured content:\n${formatJson(response.structuredContent)}`);
	}

	if (parts.length === 0) {
		parts.push(formatJson(result));
	}

	return parts.join("\n\n");
}

async function truncateForModel(fullText: string): Promise<{
	text: string;
	truncated: boolean;
	fullOutputPath?: string;
	meta?: ReturnType<typeof truncateHead>;
}> {
	const truncation = truncateHead(fullText, {
		maxLines: DEFAULT_MAX_LINES,
		maxBytes: DEFAULT_MAX_BYTES,
	});

	if (!truncation.truncated) {
		return {
			text: truncation.content,
			truncated: false,
			meta: truncation,
		};
	}

	const tempDir = await mkdtemp(join(tmpdir(), "pi-supabase-mcp-"));
	const tempFile = join(tempDir, "output.txt");
	await withFileMutationQueue(tempFile, async () => {
		await writeFile(tempFile, fullText, "utf8");
	});

	const omittedLines = truncation.totalLines - truncation.outputLines;
	const omittedBytes = truncation.totalBytes - truncation.outputBytes;
	const notice = [
		`[Output truncated: showing ${truncation.outputLines} of ${truncation.totalLines} lines`,
		`(${formatSize(truncation.outputBytes)} of ${formatSize(truncation.totalBytes)}).`,
		`${omittedLines} lines and ${formatSize(omittedBytes)} omitted.`,
		`Full output saved to: ${tempFile}]`,
	].join(" ");

	return {
		text: `${truncation.content}\n\n${notice}`,
		truncated: true,
		fullOutputPath: tempFile,
		meta: truncation,
	};
}

class SupabaseMcpClient {
	private initialized = false;
	private sessionId?: string;
	private requestCounter = 0;
	private cachedTools: McpTool[] = [];

	private async post(method: string, params: Record<string, unknown> = {}, signal?: AbortSignal, notification = false): Promise<unknown> {
		const id = notification ? undefined : ++this.requestCounter;
		const payload = notification
			? { jsonrpc: "2.0", method, params }
			: { jsonrpc: "2.0", id, method, params };

		const headers: Record<string, string> = {
			"content-type": "application/json",
			accept: "application/json, text/event-stream",
		};

		const authToken = getSupabaseAuthToken();
		if (authToken) {
			headers.authorization = `Bearer ${authToken}`;
		}

		if (this.sessionId) {
			headers["mcp-session-id"] = this.sessionId;
		}

		const response = await fetch(SUPABASE_MCP_URL, {
			method: "POST",
			headers,
			body: JSON.stringify(payload),
			signal,
		});

		const returnedSessionId = response.headers.get("mcp-session-id");
		if (returnedSessionId) {
			this.sessionId = returnedSessionId;
		}

		const raw = await response.text();
		if (!response.ok) {
			const authHint = response.status === 401 || response.status === 403
				? ` (set one of ${SUPABASE_AUTH_ENV_NAMES.join(", ")})`
				: "";
			throw new Error(`Supabase MCP HTTP ${response.status}${authHint}: ${raw.slice(0, 1500) || response.statusText}`);
		}

		if (notification) {
			return undefined;
		}

		const parsed = parseResponseBody(raw);
		return unwrapJsonRpcPayload(parsed, id);
	}

	async initialize(signal?: AbortSignal): Promise<void> {
		if (this.initialized) return;

		await this.post(
			"initialize",
			{
				protocolVersion: PROTOCOL_VERSION,
				capabilities: {},
				clientInfo: {
					name: CLIENT_NAME,
					version: CLIENT_VERSION,
				},
			},
			signal,
		);

		try {
			await this.post("notifications/initialized", {}, signal, true);
		} catch {
			// Some servers do not require or respond to this notification. Ignore.
		}

		this.initialized = true;
	}

	async listTools(signal?: AbortSignal, forceRefresh = false): Promise<McpTool[]> {
		await this.initialize(signal);

		if (!forceRefresh && this.cachedTools.length > 0) {
			return this.cachedTools;
		}

		const result = (await this.post("tools/list", {}, signal)) as { tools?: McpTool[] } | undefined;
		const tools = Array.isArray(result?.tools) ? result.tools : [];
		this.cachedTools = tools;
		return tools;
	}

	async callTool(name: string, args: Record<string, unknown>, signal?: AbortSignal): Promise<unknown> {
		await this.initialize(signal);
		return this.post(
			"tools/call",
			{
				name,
				arguments: args,
			},
			signal,
		);
	}
}

const SupabaseParams = Type.Object({
	action: StringEnum(["list_tools", "call_tool"] as const),
	name: Type.Optional(Type.String({ description: "Remote MCP tool name. Required when action is call_tool." })),
	argumentsJson: Type.Optional(
		Type.String({
			description:
				'JSON object string for the remote tool arguments, e.g. {"schemas":["public"]}. Optional for tools that take no arguments.',
		}),
	),
	refresh: Type.Optional(Type.Boolean({ description: "When true with list_tools, bypasses the cached tool list." })),
});

export default function supabaseMcpExtension(pi: ExtensionAPI) {
	const client = new SupabaseMcpClient();

	pi.registerTool({
		name: "supabase",
		label: "Supabase",
		description:
			"Connect to the configured Supabase MCP server. Use it to inspect available Supabase tools and call them through MCP over HTTP.",
		promptSnippet:
			"Inspect and call the project's Supabase MCP server for schema, auth, SQL, and project metadata operations",
		promptGuidelines: [
			'Use supabase with action "list_tools" before calling a remote Supabase MCP tool if the available capabilities are unclear.',
			'Use supabase with action "call_tool" for Supabase database/schema/auth inspection instead of guessing project state.',
			'When using supabase with action "call_tool", pass argumentsJson as a valid JSON object string matching the selected remote tool input schema.',
		],
		parameters: SupabaseParams,

		async execute(_toolCallId, params, signal) {
			if (params.action === "list_tools") {
				const tools = await client.listTools(signal, params.refresh ?? false);
				const fullText = [`Supabase MCP URL: ${SUPABASE_MCP_URL}`, "", formatToolList(tools)].join("\n");
				const truncated = await truncateForModel(fullText);

				return {
					content: [{ type: "text", text: truncated.text }],
					details: {
						action: params.action,
						url: SUPABASE_MCP_URL,
						toolCount: tools.length,
						tools,
						truncated: truncated.truncated,
						fullOutputPath: truncated.fullOutputPath,
						truncation: truncated.meta,
					},
				};
			}

			if (!params.name?.trim()) {
				throw new Error('supabase with action "call_tool" requires the "name" field.');
			}

			let parsedArguments: Record<string, unknown> = {};
			if (params.argumentsJson?.trim()) {
				const parsed = parseJsonText(params.argumentsJson);
				if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
					throw new Error("argumentsJson must be a valid JSON object string.");
				}
				parsedArguments = parsed as Record<string, unknown>;
			}

			const result = await client.callTool(params.name, parsedArguments, signal);
			const fullText = [`Remote tool: ${params.name}`, "", formatMcpToolResult(result)].join("\n");
			const truncated = await truncateForModel(fullText);

			return {
				content: [{ type: "text", text: truncated.text }],
				details: {
					action: params.action,
					url: SUPABASE_MCP_URL,
					name: params.name,
					arguments: parsedArguments,
					result,
					truncated: truncated.truncated,
					fullOutputPath: truncated.fullOutputPath,
					truncation: truncated.meta,
				},
			};
		},
	});

	pi.on("session_start", async (_event, ctx) => {
		try {
			const tools = await client.listTools(undefined, false);
			ctx.ui.notify(`Supabase MCP ready (${tools.length} remote tools)`, "info");
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			ctx.ui.notify(`Supabase MCP unavailable: ${message}`, "warning");
		}
	});

	pi.registerCommand("supabase-tools", {
		description: "Refresh and preview tools exposed by the project's Supabase MCP server",
		handler: async (_args, ctx) => {
			try {
				const tools = await client.listTools(undefined, true);
				const toolNames = tools.map((tool) => tool.name).join(", ");
				ctx.ui.notify(
					tools.length > 0 ? `Supabase MCP tools: ${toolNames}` : "Supabase MCP returned no tools.",
					"info",
				);
			} catch (error) {
				const message = error instanceof Error ? error.message : String(error);
				ctx.ui.notify(`Failed to refresh Supabase MCP tools: ${message}`, "warning");
			}
		},
	});
}
