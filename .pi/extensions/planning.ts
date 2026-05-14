import { StringEnum, Type } from "@mariozechner/pi-ai";
import type { ExtensionAPI, ExtensionContext, Theme } from "@mariozechner/pi-coding-agent";
import { matchesKey, Text, truncateToWidth } from "@mariozechner/pi-tui";

interface PlanItem {
	id: number;
	text: string;
	done: boolean;
}

interface PlanDetails {
	action: "list" | "add" | "complete" | "reopen" | "clear";
	items: PlanItem[];
	nextId: number;
	error?: string;
}

const PlanParams = Type.Object({
	action: StringEnum(["list", "add", "complete", "reopen", "clear"] as const),
	text: Type.Optional(Type.String({ description: "Plan step text for add" })),
	id: Type.Optional(Type.Number({ description: "Plan item id for complete/reopen" })),
});

class PlanBoardComponent {
	private items: PlanItem[];
	private theme: Theme;
	private onClose: () => void;
	private cachedWidth?: number;
	private cachedLines?: string[];

	constructor(items: PlanItem[], theme: Theme, onClose: () => void) {
		this.items = items;
		this.theme = theme;
		this.onClose = onClose;
	}

	handleInput(data: string): void {
		if (matchesKey(data, "escape") || matchesKey(data, "ctrl+c")) {
			this.onClose();
		}
	}

