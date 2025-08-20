import { JSX, splitProps } from 'solid-js';
import { Button } from './Button';

type Props = {
  onClick: () => void;
  isDisabled?: boolean;
  isLoading?: boolean;
  isOnCooldown?: boolean;
} & JSX.ButtonHTMLAttributes<HTMLButtonElement>;

export const ClearButton = (props: Props) => {
  const [local, buttonProps] = splitProps(props, ['onClick', 'isDisabled', 'isLoading', 'isOnCooldown']);
  
  const handleClick = () => {
    if (local.isOnCooldown) return;
    local.onClick();
  };
  
  return (
    <Button
      id="clear-button"
      variant="secondary"
      onClick={handleClick}
      isDisabled={local.isDisabled || local.isOnCooldown}
      isLoading={local.isLoading}
      class="clear-button"
      title={local.isOnCooldown ? "Please wait..." : "Clear chat"}
      {...buttonProps}
    >
      ↻
    </Button>
  );
};