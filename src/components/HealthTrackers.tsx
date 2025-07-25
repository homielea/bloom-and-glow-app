
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Activity, Smartphone, Watch, Heart, Zap, Moon, TrendingUp, AlertCircle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { toast } from 'sonner';
import GoogleFitConnect from './GoogleFitConnect';
import AppleHealthConnect from './AppleHealthConnect';
import RealTimeHealthMonitor from './RealTimeHealthMonitor';
import MultiDeviceSyncDashboard from './MultiDeviceSyncDashboard';
import AdvancedBiometricAnalysis from './AdvancedBiometricAnalysis';

interface HealthTrackersProps {
  onNavigate: (section: string) => void;
}

// Mock data for demonstration
const mockHealthData = [
  { date: '2024-01-15', heartRate: 72, steps: 8500, sleep: 7.5 },
  { date: '2024-01-16', heartRate: 75, steps: 9200, sleep: 6.8 },
  { date: '2024-01-17', heartRate: 73, steps: 7800, sleep: 8.1 },
  { date: '2024-01-18', heartRate: 71, steps: 10200, sleep: 7.2 },
  { date: '2024-01-19', heartRate: 74, steps: 8900, sleep: 7.8 },
];

const HealthTrackers: React.FC<HealthTrackersProps> = ({ onNavigate }) => {
  const { user, session, connectHealthTracker, getHealthTrackerConnections, getLatestTrackerData, syncHealthData } = useApp();
  const [connections, setConnections] = useState<any[]>([]);
  const [latestData, setLatestData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (user) {
      loadConnections();
    }
  }, [user]);

  const loadConnections = async () => {
    try {
      const userConnections = await getHealthTrackerConnections();
      setConnections(userConnections);
      
      // Load latest data if connections exist
      if (userConnections.length > 0) {
        const data = await getLatestTrackerData('sleep');
        setLatestData(data);
      }
    } catch (error) {
      console.error('Error loading connections:', error);
      toast.error('Failed to load health tracker connections');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async (provider: string, tokenData: any) => {
    try {
      const connection = await connectHealthTracker(provider, tokenData);
      setConnections(prev => [...prev, connection]);
      toast.success(`Successfully connected to ${provider}`);
      
      // Trigger initial sync
      await handleSync(connection.id);
    } catch (error) {
      console.error(`Error connecting to ${provider}:`, error);
      toast.error(`Failed to connect to ${provider}`);
    }
  };

  const handleSync = async (connectionId: string) => {
    try {
      setIsSyncing(true);
      await syncHealthData(connectionId);
      await loadConnections(); // Refresh data
    } catch (error) {
      console.error('Error syncing data:', error);
      toast.error('Failed to sync health data');
    } finally {
      setIsSyncing(false);
    }
  };

  const getConnectionStatus = (connection: any) => {
    switch (connection.sync_status) {
      case 'active':
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>;
      case 'error':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Error</Badge>;
      case 'disconnected':
        return <Badge variant="outline"><AlertCircle className="w-3 h-3 mr-1" />Disconnected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-indigo-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p>Loading health tracking features...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-indigo-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Health Tracking</h1>
            <p className="text-muted-foreground">
              Connect your devices and track your health metrics in real-time
            </p>
          </div>
          <Button 
            onClick={() => onNavigate('dashboard')}
            variant="outline"
          >
            ← Back to Dashboard
          </Button>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="connect">Connect Devices</TabsTrigger>
            <TabsTrigger value="realtime">Real-time Monitor</TabsTrigger>
            <TabsTrigger value="sync">Multi-Device Sync</TabsTrigger>
            <TabsTrigger value="analysis">Advanced Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Current Connections */}
            <Card>
              <CardHeader>
                <CardTitle>Connected Devices</CardTitle>
                <CardDescription>Your currently connected health tracking devices</CardDescription>
              </CardHeader>
              <CardContent>
                {connections.length === 0 ? (
                  <div className="text-center py-8">
                    <Activity className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-muted-foreground">No devices connected yet</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Connect your fitness tracker or smartwatch to start tracking your health metrics
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {connections.map((connection) => (
                      <div key={connection.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Activity className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-medium">{connection.device_name}</h3>
                            <p className="text-sm text-muted-foreground">
                              Connected {new Date(connection.connected_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {getConnectionStatus(connection)}
                          <Button
                            onClick={() => handleSync(connection.id)}
                            disabled={isSyncing}
                            size="sm"
                            variant="outline"
                          >
                            {isSyncing ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <RefreshCw className="w-4 h-4" />
                            )}
                            Sync
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Health Metrics Overview */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Heart Rate</CardTitle>
                  <Heart className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {latestData?.value || mockHealthData[mockHealthData.length - 1]?.heartRate || '--'} BPM
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Resting heart rate
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Sleep Score</CardTitle>
                  <Moon className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {mockHealthData[mockHealthData.length - 1]?.sleep || '--'} hrs
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Last night's sleep
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Activity</CardTitle>
                  <Zap className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {mockHealthData[mockHealthData.length - 1]?.steps || '--'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Steps today
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="connect" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <GoogleFitConnect onConnect={handleConnect} />
              <AppleHealthConnect onConnect={handleConnect} />
            </div>
          </TabsContent>

          <TabsContent value="realtime" className="space-y-6">
            <RealTimeHealthMonitor />
          </TabsContent>

          <TabsContent value="sync" className="space-y-6">
            <MultiDeviceSyncDashboard />
          </TabsContent>

          <TabsContent value="analysis" className="space-y-6">
            <AdvancedBiometricAnalysis />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default HealthTrackers;
