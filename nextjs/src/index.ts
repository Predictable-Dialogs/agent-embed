import dynamic from 'next/dynamic.js'
import React from 'react';
import type { BotProps } from '@agent-embed/js';

export const Standard = dynamic(
  () => import('@agent-embed/react').then((m) => m.Standard), // ✅ package entry
  { ssr: false }
);

export const Popup = dynamic(
  () => import('@agent-embed/react').then((m) => m.Popup),
  { ssr: false }
);

export const Bubble = dynamic(
  () => import('@agent-embed/react').then((m) => m.Bubble),
  { ssr: false }
);


export * from '@agent-embed/js'
