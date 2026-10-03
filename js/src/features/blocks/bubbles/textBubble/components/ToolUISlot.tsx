import { Show, createEffect, createSignal, onCleanup } from 'solid-js';
import type { ToolRenderer, ToolRendererHandle, ToolUIInteractionState } from '@/types';
import { getToolUIData, type ToolUIData } from '@/utils/toolResults';

type Props = {
  part: unknown;
  pendingStatus?: 'detected' | 'ready';
  uiRenderers?: Record<string, ToolRenderer>;
  onSubmit?: (toolCallId: string, result: { cancelled: boolean; values?: unknown }) => Promise<void>;
};

type MountedRenderer = ToolRendererHandle & {
  instanceId: number;
  ui: ToolUIData;
  renderer: ToolRenderer;
  interactionState?: ToolUIInteractionState;
};

const restoreNativeFields = (container: HTMLDivElement, values: unknown) => {
  if (!values || typeof values !== 'object' || Array.isArray(values)) return;
  const saved = values as Record<string, unknown>;
  const fields = container.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
    'input[name], select[name], textarea[name]',
  );

  for (const field of fields) {
    if (!Object.prototype.hasOwnProperty.call(saved, field.name)) continue;
    const value = saved[field.name];
    if (field instanceof HTMLInputElement) {
      if (field.type === 'file') continue;
      if (field.type === 'checkbox') {
        field.checked = Array.isArray(value) ? value.includes(field.value)
          : typeof value === 'boolean' ? value : String(value) === field.value;
        continue;
      }
      if (field.type === 'radio') {
        field.checked = String(value) === field.value;
        continue;
      }
    }
    if (field instanceof HTMLSelectElement && field.multiple && Array.isArray(value)) {
      for (const option of field.options) option.selected = value.includes(option.value);
    } else {
      field.value = value == null ? '' : String(value);
    }
  }
};

const canReuseRenderer = (current: MountedRenderer, nextUI: ToolUIData, renderer: ToolRenderer) =>
  current.ui.toolCallId === nextUI.toolCallId &&
  current.ui.source === nextUI.source &&
  current.renderer === renderer &&
  (nextUI.source === 'input' || Object.is(current.ui.data, nextUI.data));

