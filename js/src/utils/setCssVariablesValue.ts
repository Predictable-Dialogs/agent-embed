import {
  Background,
  ChatTheme,
  ContainerColors,
  GeneralTheme,
  InputColors,
  Theme,
} from '@/schemas';
import { BackgroundType } from '@/schemas/features/agent/theme/enums';
import { isLight, hexToRgb } from '@/lib/hexToRgb';
import { isNotEmpty } from '@/lib/utils';

const cssVariableNames = {
  general: {
    bgImage: '--agent-embed-container-bg-image',
    bgColor: '--agent-embed-container-bg-color',
    fontFamily: '--agent-embed-container-font-family',
    color: '--agent-embed-container-color',
  },
  chat: {
    hostBubbles: {
      bgColor: '--agent-host-bubble-bg-color',
      color: '--agent-host-bubble-color',
    },
    guestBubbles: {
      bgColor: '--agent-guest-bubble-bg-color',
      color: '--agent-guest-bubble-color',
    },
    inputs: {
      bgColor: '--agent-input-bg-color',
      color: '--agent-input-color',
      placeholderColor: '--agent-input-placeholder-color',
    },
    buttons: {
      bgColor: '--agent-button-bg-color',
      bgColorRgb: '--agent-button-bg-color-rgb',
      color: '--agent-button-color',
    },
    checkbox: {
      bgColor: '--agent-checkbox-bg-color',
      color: '--agent-checkbox-color',
      baseAlpha: '--selectable-base-alpha',
    },
  },
} as const;

export const setCssVariablesValue = (theme: Theme | undefined, container: HTMLDivElement, font?: string, backgroundOverride?: Background, hostBubblesOverride?: { color: string; backgroundColor: string }, guestBubblesOverride?: { color: string; backgroundColor: string }, inputStylesOverride?: { roundness?: 'none' | 'medium' | 'large'; inputs?: InputColors; buttons?: ContainerColors }) => {
  if (!theme) return;
  const documentStyle = container?.style;
  if (!documentStyle) return;
  if (theme.general) setGeneralTheme(theme.general, documentStyle, font, backgroundOverride);
  if (theme.chat) setChatTheme(theme.chat, documentStyle, hostBubblesOverride, guestBubblesOverride, inputStylesOverride);
};

const setGeneralTheme = (generalTheme: GeneralTheme, documentStyle: CSSStyleDeclaration, fontOverride?: string, backgroundOverride?: Background) => {
  const { background, font } = generalTheme;
  const finalBackground = backgroundOverride || background;
  if (finalBackground) setAgentBackground(finalBackground, documentStyle);
  const finalFont = fontOverride || font;
  if (finalFont) documentStyle.setProperty(cssVariableNames.general.fontFamily, finalFont);
};

const setChatTheme = (chatTheme: ChatTheme, documentStyle: CSSStyleDeclaration, hostBubblesOverride?: { color: string; backgroundColor: string }, guestBubblesOverride?: { color: string; backgroundColor: string }, inputStylesOverride?: { roundness?: 'none' | 'medium' | 'large'; inputs?: InputColors; buttons?: ContainerColors }) => {
  const { hostBubbles, guestBubbles, buttons, inputs, roundness } = chatTheme;
  const finalHostBubbles = hostBubblesOverride || hostBubbles;
  const finalGuestBubbles = guestBubblesOverride || guestBubbles;
  const finalButtons = inputStylesOverride?.buttons || buttons;
  const finalInputs = inputStylesOverride?.inputs || inputs;
  const finalRoundness = inputStylesOverride?.roundness || roundness;
  if (finalHostBubbles) setHostBubbles(finalHostBubbles, documentStyle);
  if (finalGuestBubbles) setGuestBubbles(finalGuestBubbles, documentStyle);
  if (finalButtons) setButtons(finalButtons, documentStyle);
  if (finalInputs) setInputs(finalInputs, documentStyle);
  if (finalRoundness) setRoundness(finalRoundness, documentStyle);
};

