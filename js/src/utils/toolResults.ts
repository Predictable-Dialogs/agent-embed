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

export type ToolUIData = {
  toolCallId: string;
  toolName: string;
  source: 'input' | 'output';
  data: unknown;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const getSuccessOutput = (output: unknown) => {
  if (!isRecord(output)) return output;
  return output.toolCallOutput ?? output;
};

export const getToolNameFromPart = (part: unknown): string | undefined => {
  if (!isRecord(part) || typeof part.type !== 'string') return undefined;
  if (!part.type.startsWith(TOOL_PART_PREFIX) || part.type.length === TOOL_PART_PREFIX.length) {
    return undefined;
  }
  return part.type.slice(TOOL_PART_PREFIX.length);
};

export const getCompletedToolResult = (part: unknown): CompletedToolResult | undefined => {
  if (!isRecord(part)) return undefined;

  const toolName = getToolNameFromPart(part);
  const { state, toolCallId } = part;
  if (!toolName || typeof toolCallId !== 'string' || toolCallId.length === 0) return undefined;

  if (state === 'output-available') {
    return {
      toolCallId,
      result: {
        toolName,
        status: 'success',
        output: getSuccessOutput(part.output),
      },
    };
  }

  if (state === 'output-error') {
    return {
      toolCallId,
      result: {
        toolName,
        status: 'error',
        error: typeof part.errorText === 'string' ? part.errorText : 'Tool execution failed',
      },
    };
  }

  return undefined;
};

export const getToolUIData = (
  part: unknown,
  isInputRequestTool: boolean,
): ToolUIData | undefined => {
  if (!isRecord(part)) return undefined;
  const toolName = getToolNameFromPart(part);
  const toolCallId = part.toolCallId;
  if (!toolName || typeof toolCallId !== 'string' || !toolCallId) return undefined;

  if (isInputRequestTool && (part.state === 'input-available' || part.state === 'output-available')) {
    return { toolCallId, toolName, source: 'input', data: part.input };
  }

  const completed = getCompletedToolResult(part);
  if (completed?.result.status === 'success') {
    return { toolCallId, toolName, source: 'output', data: completed.result.output };
  }

  return undefined;
};

export const extractCompletedToolResults = (
  message: ToolResultMessage
): CompletedToolResult[] => {
  if (message.role !== 'assistant' || !Array.isArray(message.parts)) return [];

  const results: CompletedToolResult[] = [];

  for (const part of message.parts) {
    if (!isRecord(part) || typeof part.type !== 'string' || !part.type.startsWith(TOOL_PART_PREFIX)) {
      continue;
    }
    const result = getCompletedToolResult(part);
    if (result) results.push(result);
  }

  return results;
};
