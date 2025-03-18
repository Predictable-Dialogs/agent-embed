import { UIMessage } from '@ai-sdk/ui-utils';

// Type augmentation for UIMessage to include input property
export type EnhancedUIMessage = UIMessage & {
  input?: any;
};

// Helper function to transform an old message shape to the new one
export const transformMessage = (msg: any, roleOverride?: 'assistant' | 'user', input?: any) => {
  const role = roleOverride || msg.role;
  let content = '';

  // If message has richText, only consider the first element
  if (msg.content?.richText && Array.isArray(msg.content.richText) && msg.content.richText.length > 0) {
    content = msg.content.richText[0].children
      .map((child: any) => child.text)
      .join('');
  } else if (msg.content?.text) {
    content = msg.content.text;
  }

  const transformedMessage = {
    id: msg.id || crypto.randomUUID(),
    createdAt: msg.createdAt || new Date().toISOString(),
    role,
    content,
    parts: msg.parts || []
  };

  if (role === 'assistant' && input) {
    return { ...transformedMessage, input };
  }

  return transformedMessage;
};
