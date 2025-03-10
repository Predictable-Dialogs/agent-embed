import { createSignal, createEffect, onMount } from 'solid-js';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

export type PlateTextProps = {
  content: string
}

export const PlateText = (props: PlateTextProps) => {
  const [htmlContent, setHtmlContent] = createSignal('');

  // onMount(async () => {
  //   const markdown = await marked(props.content);
  //   const safeHTML = DOMPurify.sanitize(markdown);
  //   setHtmlContent(safeHTML);
  // });
  createEffect(async () => {
    const markdown = await marked(props.content);
    const safeHTML = DOMPurify.sanitize(markdown);
    setHtmlContent(safeHTML);
  });

  // The -mb-5 helps in removing the space after last line introduced
  // my mrked.
  return (
    <div 
      innerHTML={htmlContent()}       
      class="-mb-5"
    />
  )
}