export const ToolUISlot = (props: Props) => {
  let container: HTMLDivElement | undefined;
  let mounted: MountedRenderer | undefined;
  let nextInstanceId = 0;
  const [rendered, setRendered] = createSignal(false);
  const [errorText, setErrorText] = createSignal('');
  const [submitting, setSubmitting] = createSignal(false);
  const ui = () => getToolUIData(props.part, Boolean(props.pendingStatus));
  const isResolved = () => (props.part as { state?: string })?.state === 'output-available';
  const isCancelled = () => Boolean(props.pendingStatus && isResolved() &&
    (props.part as { output?: { cancelled?: boolean } })?.output?.cancelled === true);
  const initialValues = () => props.pendingStatus && isResolved() && !isCancelled()
    ? (props.part as { output?: { values?: unknown } })?.output?.values
    : undefined;
  const interactionState = (): ToolUIInteractionState => {
    if (isResolved()) return 'resolved';
    if (submitting()) return 'submitting';
    return props.pendingStatus === 'ready' ? 'ready' : 'waiting';
  };

  const dispose = () => {
    const previous = mounted;
    mounted = undefined;
    setRendered(false);
    try {
      previous?.cleanup?.();
    } catch (error) {
      console.error('[ToolUISlot] renderer cleanup failed', error);
    } finally {
      container?.replaceChildren();
    }
  };

  const showRendererError = (toolName: string, error: unknown) => {
    dispose();
    setErrorText(`Unable to display ${toolName}.`);
    console.error('[ToolUISlot] renderer failed', error);
  };

  const notifyInteractionState = (current: MountedRenderer, next: ToolUIInteractionState | undefined) => {
    if (!next || current.interactionState === next) return;
    current.interactionState = next;
    current.onInteractionStateChange?.(next);
  };

  const submit = async (instanceId: number, cancelled: boolean): Promise<void> => {
    const current = ui();
    const active = mounted;
    if (!active || active.instanceId !== instanceId || current?.source !== 'input' ||
        active.ui.toolCallId !== current.toolCallId || submitting() || isResolved() ||
        props.pendingStatus !== 'ready' || !props.onSubmit || (!cancelled && !active.getValues)) return;

    setSubmitting(true);
    setErrorText('');
    try {
      if (!cancelled && active.validate && !(await active.validate())) return;
      if (mounted !== active || ui()?.toolCallId !== current.toolCallId ||
          isResolved() || props.pendingStatus !== 'ready') return;

      await props.onSubmit(current.toolCallId, cancelled
        ? { cancelled: true }
        : { cancelled: false, values: active.getValues?.() });
    } catch (error) {
      if (mounted === active) {
        setErrorText(error instanceof Error ? error.message : 'Could not submit this response.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const mountRenderer = (target: HTMLDivElement, nextUI: ToolUIData, renderer: ToolRenderer): MountedRenderer => {
    const instanceId = ++nextInstanceId;
    const savedValues = nextUI.source === 'input' ? initialValues() : undefined;
    const handle = renderer(target, nextUI.data, {
      initialValues: savedValues,
      ...(nextUI.source === 'input' ? {
        requestSubmit: () => submit(instanceId, false),
        requestCancel: () => submit(instanceId, true),
      } : {}),
    });
    const options: ToolRendererHandle = typeof handle === 'function'
      ? { cleanup: handle }
      : handle ?? {};
    if (
      typeof options.cleanup !== 'undefined' && typeof options.cleanup !== 'function' ||
      typeof options.getValues !== 'undefined' && typeof options.getValues !== 'function' ||
      typeof options.validate !== 'undefined' && typeof options.validate !== 'function' ||
      typeof options.onInteractionStateChange !== 'undefined' && typeof options.onInteractionStateChange !== 'function'
    ) throw new TypeError('Invalid tool renderer handle');
    if (nextUI.source === 'input') restoreNativeFields(target, savedValues);
    const current = { instanceId, ui: nextUI, renderer, ...options };
    mounted = current;
    setRendered(true);
    if (nextUI.source === 'input' && !options.getValues) {
      setErrorText(`Renderer for ${nextUI.toolName} must provide getValues().`);
    }
    return current;
  };

  createEffect(() => {
    const nextUI = ui();
    const nextInteractionState = nextUI?.source === 'input' ? interactionState() : undefined;
    const renderer = nextUI ? props.uiRenderers?.[nextUI.toolName] : undefined;
    if (container) container.inert = Boolean(nextInteractionState && nextInteractionState !== 'ready');
    if (mounted && nextUI && renderer && canReuseRenderer(mounted, nextUI, renderer)) {
      try {
        notifyInteractionState(mounted, nextInteractionState);
      } catch (error) {
        showRendererError(nextUI.toolName, error);
      }
      return;
    }

    dispose();
    setErrorText('');
    if (!nextUI || !container) {
      return;
    }
    if (!renderer) {
      if (nextUI.source === 'input') {
        setErrorText(`No renderer is registered for ${nextUI.toolName}.`);
      }
      return;
    }

    try {
      const current = mountRenderer(container, nextUI, renderer);
      notifyInteractionState(current, nextInteractionState);
    } catch (error) {
      showRendererError(nextUI.toolName, error);
    }
  });

  onCleanup(dispose);

  return (
    <div class="agent-tool-result" style={{ display: rendered() || errorText() ? undefined : 'none' }}>
      <div ref={container} class="agent-tool-render-container" />
      <Show when={errorText()}><div class="agent-tool-render-error" role="alert">{errorText()}</div></Show>
    </div>
  );
};
