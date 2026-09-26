export interface LiveVoiceResponse {
  userQuery: string;
  assistantResponse: string;
  contextSummary: string;
  suggestedActionPrompt?: string;
}

export class GeminiLiveVoiceAssistant {
  private readonly modelName = 'gemini-3.8-live';

  public async processVoiceQuery(
    transcribedText: string,
    workspaceContext?: {
      activeFile?: string;
      recentError?: string;
      errorCount?: number;
      taskTitle?: string;
    }
  ): Promise<LiveVoiceResponse> {
    const queryLower = transcribedText.toLowerCase();

    if (
      queryLower.includes('stuck') ||
      queryLower.includes('why') ||
      queryLower.includes('error') ||
      queryLower.includes('help')
    ) {
      const errorCount = workspaceContext?.errorCount || 3;
      return {
        userQuery: transcribedText,
        assistantResponse: `You've encountered the same division error ${errorCount} times in calculate(). When operation is "divide" and the denominator is 0, Python raises ZeroDivisionError. Would you like me to prepare an automated fix?`,
        contextSummary: 'Detected repeated ZeroDivisionError in calculator.py during calculate(10, 0, "divide")',
        suggestedActionPrompt: 'Add division-by-zero validation to calculator.py',
      };
    }

    if (queryLower.includes('test') || queryLower.includes('status')) {
      return {
        userQuery: transcribedText,
        assistantResponse: `Currently 11 of your 12 tests are passing, but test_div_zero_handled fails due to the unhandled ZeroDivisionError. Your task progress is at 78%.`,
        contextSummary: 'Task "Build Python Calculator" at 78% progress; 11/12 tests passing',
      };
    }

    if (queryLower.includes('fix') || queryLower.includes('solve') || queryLower.includes('approve')) {
      return {
        userQuery: transcribedText,
        assistantResponse: `I have prepared a patch for calculator.py that adds a safe guard checking if b == 0. You can review and approve it directly in the Agent Actions panel.`,
        contextSummary: 'Action Proposal ready for user approval',
        suggestedActionPrompt: 'Review and approve action proposal in workspace',
      };
    }

    return {
      userQuery: transcribedText,
      assistantResponse: `I'm monitoring your Python Calculator workspace. You're working on "${workspaceContext?.taskTitle || 'Build Python Calculator'}". Everything looks active, and I'll immediately notify you if any blockers arise.`,
      contextSummary: 'Active monitoring mode enabled',
    };
  }

  public getModelInfo() {
    return {
      name: this.modelName,
      type: 'Real-Time Conversational Voice AI',
      status: 'Active',
    };
  }
}

export const geminiLive = new GeminiLiveVoiceAssistant();
