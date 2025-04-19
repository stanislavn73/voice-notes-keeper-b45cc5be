
import { toast } from '@/components/ui/sonner';
import { ReactNode } from 'react';

interface NotificationProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const showNotification = ({
  message,
  type = 'info',
  duration = 3000,
  action
}: NotificationProps) => {
  const options = {
    duration,
    ...(action && {
      action: {
        label: action.label,
        onClick: action.onClick
      }
    })
  };

  switch (type) {
    case 'success':
      toast.success(message, options);
      break;
    case 'error':
      toast.error(message, options);
      break;
    default:
      toast(message, options);
  }
};
