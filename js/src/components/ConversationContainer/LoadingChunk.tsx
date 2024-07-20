import { Theme } from '@/schemas'
import { Show } from 'solid-js'
import { LoadingBubble } from '../bubbles/LoadingBubble'
import { AvatarSideContainer } from './AvatarSideContainer'

type Props = {
  theme: Theme
}

export const LoadingChunk = (props: Props) => (
  <div class="flex w-full">
    <div class="flex flex-col w-full min-w-0">
      <div class="flex gap-2">
        <Show when={props.theme.chat.hostAvatar?.isEnabled}>
          <AvatarSideContainer
            hostAvatarSrc={props.theme.chat.hostAvatar?.url}
          />
        </Show>
        <LoadingBubble />
      </div>
    </div>
  </div>
)

export const ConnectingChunk = () => (
  <div class="flex w-full justify-center">
    <div class="flex flex-col items-center">
      <div class="flex gap-2">
        <p class="text-center text-sm text-gray-500">
          Connecting 
           <span class="bubble1 inline-block" style={{ 'background-color': 'transparent', 'color': 'inherit' }}>.</span>
            <span class="bubble2 inline-block" style={{ 'background-color': 'transparent', 'color': 'inherit' }}>.</span>
            <span class="bubble3 inline-block" style={{ 'background-color': 'transparent', 'color': 'inherit' }}>.</span>
        </p>
      </div>
    </div>
  </div>
)
