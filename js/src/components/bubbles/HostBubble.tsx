import { AudioBubble } from '@/features/blocks/bubbles/audio'
import { EmbedBubble } from '@/features/blocks/bubbles/embed'
import { ImageBubble } from '@/features/blocks/bubbles/image'
import { TextBubble } from '@/features/blocks/bubbles/textBubble'
import { VideoBubble } from '@/features/blocks/bubbles/video'
import type {
  AudioBubbleContent,
  ChatMessage,
  EmbedBubbleContent,
  ImageBubbleContent,
  TextBubbleContent,
  TypingEmulation,
  VideoBubbleContent,
} from '@/schemas'
import { BubbleBlockType } from '@/schemas/features/blocks/bubbles/enums'
import { Match, Switch } from 'solid-js'

type Props = {
  message: ChatMessage
  typingEmulation: TypingEmulation
  onTransitionEnd: (offsetTop?: number) => void
  filterResponse?: (response: string) => string
}

export const HostBubble = (props: Props) => {
  const onTransitionEnd = (offsetTop?: number) => {
    props.onTransitionEnd(offsetTop)
  }

  return (
    <Switch>
      <Match when={props.message.type === BubbleBlockType.TEXT}>
        <TextBubble
          content={props.message.content as TextBubbleContent}
          typingEmulation={props.typingEmulation}
          onTransitionEnd={onTransitionEnd}
          filterResponse={props.filterResponse}
        />
      </Match>
      <Match when={props.message.type === BubbleBlockType.IMAGE}>
        <ImageBubble
          content={props.message.content as ImageBubbleContent}
          onTransitionEnd={onTransitionEnd}
        />
      </Match>
      <Match when={props.message.type === BubbleBlockType.VIDEO}>
        <VideoBubble
          content={props.message.content as VideoBubbleContent}
          onTransitionEnd={onTransitionEnd}
        />
      </Match>
      <Match when={props.message.type === BubbleBlockType.EMBED}>
        <EmbedBubble
          content={props.message.content as EmbedBubbleContent}
          onTransitionEnd={onTransitionEnd}
        />
      </Match>
      <Match when={props.message.type === BubbleBlockType.AUDIO}>
        <AudioBubble
          url={(props.message.content as AudioBubbleContent).url}
          onTransitionEnd={onTransitionEnd}
        />
      </Match>
    </Switch>
  )
}
