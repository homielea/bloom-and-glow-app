
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Smartphone, 
  Watch, 
  Activity, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle,
  Wifi,
  WifiOff,
  Database,
  Cloud
} from 'lucide-react';

interface Device {
  id: string;
  name: string;
  type: 'smartphone' | 'smartwatch' | 'fitness-tracker';
  status: 'connected' | 'syncing' | 'offline' | 'error';
  lastSync: Date;
  batteryLevel?: number;
  dataTypes: string[];
}

const MultiDeviceSyncDashboard: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([
    {
      id: '1',
      name: 'iPhone 15 Pro',
      type: 'smartphone',
      status: 'connected',
      lastSync: new Date(Date.now() - 5 * 60 * 1000),
      batteryLevel: 85,
      dataTypes: ['steps', 'heart_rate', 'sleep']
    },
    {
      id: '2',
      name: 'Apple Watch Series 9',
      type: 'smartwatch',
      status: 'syncing',
      lastSync: new Date(Date.now() - 2 * 60 * 1000),
      batteryLevel: 60,
      dataTypes: ['heart_rate', 'workouts', 'sleep']
    },
    {
      id: '3',
      name: 'Oura Ring Gen3',
      type: 'fitness-tracker',
      status: 'offline',
      lastSync: new Date(Date.now() - 30 * 60 * 1000),
      batteryLevel: 40,
      dataTypes: ['sleep', 'hrv', 'temperature']
    }
  ]);

  const [syncProgress, setSyncProgress] = useState(0);
  const [isGlobalSync, setIsGlobalSync] = useState(false);

  useEffect(() => {
    // Simulate sync progress
    if (isGlobalSync) {
      const interval = setInterval(() => {
        setSyncProgress(prev => {
          if (prev >= 100) {
            setIsGlobalSync(false);
            return 0;
          }
          return prev + 10;
        });
      }, 500);
      return () => clearInterval(interval);
    }
  }, [isGlobalSync]);

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'smartphone':
        return <Smartphone className="w-5 h-5" />;
      case 'smartwatch':
        return <Watch className="w-5 h-5" />;
      case 'fitness-tracker':
        return <Activity className="w-5 h-5" />;
      default:
        return <Activity className="w-5 h-5" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Connected</Badge>;
      case 'syncing':
        return <Badge variant="default"><RefreshCw className="w-3 h-3 mr-1 animate-spin" />Syncing</Badge>;
      case 'offline':
        return <Badge variant="outline"><WifiOff className="w-3 h-3 mr-1" />Offline</Badge>;
      case 'error':
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Error</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const handleDeviceSync = (deviceId: string) => {
    setDevices(prev => 
      prev.map(device => 
        device.id === deviceId 
          ? { ...device, status: 'syncing' as const }
          : device
      )
    );

    // Simulate sync completion
    setTimeout(() => {
      setDevices(prev => 
        prev.map(device => 
          device.id === deviceId 
            ? { ...device, status: 'connected' as const, lastSync: new Date() }
            : device
        )
      );
    }, 3000);
  };

  const handleGlobalSync = () => {
    setIsGlobalSync(true);
    setSyncProgress(0);
    setDevices(prev => 
      prev.map(device => ({ ...device, status: 'syncing' as const }))
    );
  };

  return (
    <div className="space-y-6">
      {/* Global Sync Control */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Cloud className="w-5 h-5" />
                Multi-Device Sync Dashboard
              </CardTitle>
              <CardDescription>
                Synchronize health data across all your connected devices
              </CardDescription>
            </div>
            <Button 
              onClick={handleGlobalSync}
              disabled={isGlobalSync}
            >
              {isGlobalSync ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <Database className="w-4 h-4 mr-2" />
                  Sync All Devices
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        {isGlobalSync && (
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Sync Progress</span>
                <span>{syncProgress}%</span>
              </div>
              <Progress value={syncProgress} className="w-full" />
            </div>
          </CardContent>
        )}
      </Card>

      <Tabs defaultValue="devices" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="devices">Connected Devices</TabsTrigger>
          <TabsTrigger value="conflicts">Sync Conflicts</TabsTrigger>
          <TabsTrigger value="settings">Sync Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="devices" className="space-y-4">
          <div className="grid gap-4">
            {devices.map((device) => (
              <Card key={device.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        {getDeviceIcon(device.type)}
                      </div>
                      <div>
                        <h3 className="font-medium">{device.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Last sync: {device.lastSync.toLocaleTimeString()}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {getStatusBadge(device.status)}
                          {device.batteryLevel && (
                            <Badge variant="outline" className="text-xs">
                              {device.batteryLevel}% battery
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm font-medium">Data Types</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {device.dataTypes.map((type) => (
                            <Badge key={type} variant="secondary" className="text-xs">
                              {type.replace('_', ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Button
                        onClick={() => handleDeviceSync(device.id)}
                        disabled={device.status === 'syncing'}
                        size="sm"
                        variant="outline"
                      >
                        {device.status === 'syncing' ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <RefreshCw className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="conflicts" className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Data Conflict Detected:</strong> Heart rate data from Apple Watch and Oura Ring 
              shows different values for the same time period. Please review and select the preferred source.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle>Resolve Conflicts</CardTitle>
              <CardDescription>Choose which device data to prioritize</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Heart Rate - Today 2:30 PM</h4>
                    <p className="text-sm text-muted-foreground">
                      Apple Watch: 78 BPM | Oura Ring: 82 BPM
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">Use Apple Watch</Button>
                    <Button size="sm" variant="outline">Use Oura Ring</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sync Preferences</CardTitle>
              <CardDescription>Configure how your devices sync data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">Auto-sync frequency</h4>
                <select className="w-full p-2 border rounded-md">
                  <option value="realtime">Real-time</option>
                  <option value="hourly">Every hour</option>
                  <option value="daily">Daily</option>
                </select>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Data priority</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Heart Rate</span>
                    <select className="p-1 border rounded text-sm">
                      <option>Apple Watch</option>
                      <option>Oura Ring</option>
                    </select>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Sleep Data</span>
                    <select className="p-1 border rounded text-sm">
                      <option>Oura Ring</option>
                      <option>Apple Watch</option>
                    </select>
                  </div>
                </div>
              </div>

              <Button className="w-full mt-4">Save Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MultiDeviceSyncDashboard;
