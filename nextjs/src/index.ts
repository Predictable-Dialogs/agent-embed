import dynamic from 'next/dynamic'
import React from 'react';
import type { BotProps } from 'agent-widget';

type Props = BotProps & {
  style?: React.CSSProperties;
  className?: string;
};

export const Standard = dynamic<Props>(() => import('@agent-widget/react/src/Standard'), {
  ssr: false,
});

export const Popup = dynamic(() => import('@agent-widget/react/src/Popup'), {
  ssr: false,
})

export const Bubble = dynamic(() => import('@agent-widget/react/src/Bubble'), {
  ssr: false,
})


export * from 'agent-widget'
