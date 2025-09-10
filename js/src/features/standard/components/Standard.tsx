import styles from '../../../assets/index.css';
import { Bot, BotProps } from '@/components/Bot';
import { createSignal, onCleanup, onMount, Show } from 'solid-js';

const hostElementCss = `
:host {
  display: block;
  width: 100%;
  height: 100%;
  overflow-y: hidden;
}
`;

export const Standard = (props: BotProps, { element }: { element: HTMLElement }) => {
  const [isBotDisplayed, setIsBotDisplayed] = createSignal(false);

  const launchBot = () => {
    setIsBotDisplayed(true);
  };

  const botLauncherObserver = new IntersectionObserver((intersections) => {
    if (intersections.some((intersection) => intersection.isIntersecting)) {
      launchBot();
    }
  });

  let fallbackId: number | undefined;

  onMount(() => {
    console.log("[Standard] mounted", { element });

    botLauncherObserver.observe(element);

    // Fallback only: if observer hasn’t fired after 300ms, show bot anyway
    fallbackId = window.setTimeout(() => {
      console.log("[Standard] fallback fired, isBotDisplayed:", isBotDisplayed());
      if (!isBotDisplayed()) {
        setIsBotDisplayed(true);
        console.log("[Standard] forcing bot display");
      }
    }, 300);

  });

  onCleanup(() => {
      console.log("[Standard] cleanup");
    botLauncherObserver.disconnect();
    if (fallbackId) {
      clearTimeout(fallbackId);
    }
  });

  return (
    <>
      <style>
        {styles}
        {hostElementCss}
      </style>
      <Show when={isBotDisplayed()}>
        <Bot {...props} widgetContext="standard" />
      </Show>
    </>
  );
};
