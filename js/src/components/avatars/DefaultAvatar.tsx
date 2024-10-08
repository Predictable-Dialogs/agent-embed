import { isMobile } from '@/utils/isMobileSignal'

export const DefaultAvatar = () => {
  return (
    <figure
      class={
        'flex justify-center items-center rounded-full text-white relative ' +
        (isMobile() ? 'w-6 h-6 text-sm' : 'w-10 h-10 text-xl')
      }
      data-testid="default-avatar"
    >
    <svg width="164" height="164" viewBox="0 0 164 164" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M77.25 83.9375C77.25 88.4792 76.5417 92.6042 75.125 96.3125C73.7083 100.021 71.7083 103.229 69.125 105.938C66.5833 108.604 63.5 110.688 59.875 112.188C56.25 113.688 52.1875 114.438 47.6875 114.438C44.6042 114.438 41.6042 113.875 38.6875 112.75C35.8125 111.625 33.125 109.958 30.625 107.75V136.312H22.0625V54.75H30.625V60.125C35.9167 55.625 41.6042 53.375 47.6875 53.375C52.1875 53.375 56.25 54.125 59.875 55.625C63.5 57.0833 66.5833 59.1875 69.125 61.9375C71.7083 64.6458 73.7083 67.8958 75.125 71.6875C76.5417 75.4375 77.25 79.5208 77.25 83.9375ZM68.6875 83.9375C68.6875 80.6875 68.2292 77.6458 67.3125 74.8125C66.4375 71.9375 65.1042 69.4583 63.3125 67.375C61.5208 65.2917 59.3125 63.6458 56.6875 62.4375C54.1042 61.2292 51.1042 60.625 47.6875 60.625C44.4375 60.625 41.3958 61.2292 38.5625 62.4375C35.7708 63.6458 33.125 65.6042 30.625 68.3125V99.5625C33.125 102.271 35.7708 104.208 38.5625 105.375C41.3958 106.542 44.4375 107.125 47.6875 107.125C51.1042 107.125 54.1042 106.521 56.6875 105.312C59.3125 104.104 61.5208 102.458 63.3125 100.375C65.1042 98.2917 66.4375 95.8542 67.3125 93.0625C68.2292 90.2292 68.6875 87.1875 68.6875 83.9375ZM144.062 113H135.438V107.625C132.979 109.833 130.271 111.521 127.312 112.688C124.396 113.854 121.396 114.438 118.312 114.438C113.688 114.438 109.542 113.688 105.875 112.188C102.208 110.688 99.1042 108.604 96.5625 105.938C94.0625 103.229 92.125 100 90.75 96.25C89.4167 92.5 88.75 88.3958 88.75 83.9375C88.75 79.5208 89.4167 75.4375 90.75 71.6875C92.125 67.8958 94.0625 64.6667 96.5625 62C99.1042 59.2917 102.208 57.1875 105.875 55.6875C109.542 54.1458 113.688 53.375 118.312 53.375C121.396 53.375 124.396 53.9375 127.312 55.0625C130.271 56.1458 132.979 57.7917 135.438 60V38.75H123.812V31.4375H144.062V113ZM135.438 68.3125C132.979 65.6042 130.292 63.6458 127.375 62.4375C124.5 61.2292 121.438 60.625 118.188 60.625C114.771 60.625 111.75 61.2292 109.125 62.4375C106.542 63.6458 104.375 65.2917 102.625 67.375C100.875 69.4583 99.5417 71.9167 98.625 74.75C97.75 77.5417 97.3125 80.6042 97.3125 83.9375C97.3125 87.2708 97.75 90.3542 98.625 93.1875C99.5417 95.9792 100.875 98.4167 102.625 100.5C104.375 102.583 106.542 104.229 109.125 105.438C111.75 106.646 114.771 107.25 118.188 107.25C124.771 107.25 130.521 104.646 135.438 99.4375V68.3125Z" fill="#4B5A2A"/>
      <mask id="path-2-inside-1_2_30" fill="white">
      <rect width="164" height="164" rx="5"/>
      </mask>
      <rect width="164" height="164" rx="5" stroke="#4B5A2A" stroke-width="14" mask="url(#path-2-inside-1_2_30)"/>
    </svg>
    </figure>
  )
}