	render(width: number): string[] {
		if (this.cachedLines && this.cachedWidth === width) {
			return this.cachedLines;
		}

		const lines: string[] = [];
		const th = this.theme;
		const done = this.items.filter((item) => item.done).length;

		lines.push("");
		lines.push(truncateToWidth(th.fg("accent", " Project Plan "), width));
		lines.push(truncateToWidth(th.fg("muted", `${done}/${this.items.length} complete`), width));
		lines.push("");

		if (this.items.length === 0) {
			lines.push(truncateToWidth(`  ${th.fg("dim", "No plan steps yet. Ask the agent to use the plan tool.")}`, width));
		} else {
			for (const item of this.items) {
				const marker = item.done ? th.fg("success", "✓") : th.fg("dim", "○");
				const text = item.done ? th.fg("dim", item.text) : th.fg("text", item.text);
				lines.push(truncateToWidth(`  ${marker} ${th.fg("accent", `#${item.id}`)} ${text}`, width));
			}
		}

		lines.push("");
		lines.push(truncateToWidth(`  ${th.fg("dim", "Press Escape to close")}`, width));
		lines.push("");

		this.cachedWidth = width;
		this.cachedLines = lines;
		return lines;
	}
}

export default function projectPlanningExtension(pi: ExtensionAPI) {
	let items: PlanItem[] = [];
	let nextId = 1;

	const reconstructState = (ctx: ExtensionContext) => {
		items = [];
		nextId = 1;

		for (const entry of ctx.sessionManager.getBranch()) {
			if (entry.type !== "message") continue;
			const msg = entry.message;
			if (msg.role !== "toolResult" || msg.toolName !== "plan") continue;

			const details = msg.details as PlanDetails | undefined;
			if (details) {
				items = details.items;
				nextId = details.nextId;
			}
		}
	};

	pi.on("session_start", async (_event, ctx) => reconstructState(ctx));
	pi.on("session_tree", async (_event, ctx) => reconstructState(ctx));

	pi.registerTool({
		name: "plan",
		label: "Plan",
		description: "Manage a short execution plan for the current task. Actions: list, add, complete, reopen, clear.",
		promptSnippet: "Create and track a short execution plan for multi-step work in this repository",
		promptGuidelines: [
			"Use plan to create or update a concise step list before doing multi-step work.",
			"Use plan instead of keeping long implicit plans in hidden reasoning.",
			"When a step is finished, use plan to mark it complete.",
		],
		parameters: PlanParams,
		async execute(_toolCallId, params) {
			switch (params.action) {
				case "list":
					return {
						content: [{ type: "text", text: items.length ? items.map((item) => `[${item.done ? "x" : " "}] #${item.id}: ${item.text}`).join("\n") : "No plan steps" }],
						details: { action: "list", items: [...items], nextId } as PlanDetails,
					};

				case "add": {
					if (!params.text?.trim()) {
						return {
							content: [{ type: "text", text: "Error: text required for add" }],
							details: { action: "add", items: [...items], nextId, error: "text required" } as PlanDetails,
						};
					}

					const item: PlanItem = { id: nextId++, text: params.text.trim(), done: false };
					items.push(item);
					return {
						content: [{ type: "text", text: `Added plan step #${item.id}: ${item.text}` }],
						details: { action: "add", items: [...items], nextId } as PlanDetails,
					};
				}

				case "complete": {
					if (params.id === undefined) {
						return {
							content: [{ type: "text", text: "Error: id required for complete" }],
							details: { action: "complete", items: [...items], nextId, error: "id required" } as PlanDetails,
						};
					}

					const item = items.find((entry) => entry.id === params.id);
					if (!item) {
						return {
							content: [{ type: "text", text: `Plan step #${params.id} not found` }],
							details: { action: "complete", items: [...items], nextId, error: `#${params.id} not found` } as PlanDetails,
						};
					}

					item.done = true;
					return {
						content: [{ type: "text", text: `Completed plan step #${item.id}` }],
						details: { action: "complete", items: [...items], nextId } as PlanDetails,
					};
				}

				case "reopen": {
					if (params.id === undefined) {
						return {
							content: [{ type: "text", text: "Error: id required for reopen" }],
							details: { action: "reopen", items: [...items], nextId, error: "id required" } as PlanDetails,
						};
					}

					const item = items.find((entry) => entry.id === params.id);
					if (!item) {
						return {
							content: [{ type: "text", text: `Plan step #${params.id} not found` }],
							details: { action: "reopen", items: [...items], nextId, error: `#${params.id} not found` } as PlanDetails,
						};
					}

					item.done = false;
					return {
						content: [{ type: "text", text: `Reopened plan step #${item.id}` }],
						details: { action: "reopen", items: [...items], nextId } as PlanDetails,
					};
				}

				case "clear": {
					const count = items.length;
					items = [];
					nextId = 1;
					return {
						content: [{ type: "text", text: `Cleared ${count} plan steps` }],
						details: { action: "clear", items: [], nextId: 1 } as PlanDetails,
					};
				}
			}
		},
		renderCall(args, theme) {
			let text = theme.fg("toolTitle", theme.bold("plan ")) + theme.fg("muted", args.action);
			if (args.text) text += ` ${theme.fg("dim", `"${args.text}"`)}`;
			if (args.id !== undefined) text += ` ${theme.fg("accent", `#${args.id}`)}`;
			return new Text(text, 0, 0);
		},
		renderResult(result, { expanded }, theme) {
			const details = result.details as PlanDetails | undefined;
			if (!details) {
				const text = result.content[0];
				return new Text(text?.type === "text" ? text.text : "", 0, 0);
			}

			if (details.error) {
				return new Text(theme.fg("error", `Error: ${details.error}`), 0, 0);
			}

			if (details.items.length === 0) {
				return new Text(theme.fg("dim", "No plan steps"), 0, 0);
			}

			const visible = expanded ? details.items : details.items.slice(0, 5);
			let text = theme.fg("muted", `${details.items.filter((item) => item.done).length}/${details.items.length} complete`);
			for (const item of visible) {
				text += `\n${item.done ? theme.fg("success", "✓") : theme.fg("dim", "○")} ${theme.fg("accent", `#${item.id}`)} ${item.done ? theme.fg("dim", item.text) : theme.fg("muted", item.text)}`;
			}
			if (!expanded && details.items.length > 5) {
				text += `\n${theme.fg("dim", `... ${details.items.length - 5} more`)}`;
			}
			return new Text(text, 0, 0);
		},
	});

	pi.registerCommand("plans", {
		description: "Show the current plan board",
		handler: async (_args, ctx) => {
			if (!ctx.hasUI) {
				ctx.ui.notify("/plans requires interactive mode", "error");
				return;
			}

			await ctx.ui.custom<void>((_tui, theme, _kb, done) => new PlanBoardComponent(items, theme, () => done()));
		},
	});
}
