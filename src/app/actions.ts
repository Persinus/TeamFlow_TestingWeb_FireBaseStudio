"use server";

import { suggestTaskAssignee } from "@/ai/flows/suggest-task-assignee";
import type { SuggestTaskAssigneeInput } from "@/ai/flows/suggest-task-assignee";

export async function getAssigneeSuggestion(input: SuggestTaskAssigneeInput) {
    try {
        const result = await suggestTaskAssignee(input);
        return { success: true, data: result };
    } catch (error) {
        console.error("AI suggestion failed:", error);
        return { success: false, error: "Failed to get AI suggestion." };
    }
}
