import { createSignal, createEffect, onCleanup, onMount } from 'solid-js';
import { isMobile } from '@/utils/isMobileSignal';
import { Avatar } from '../avatars/Avatar';

type Props = { hostAvatarSrc?: string; hideAvatar?: boolean, isPersisted?: boolean, isStreaming?: boolean, scrollOccurredDuringStreaming?: boolean, forceReposition?: boolean };

export const AvatarSideContainer = (props: Props) => {
  let avatarContainer: HTMLDivElement | undefined;
  const [top, setTop] = createSignal<number>(0);

  const resizeObserver = new ResizeObserver((entries) => {
    // Only block positioning if scrolling occurred during streaming AND we're still streaming
    if (props.scrollOccurredDuringStreaming && props.isStreaming && !props.forceReposition) return;
    
    const newTop = entries[0].target.clientHeight - (isMobile() ? 24 : 40);
    // Debounce position updates to reduce flicker
    // the setTimeout reduces the avatar flicker
    setTimeout(() => setTop(newTop), 10);
  });

  // Handle force repositioning signal
  createEffect(() => {
    if (props.forceReposition && avatarContainer) {
      // Manually trigger position update
      const newTop = avatarContainer.clientHeight - (isMobile() ? 24 : 40);
      setTimeout(() => setTop(newTop), 10);
    }
  });

  onMount(() => {
    if (avatarContainer) {
      resizeObserver.observe(avatarContainer);
    }
  });

  onCleanup(() => {
    if (avatarContainer) {
      resizeObserver.unobserve(avatarContainer);
    }
  });

  return (
    <div
      ref={avatarContainer}
      class={
        'flex flex-shrink-0 items-center relative agent-avatar-container ' +
        (isMobile() ? 'w-6' : 'w-10')
      }
    >
      <div
        class={
          'absolute flex items-center top-0' +
          (isMobile() ? ' w-6 h-6' : ' w-10 h-10') +
          (props.hideAvatar ? ' opacity-0' : ' opacity-100')
        }
        style={{
          top: `${top()}px`,
          transition: props.isPersisted ? '' : 'top 350ms ease-out, opacity 250ms ease-out',        
        }}
      >
        <Avatar initialAvatarSrc={props.hostAvatarSrc} isPersisted={props.isPersisted} />
      </div>
    </div>
  );
};
