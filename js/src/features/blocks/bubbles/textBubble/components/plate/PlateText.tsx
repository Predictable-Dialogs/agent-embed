import { createSignal, onMount } from 'solid-js';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

export type PlateTextProps = {
  text: string
}

export const PlateText = (props: PlateTextProps) => {
  const [htmlContent, setHtmlContent] = createSignal('');

  onMount(async () => {
    const markdown = await marked(props.text);
    const safeHTML = DOMPurify.sanitize(markdown);
    setHtmlContent(safeHTML);
  });

  return (
    <span innerHTML={htmlContent()} />
  )
}
