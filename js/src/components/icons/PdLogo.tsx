import { JSX } from 'solid-js/jsx-runtime';

export const PredictableText = (props: JSX.SvgSVGAttributes<SVGSVGElement>) => {
  const width = props.width || 256;
  const height = props.height || width;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      fill="none"
      role="img"
      aria-labelledby="title"
      height={height}
      {...props}
    >
      <title id="title">Predictable Dialogs</title>
      <circle cx="128" cy="128" r="104" stroke="currentColor" stroke-width="8" />
      <g stroke="currentColor" stroke-width="10" stroke-linecap="round" stroke-linejoin="round">
        <path d="M80 106V183M80 110C87 103 94 100 102 100C117 100 128 111 128 127C128 143 117 154 102 154C94 154 87 151 80 144" />
        <path d="M176 74V152M176 110C169 103 162 100 154 100C139 100 128 111 128 127C128 143 139 154 154 154C162 154 169 151 176 144" />
      </g>
    </svg>
  );
};
