
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Smartphone, Download, X, Check, Bell, Wifi, WifiOff } from 'lucide-react';
import { usePWA, useNotifications, useOfflineStorage } from '../hooks/usePWA';
import { toast } from 'sonner';

const PWAPrompt: React.FC = () => {
  const { isInstallable, isInstalled, installApp } = usePWA();
  const { isSupported: notificationSupported, permission, requestPermission } = useNotifications();
  const { isOnline } = useOfflineStorage();
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);
  const [hasSeenInstallPrompt, setHasSeenInstallPrompt] = useState(false);

  useEffect(() => {
    // Show install prompt if app is installable and user hasn't seen it
    if (isInstallable && !hasSeenInstallPrompt && !isInstalled) {
      const hasSeenBefore = localStorage.getItem('pwa-install-prompt-seen');
      if (!hasSeenBefore) {
        setTimeout(() => setShowInstallPrompt(true), 3000);
      }
    }
  }, [isInstallable, hasSeenInstallPrompt, isInstalled]);

  useEffect(() => {
    // Show notification permission prompt if supported and not granted
    if (notificationSupported && permission === 'default' && isInstalled) {
      const hasAskedBefore = localStorage.getItem('notification-permission-asked');
      if (!hasAskedBefore) {
        setTimeout(() => setShowPermissionPrompt(true), 5000);
      }
    }
  }, [notificationSupported, permission, isInstalled]);

  const handleInstall = async () => {
    try {
      await installApp();
      setShowInstallPrompt(false);
      localStorage.setItem('pwa-install-prompt-seen', 'true');
      setHasSeenInstallPrompt(true);
      toast.success('App installed successfully! You can now use it offline.');
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Install failed:', error);
      }
      toast.error('Installation failed. Please try again.');
    }
  };

  const handleDismissInstall = () => {
    setShowInstallPrompt(false);
    localStorage.setItem('pwa-install-prompt-seen', 'true');
    setHasSeenInstallPrompt(true);
  };

  const handleNotificationPermission = async () => {
    try {
      const granted = await requestPermission();
      setShowPermissionPrompt(false);
      localStorage.setItem('notification-permission-asked', 'true');
      
      if (granted) {
        toast.success('Notifications enabled! You\'ll receive wellness reminders.');
      } else {
        toast.error('Notifications disabled. You can enable them later in settings.');
      }
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Permission request failed:', error);
      }
      toast.error('Failed to request notification permission.');
    }
  };

  const handleDismissNotification = () => {
    setShowPermissionPrompt(false);
    localStorage.setItem('notification-permission-asked', 'true');
  };

  return (
    <>
      {/* Connection Status Indicator */}
      <div className="fixed top-4 right-4 z-50">
        {!isOnline && (
          <Badge variant="destructive" className="flex items-center gap-1">
            <WifiOff className="w-3 h-3" />
            Offline
          </Badge>
        )}
        {isInstalled && (
          <Badge variant="default" className="flex items-center gap-1 ml-2">
            <Check className="w-3 h-3" />
            Installed
          </Badge>
        )}
      </div>

      {/* Install App Prompt */}
      <Dialog open={showInstallPrompt} onOpenChange={setShowInstallPrompt}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5" />
              Install MenoWellness App
            </DialogTitle>
            <DialogDescription>
              Get the full experience with offline access, push notifications, and native app performance.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <WifiOff className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-900">Works Offline</p>
                  <p className="text-xs text-green-700">Access your data without internet</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <Bell className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-900">Smart Reminders</p>
                  <p className="text-xs text-blue-700">Get personalized wellness notifications</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                <Smartphone className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-purple-900">Native Experience</p>
                  <p className="text-xs text-purple-700">App-like performance and features</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleInstall} className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                Install App
              </Button>
              <Button variant="outline" onClick={handleDismissInstall}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Notification Permission Prompt */}
      <Dialog open={showPermissionPrompt} onOpenChange={setShowPermissionPrompt}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Enable Notifications
            </DialogTitle>
            <DialogDescription>
              Stay on track with your wellness journey with personalized reminders and insights.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">You'll receive notifications for:</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Daily check-in reminders</li>
                <li>• Wellness insights and tips</li>
                <li>• Community updates</li>
                <li>• Health tracker sync alerts</li>
              </ul>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleNotificationPermission} className="flex-1">
                Enable Notifications
              </Button>
              <Button variant="outline" onClick={handleDismissNotification}>
                Maybe Later
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* PWA Features Card (for non-installed users) */}
      {!isInstalled && !showInstallPrompt && isInstallable && (
        <Card className="fixed bottom-4 right-4 w-80 z-40 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Smartphone className="w-5 h-5" />
                  Get the App
                </CardTitle>
                <CardDescription>Enhanced experience available</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={handleDismissInstall}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <Button onClick={handleInstall} className="w-full" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Install Now
            </Button>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default PWAPrompt;
