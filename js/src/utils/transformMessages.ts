import { UIMessage } from 'ai';

// Type augmentation for UIMessage to include input property
export type EnhancedUIMessage = UIMessage & {
  input?: any;
  isPersisted?: boolean;
};

// Extract plain text from legacy content structures
const extractTextFromLegacyContent = (msg: any): string => {
  if (msg?.content?.richText && Array.isArray(msg.content.richText) && msg.content.richText.length > 0) {
    // This returns the initial greeting which is not streamed.
    return msg.content.richText[0].children?.map((child: any) => child.text).join('') || '';
  }

  if (msg?.content?.text) {
    //v4 message text content detected: this should never happen
    console.warn(`v4 message text content detected`);
    return msg.content.text;
  }

  if (typeof msg?.content === 'string') {
    //v4 message text content detected: this should never happen
    console.warn(`v4 message content detected`);
    return msg.content;
  }

  return '';
};

const normalizeReasoningPart = (part: any) => {
  if (part?.type !== 'reasoning') return part;
  const text = part.text ?? part.reasoning ?? '';
  if (text === part.text && part.reasoning === undefined) {
    return part;
  }
  const { reasoning, ...rest } = part;
  return { ...rest, text };
};

const normalizeFilePart = (part: any) => {
  if (part?.type !== 'file') return part;
  const mediaType = part.mediaType ?? part.mimeType;
  const url = part.url ?? (mediaType && part.data ? `data:${mediaType};base64,${part.data}` : undefined);
  const { data, mimeType, ...rest } = part;
  return {
    ...rest,
    type: 'file',
    mediaType: mediaType ?? '',
    url: url ?? '',
  };
};

const normalizeParts = (parts?: any[]) => {
  if (!Array.isArray(parts)) return [];
  return parts
    .map((part) => normalizeFilePart(normalizeReasoningPart(part)))
    .filter((part) => part && (part.type !== 'file' || part.url));
};

const ensureTextPart = (parts: any[], text: string) => {
  if (!text) return parts;
  return [...parts, { type: 'text', text }];
};

export const getMessageText = (message?: { parts?: Array<{ type?: string; text?: string }>; content?: string }) => {
  if (!message) return '';
  const textPart = message.parts?.find((part) => part.type === 'text' && typeof part.text === 'string');
  if (textPart) {
    return textPart.text as string;
  }
  if (typeof message.content === 'string') {
    return message.content;
  }
  return '';
};

// Helper function to transform an old message shape to the new one
export const transformMessage = (
  msg: any,
  roleOverride?: 'assistant' | 'user',
  input?: any
) => {
  const role = roleOverride || msg.role;
  const needsLegacyTransform = !Array.isArray(msg.parts) || msg.parts.length === 0;

  if (!needsLegacyTransform) {
    if (role === 'assistant') {
      return { ...msg, role, input };
    }
    return { ...msg, role };
  }

  // Non ai-sdk message transformation
  const textContent = extractTextFromLegacyContent(msg);
  let parts = normalizeParts(msg.parts);

  if (msg.reasoning) {
    parts = [{ type: 'reasoning', text: msg.reasoning }, ...parts];
  }

  parts = ensureTextPart(parts, textContent);

  const transformedMessage = {
    id: msg.id || crypto.randomUUID(),
    createdAt: msg.createdAt || new Date().toISOString(),
    role,
    parts,
  };

  if (role === 'assistant') {
    return { ...transformedMessage, input };
  }

  return transformedMessage;
};
