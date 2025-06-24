
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Smartphone, Download, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface AppleHealthData {
  sleepData?: any[];
  heartRateData?: any[];
  stepData?: any[];
  bodyTemperatureData?: any[];
}

const AppleHealthConnect: React.FC = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);

  React.useEffect(() => {
    // Check if we're on iOS and HealthKit is available
    const checkHealthKitSupport = () => {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const hasHealthKit = 'HealthKit' in window;
      setIsSupported(isIOS && hasHealthKit);
    };

    checkHealthKitSupport();
  }, []);

  const requestHealthKitPermissions = async () => {
    setLoading(true);
    
    try {
      // For web implementation, we'll use a simulated approach
      // In a real iOS app, this would use native HealthKit APIs
      if (!isSupported) {
        toast({
          title: "Apple Health not available",
          description: "Apple Health integration is only available on iOS devices with the Health app.",
          variant: "destructive"
        });
        return;
      }

      // Simulate permission request
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsConnected(true);
      setLastSync(new Date().toISOString());
      
      toast({
        title: "Apple Health connected! 🍎",
        description: "Your health data will now sync automatically.",
      });

      // In a real implementation, this would trigger data sync
      await syncAppleHealthData();
      
    } catch (error) {
      console.error('Apple Health connection error:', error);
      toast({
        title: "Connection failed",
        description: "Failed to connect to Apple Health. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const syncAppleHealthData = async (): Promise<AppleHealthData> => {
    // Simulate data sync - in a real app this would use HealthKit APIs
    const mockData: AppleHealthData = {
      sleepData: [
        { date: '2024-01-20', duration: 7.5, efficiency: 85 },
        { date: '2024-01-21', duration: 6.8, efficiency: 78 }
      ],
      heartRateData: [
        { date: '2024-01-20', restingHR: 65, avgHR: 75 },
        { date: '2024-01-21', restingHR: 68, avgHR: 72 }
      ],
      stepData: [
        { date: '2024-01-20', steps: 8500 },
        { date: '2024-01-21', steps: 9200 }
      ]
    };

    return mockData;
  };

  const disconnectAppleHealth = () => {
    setIsConnected(false);
    setLastSync(null);
    
    toast({
      title: "Disconnected",
      description: "Apple Health has been disconnected.",
    });
  };

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gray-400 text-white">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <CardTitle>Apple Health</CardTitle>
              <CardDescription>Sleep, heart rate, activity tracking</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Apple Health integration is only available on iOS devices with the Health app installed.
            </AlertDescription>
          </Alert>
          <p className="text-sm text-muted-foreground mt-4">
            If you're on an iOS device, please open this app in Safari to enable Health app integration.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isConnected) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gray-900 text-white">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <CardTitle>Apple Health</CardTitle>
                <CardDescription>Connected to Health app</CardDescription>
              </div>
            </div>
            <Badge className="bg-green-100 text-green-800">
              <CheckCircle className="w-3 h-3 mr-1" />
              Connected
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {lastSync && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Last sync:</span>
                <span>{new Date(lastSync).toLocaleString()}</span>
              </div>
            )}

            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-700">
                ✓ Syncing sleep data, heart rate, steps, and body temperature from your Health app.
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => syncAppleHealthData()}
                disabled={loading}
                className="bg-gradient-to-r from-rose-400 to-purple-400 hover:from-rose-500 hover:to-purple-500"
              >
                <Download className="w-4 h-4 mr-2" />
                Sync Now
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={disconnectAppleHealth}
              >
                Disconnect
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gray-900 text-white">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <CardTitle>Apple Health</CardTitle>
            <CardDescription>Sleep, heart rate, activity tracking</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Connect your iPhone's Health app to automatically sync sleep quality, heart rate, steps, and body temperature data.
        </p>
        
        <div className="space-y-3 mb-4">
          <div className="text-sm">
            <strong>Data we'll access:</strong>
          </div>
          <ul className="text-sm text-muted-foreground space-y-1 ml-4">
            <li>• Sleep analysis and sleep stages</li>
            <li>• Resting heart rate and HRV</li>
            <li>• Daily step count and activity</li>
            <li>• Body temperature (if available)</li>
          </ul>
        </div>
        
        <Button 
          onClick={requestHealthKitPermissions} 
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Connecting...' : 'Connect Apple Health'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default AppleHealthConnect;
