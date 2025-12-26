import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface PushNotificationState {
  isSupported: boolean;
  permission: NotificationPermission;
  isSubscribed: boolean;
}

export const usePushNotifications = () => {
  const { user } = useAuth();
  const [state, setState] = useState<PushNotificationState>({
    isSupported: false,
    permission: 'default',
    isSubscribed: false
  });

  useEffect(() => {
    // Check if push notifications are supported
    const isSupported = 'Notification' in window && 'serviceWorker' in navigator;
    setState(prev => ({
      ...prev,
      isSupported,
      permission: isSupported ? Notification.permission : 'denied'
    }));
  }, []);

  const requestPermission = useCallback(async () => {
    if (!state.isSupported) {
      toast({
        title: 'Não suportado',
        description: 'Seu navegador não suporta notificações push',
        variant: 'destructive'
      });
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setState(prev => ({ ...prev, permission }));

      if (permission === 'granted') {
        toast({
          title: 'Notificações ativadas',
          description: 'Você receberá alertas críticos em tempo real'
        });
        return true;
      } else if (permission === 'denied') {
        toast({
          title: 'Notificações bloqueadas',
          description: 'Você pode ativar nas configurações do navegador',
          variant: 'destructive'
        });
        return false;
      }
      return false;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }, [state.isSupported]);

  const sendNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (state.permission !== 'granted') {
      console.log('Notifications not granted');
      return;
    }

    try {
      const notification = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'nexmart-alert',
        ...options
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // Auto close after 10 seconds
      setTimeout(() => notification.close(), 10000);
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }, [state.permission]);

  // Subscribe to critical alerts
  useEffect(() => {
    if (!user || state.permission !== 'granted') return;

    const channel = supabase
      .channel('push-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'alert_history',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const alert = payload.new as any;
          
          // Only send push for high priority alerts
          if (alert.priority === 'high' || alert.priority === 'critical') {
            sendNotification(`🚨 ${alert.title}`, {
              body: alert.description,
              tag: `alert-${alert.id}`,
              requireInteraction: true,
              silent: false
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const notification = payload.new as any;
          
          // Only send push for error/warning notifications
          if (notification.type === 'error' || notification.type === 'warning') {
            sendNotification(notification.title, {
              body: notification.message,
              tag: `notification-${notification.id}`
            });
          }
        }
      )
      .subscribe((status) => {
        setState(prev => ({ ...prev, isSubscribed: status === 'SUBSCRIBED' }));
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, state.permission, sendNotification]);

  return {
    ...state,
    requestPermission,
    sendNotification
  };
};
