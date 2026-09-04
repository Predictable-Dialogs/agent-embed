import type { ToolResult } from '@/types';

const TOOL_PART_PREFIX = 'tool-';

type ToolResultMessage = {
  role?: unknown;
  parts?: unknown;
};

type CompletedToolResult = {
  toolCallId: string;
  result: ToolResult;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const getSuccessOutput = (output: unknown) => {
  if (!isRecord(output)) return output;
  return output.toolCallOutput ?? output;
};

export const extractCompletedToolResults = (
  message: ToolResultMessage
): CompletedToolResult[] => {
  if (message.role !== 'assistant' || !Array.isArray(message.parts)) return [];

  const results: CompletedToolResult[] = [];

  for (const part of message.parts) {
    if (!isRecord(part)) continue;

    const { type, state, toolCallId } = part;
    if (
      typeof type !== 'string' ||
      !type.startsWith(TOOL_PART_PREFIX) ||
      type.length === TOOL_PART_PREFIX.length
    ) {
      continue;
    }
    if (state !== 'output-available' && state !== 'output-error') continue;
    if (typeof toolCallId !== 'string' || toolCallId.length === 0) continue;

    const toolName = type.slice(TOOL_PART_PREFIX.length);
    if (state === 'output-available') {
      results.push({
        toolCallId,
        result: {
          toolName,
          status: 'success',
          output: getSuccessOutput(part.output),
        },
      });
      continue;
    }

    results.push({
      toolCallId,
      result: {
        toolName,
        status: 'error',
        error:
          typeof part.errorText === 'string'
            ? part.errorText
            : 'Tool execution failed',
      },
    });
  }

  return results;
};
