type Props = {
  inputId: string
  correctiveAnswer: string
  isFeedbackPending?: boolean
  onCorrectiveAnswerChange: (value: string) => void
  onSkip: () => void | Promise<void>
  onSubmit: () => void | Promise<void>
}

export const CorrectiveFeedbackPopup = (props: Props) => {
  return (
    <div class="agent-feedback-popup">
      <label class="agent-feedback-popup-label" for={props.inputId}>
        Please enter the correct answer
      </label>
      <textarea
        id={props.inputId}
        class="agent-feedback-popup-input"
        value={props.correctiveAnswer}
        onInput={(event) => props.onCorrectiveAnswerChange((event.target as HTMLTextAreaElement).value)}
        rows={3}
        placeholder="Optional"
      />
      <div class="agent-feedback-popup-actions">
        <button
          type="button"
          class="agent-feedback-popup-button secondary"
          onClick={props.onSkip}
          disabled={props.isFeedbackPending}
        >
          Skip
        </button>
        <button
          type="button"
          class="agent-feedback-popup-button"
          onClick={props.onSubmit}
          disabled={props.isFeedbackPending}
        >
          Submit
        </button>
      </div>
    </div>
  )
}
