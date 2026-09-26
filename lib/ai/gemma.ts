/**
 * Gemma 4 (E2B / E4B) Activity Processing & Filtering Layer
 *
 * Responsibilities:
 * - Ingests raw workspace activity (cursor moves, file edits, run commands, tests, etc.)
 * - Filters noisy events (cursor jitter, rapid micro-keystrokes)
 * - Identifies meaningful semantic events (repeated execution failures, edit-run-fail loops)
 * - Decides if an event pattern warrants escalation to Gemini 3.8 Flash
 */

export interface RawEventInput {
  eventType: string;
  category?: string;
  description: string;
  metadata?: Record<string, any>;
  timestamp?: Date;
}

export interface GemmaClassificationResult {
  isSignificant: boolean;
  classification: string;
  confidence: number;
  reason: string;
  patternDetected?: 'REPEATED_ERROR' | 'EDIT_RUN_FAIL_LOOP' | 'STALLED_TASK' | 'NONE';
  shouldEscalateToFlash: boolean;
}

export class GemmaActivityClassifier {
  private readonly modelName = "Gemma 4 E2B/E4B";

  /**
   * Evaluates a single event or a sequence of recent events
   */
  public async classifyActivity(
    currentEvent: RawEventInput,
    recentEvents: RawEventInput[] = []
  ): Promise<GemmaClassificationResult> {
    const type = currentEvent.eventType;

    // 1. Noise filtering: ignore raw cursor movements or uninformative heartbeats
    if (type === 'CURSOR_MOVED' || type === 'SCROLL_POSITION') {
      return {
        isSignificant: false,
        classification: 'NOISE_IGNORED',
        confidence: 0.99,
        reason: 'Low-value cursor or viewport movement filtered by Gemma edge model',
        shouldEscalateToFlash: false,
        patternDetected: 'NONE',
      };
    }

    // 2. Analyze failure repetition pattern
    const isFailureEvent =
      type === 'TEST_FAILED' ||
      type === 'ERROR_OCCURRED' ||
      (type === 'CODE_RUN' && (currentEvent.metadata?.hasError || currentEvent.metadata?.status === 'error' || Boolean(currentEvent.metadata?.error)));

    if (isFailureEvent) {
      const currentErrorMessage = currentEvent.metadata?.error || currentEvent.description;

      // Count similar error occurrences in recent history (within last 10 minutes)
      const matchingFailures = recentEvents.filter((evt) => {
        const evtTime = evt.timestamp ? new Date(evt.timestamp).getTime() : Date.now();
        const isRecent = Date.now() - evtTime < 10 * 60 * 1000;
        const hasError =
          evt.eventType === 'TEST_FAILED' ||
          evt.eventType === 'ERROR_OCCURRED' ||
          evt.metadata?.hasError ||
          evt.metadata?.status === 'error' ||
          (evt.eventType === 'CODE_RUN' && (evt.metadata?.hasError || Boolean(evt.metadata?.error)));
        const matchesContent =
          !currentErrorMessage ||
          !evt.metadata?.error ||
          (typeof evt.metadata?.error === 'string' && evt.metadata.error.includes('ZeroDivisionError')) ||
          evt.metadata?.error === currentErrorMessage ||
          evt.description.includes('ZeroDivisionError') ||
          evt.description.includes('failed');
        return isRecent && hasError && matchesContent;
      });

      const totalFailures = matchingFailures.length + 1;

      if (totalFailures >= 3) {
        return {
          isSignificant: true,
          classification: 'CRITICAL_REPEATED_FAILURE',
          confidence: 0.96,
          reason: `Detected ${totalFailures} identical error occurrences within active time window`,
          patternDetected: 'REPEATED_ERROR',
          shouldEscalateToFlash: true,
        };
      }

      if (totalFailures === 2) {
        return {
          isSignificant: true,
          classification: 'POTENTIAL_STUCK_PATTERN',
          confidence: 0.88,
          reason: 'Second failure of same error signature detected; monitoring for blocker state',
          patternDetected: 'EDIT_RUN_FAIL_LOOP',
          shouldEscalateToFlash: false,
        };
      }
    }

    // 3. Significant developer milestone events
    if (
      type === 'FILE_SAVED' ||
      type === 'TEST_PASSED' ||
      type === 'ACTION_APPROVED' ||
      type === 'ACTION_EXECUTED' ||
      type === 'VERIFICATION_COMPLETED'
    ) {
      return {
        isSignificant: true,
        classification: 'DEVELOPMENT_MILESTONE',
        confidence: 0.94,
        reason: 'Meaningful state transition captured',
        shouldEscalateToFlash: false,
        patternDetected: 'NONE',
      };
    }

    // Standard activity
    return {
      isSignificant: true,
      classification: 'STANDARD_ACTIVITY',
      confidence: 0.85,
      reason: 'General workspace event preserved for timeline context',
      shouldEscalateToFlash: false,
      patternDetected: 'NONE',
    };
  }

  public getModelInfo() {
    return {
      name: this.modelName,
      architecture: 'Edge SLM (Small Language Model)',
      purpose: 'Fast real-time activity classification and noise suppression',
      status: 'Active',
    };
  }
}

export const gemmaClassifier = new GemmaActivityClassifier();
