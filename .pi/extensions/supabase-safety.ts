import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";

const SAFE_TOOL_NAME_PATTERNS = [
	/(^|[_-])(list|get|search|inspect|introspect|describe|advis|metadata|docs|types|schema)([_-]|$)/i,
	/(^|[_-])(projects?|branches?|tables?|policies|functions|buckets)([_-]|$)/i,
];

const RISKY_TOOL_NAME_PATTERNS = [
	/(^|[_-])(apply|execute|exec|run|migrate|migration|create|insert|update|upsert|delete|remove|drop|truncate|alter|grant|revoke)([_-]|$)/i,
	/(^|[_-])(auth-admin|auth_admin|storage-delete|storage_delete|rpc|write)([_-]|$)/i,
];

const RISKY_SQL_PATTERNS = [
	/\b(insert|update|delete|drop|truncate|alter|create|grant|revoke|comment|refresh\s+materialized|vacuum|analyze)\b/i,
	/\b(begin|commit|rollback)\b/i,
];

function safeParseJson(input?: string): unknown {
	if (!input?.trim()) return undefined;
	try {
		return JSON.parse(input);
	} catch {
		return input;
	}
}

function collectStringValues(value: unknown, acc: string[] = []): string[] {
	if (typeof value === "string") {
		acc.push(value);
		return acc;
	}

	if (Array.isArray(value)) {
		for (const item of value) collectStringValues(item, acc);
		return acc;
	}

	if (value && typeof value === "object") {
		for (const item of Object.values(value)) collectStringValues(item, acc);
	}

	return acc;
}

function analyzeSupabaseCall(input: { action?: string; name?: string; argumentsJson?: string }) {
	const reasons: string[] = [];
	const action = input.action;
	const name = input.name?.trim();
	const parsedArgs = safeParseJson(input.argumentsJson);
	const flattenedArgs = collectStringValues(parsedArgs).join("\n");

	if (action !== "call_tool") {
		return { risky: false, reasons, parsedArgs };
	}

	if (!name) {
		reasons.push("missing remote tool name");
		return { risky: true, reasons, parsedArgs };
	}

	const safeName = SAFE_TOOL_NAME_PATTERNS.some((pattern) => pattern.test(name));
	const riskyName = RISKY_TOOL_NAME_PATTERNS.some((pattern) => pattern.test(name));

	if (riskyName) {
		reasons.push(`remote tool name looks mutating: ${name}`);
	}

	if (!safeName && /sql|query/i.test(name) && !/select/i.test(flattenedArgs)) {
		reasons.push(`SQL-oriented tool without obviously read-only query: ${name}`);
	}

	for (const pattern of RISKY_SQL_PATTERNS) {
		if (pattern.test(flattenedArgs)) {
			reasons.push(`arguments contain mutating SQL or transaction keywords matching ${pattern}`);
			break;
		}
	}

	if (/\b(service_role|bypassrls|bypass_rls|admin)\b/i.test(flattenedArgs)) {
		reasons.push("arguments mention privileged access or admin behavior");
	}

	return {
		risky: reasons.length > 0,
		reasons,
		parsedArgs,
	};
}

export default function supabaseSafetyExtension(pi: ExtensionAPI) {
	pi.on("tool_call", async (event, ctx) => {
		if (event.toolName !== "supabase") return undefined;

		const input = event.input as { action?: string; name?: string; argumentsJson?: string };
		const analysis = analyzeSupabaseCall(input);

		if (!analysis.risky) return undefined;

		const message = [
			"Potentially harmful Supabase operation detected.",
			`Action: ${input.action ?? "unknown"}`,
			input.name ? `Remote tool: ${input.name}` : undefined,
			analysis.reasons.length ? `Reasons:\n- ${analysis.reasons.join("\n- ")}` : undefined,
			input.argumentsJson?.trim() ? `Arguments:\n${input.argumentsJson}` : undefined,
		].filter(Boolean).join("\n\n");

		if (!ctx.hasUI) {
			return {
				block: true,
				reason: `${message}\n\nBlocked because no interactive confirmation UI is available.`,
			};
		}

		const confirmed = await ctx.ui.confirm(
			"Risky Supabase operation",
			`${message}\n\nContinue?`,
			{ timeout: 20000 },
		);

		if (!confirmed) {
			ctx.ui.notify("Supabase operation cancelled", "warning");
			return { block: true, reason: "Blocked by Supabase safety confirmation" };
		}

		ctx.ui.notify("Supabase risky operation explicitly confirmed", "warning");
		return undefined;
	});
}
