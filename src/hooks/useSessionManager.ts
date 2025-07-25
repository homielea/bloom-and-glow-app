
import { useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface SessionState {
  session: Session | null;
  loading: boolean;
  isExpired: boolean;
}

export const useSessionManager = () => {
  const [sessionState, setSessionState] = useState<SessionState>({
    session: null,
    loading: true,
    isExpired: false
  });

  const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours
  const WARNING_TIME = 5 * 60 * 1000; // 5 minutes before expiry

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let warningId: NodeJS.Timeout;

    const checkSessionExpiry = (session: Session | null) => {
      if (!session) return;

      const expiresAt = session.expires_at ? session.expires_at * 1000 : Date.now() + SESSION_TIMEOUT;
      const timeUntilExpiry = expiresAt - Date.now();
      const timeUntilWarning = timeUntilExpiry - WARNING_TIME;

      // Clear existing timeouts
      if (timeoutId) clearTimeout(timeoutId);
      if (warningId) clearTimeout(warningId);

      // Set warning timeout
      if (timeUntilWarning > 0) {
        warningId = setTimeout(() => {
          toast({
            title: "Session expiring soon",
            description: "Your session will expire in 5 minutes. Please save your work.",
            variant: "destructive"
          });
        }, timeUntilWarning);
      }

      // Set expiry timeout
      if (timeUntilExpiry > 0) {
        timeoutId = setTimeout(() => {
          setSessionState(prev => ({ ...prev, isExpired: true }));
          toast({
            title: "Session expired",
            description: "Please log in again to continue.",
            variant: "destructive"
          });
          supabase.auth.signOut();
        }, timeUntilExpiry);
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        // Update session state synchronously
        setSessionState(prevState => ({
          session,
          loading: false,
          isExpired: event === 'SIGNED_OUT' && !session ? false : prevState.isExpired
        }));

        // Handle session expiry checks
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setTimeout(() => {
            checkSessionExpiry(session);
          }, 0);
        }

        if (event === 'SIGNED_OUT') {
          if (timeoutId) clearTimeout(timeoutId);
          if (warningId) clearTimeout(warningId);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSessionState({
        session,
        loading: false,
        isExpired: false
      });
      
      if (session) {
        checkSessionExpiry(session);
      }
    });

    return () => {
      subscription.unsubscribe();
      if (timeoutId) clearTimeout(timeoutId);
      if (warningId) clearTimeout(warningId);
    };
  }, []);

  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      
      toast({
        title: "Session refreshed",
        description: "Your session has been successfully renewed.",
      });
      
      return data.session;
    } catch (error) {
      console.error('Session refresh error:', error);
      toast({
        title: "Failed to refresh session",
        description: "Please log in again.",
        variant: "destructive"
      });
      return null;
    }
  };

  return {
    ...sessionState,
    refreshSession
  };
};