const setHostBubbles = (hostBubbles: ContainerColors, documentStyle: CSSStyleDeclaration) => {
  if (hostBubbles.backgroundColor)
    documentStyle.setProperty(
      cssVariableNames.chat.hostBubbles.bgColor,
      hostBubbles.backgroundColor
    );
  if (hostBubbles.color)
    documentStyle.setProperty(cssVariableNames.chat.hostBubbles.color, hostBubbles.color);
};

const setGuestBubbles = (guestBubbles: ContainerColors, documentStyle: CSSStyleDeclaration) => {
  if (guestBubbles.backgroundColor)
    documentStyle.setProperty(
      cssVariableNames.chat.guestBubbles.bgColor,
      guestBubbles.backgroundColor
    );
  if (guestBubbles.color)
    documentStyle.setProperty(cssVariableNames.chat.guestBubbles.color, guestBubbles.color);
};

const setButtons = (buttons: ContainerColors, documentStyle: CSSStyleDeclaration) => {
  if (buttons.backgroundColor) {
    documentStyle.setProperty(cssVariableNames.chat.buttons.bgColor, buttons.backgroundColor);
    documentStyle.setProperty(
      cssVariableNames.chat.buttons.bgColorRgb,
      hexToRgb(buttons.backgroundColor).join(', ')
    );
  }

  if (buttons.color) documentStyle.setProperty(cssVariableNames.chat.buttons.color, buttons.color);
};

const setInputs = (inputs: InputColors, documentStyle: CSSStyleDeclaration) => {
  if (inputs.backgroundColor)
    documentStyle.setProperty(cssVariableNames.chat.inputs.bgColor, inputs.backgroundColor);
  if (inputs.color) documentStyle.setProperty(cssVariableNames.chat.inputs.color, inputs.color);
  if (inputs.placeholderColor)
    documentStyle.setProperty(
      cssVariableNames.chat.inputs.placeholderColor,
      inputs.placeholderColor
    );
};

const setAgentBackground = (background: Background, documentStyle: CSSStyleDeclaration) => {
  documentStyle.setProperty(cssVariableNames.general.bgImage, null);
  documentStyle.setProperty(cssVariableNames.general.bgColor, null);
  documentStyle.setProperty(
    background?.type === BackgroundType.IMAGE
      ? cssVariableNames.general.bgImage
      : cssVariableNames.general.bgColor,
    parseBackgroundValue(background)
  );
  documentStyle.setProperty(
    cssVariableNames.chat.checkbox.bgColor,
    background?.type === BackgroundType.IMAGE
      ? 'rgba(255, 255, 255, 0.75)'
      : (background?.type === BackgroundType.COLOR ? background.content : '#ffffff') ?? '#ffffff'
  );
  const backgroundColor =
    background.type === BackgroundType.IMAGE
      ? '#000000'
      : background?.type === BackgroundType.COLOR && isNotEmpty(background.content)
      ? background.content
      : '#ffffff';
  documentStyle.setProperty(
    cssVariableNames.general.color,
    isLight(backgroundColor) ? '#303235' : '#ffffff'
  );
  if (background.type === BackgroundType.IMAGE) {
    documentStyle.setProperty(cssVariableNames.chat.checkbox.baseAlpha, '0.40');
  } else {
    documentStyle.setProperty(cssVariableNames.chat.checkbox.baseAlpha, '0');
  }
};

const parseBackgroundValue = ({ type, content }: Background) => {
  switch (type) {
    case BackgroundType.NONE:
      return 'transparent';
    case BackgroundType.COLOR:
      return content ?? '#ffffff';
    case BackgroundType.IMAGE:
      return `url(${content})`;
  }
};

const setRoundness = (
  roundness: NonNullable<ChatTheme['roundness']>,
  documentStyle: CSSStyleDeclaration
) => {
  switch (roundness) {
    case 'none':
      documentStyle.setProperty('--agent-border-radius', '0');
      break;
    case 'medium':
      documentStyle.setProperty('--agent-border-radius', '6px');
      break;
    case 'large':
      documentStyle.setProperty('--agent-border-radius', '20px');
      break;
  }
};
