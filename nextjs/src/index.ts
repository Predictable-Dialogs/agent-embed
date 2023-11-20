import dynamic from 'next/dynamic'
import React from 'react';
import type { BotProps } from 'agent-embed';

type Props = BotProps & {
  style?: React.CSSProperties;
  className?: string;
};

export const Standard = dynamic<Props>(() => import('@agent-embed/react/src/Standard'), {
  ssr: false,
});

export const Popup = dynamic(() => import('@agent-embed/react/src/Popup'), {
  ssr: false,
})

export const Bubble = dynamic(() => import('@agent-embed/react/src/Bubble'), {
  ssr: false,
})


export * from 'agent-embed'
