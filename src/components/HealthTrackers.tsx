
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Smartphone, 
  Watch, 
  Activity, 
  Heart, 
  Moon, 
  CheckCircle, 
  AlertCircle, 
  Plus,
  Settings,
  Zap,
  TrendingUp
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useApp } from '../contexts/AppContext';
import { HealthTrackerConnection } from '../types';
import { toast } from '@/hooks/use-toast';
import RealTimeHealthMonitor from './RealTimeHealthMonitor';
import AdvancedBiometricAnalysis from './AdvancedBiometricAnalysis';
import MultiDeviceSyncDashboard from './MultiDeviceSyncDashboard';

const HealthTrackers: React.FC = () => {
  const [connections, setConnections] = useState<HealthTrackerConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);
  const { session } = useApp();

  useEffect(() => {
    if (session?.user?.id) {
      loadConnections();
    }
  }, [session?.user?.id]);

  const loadConnections = async () => {
    try {
      const { data, error } = await supabase
        .from('health_tracker_connections')
        .select('*')
        .order('connected_at', { ascending: false });

      if (error) throw error;
      
      if (data) {
        setConnections(data.map(conn => ({
          id: conn.id,
          provider: conn.provider,
          device_name: conn.device_name || '',
          connected_at: conn.connected_at,
          last_sync_at: conn.last_sync_at,
          sync_status: conn.sync_status as 'active' | 'error' | 'disconnected',
          sync_error_message: conn.sync_error_message
        })));
      }
    } catch (error) {
      console.error('Error loading connections:', error);
      toast({
        title: "Error",
        description: "Failed to load health tracker connections.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (provider: string) => {
    setConnecting(provider);
    
    try {
      // This would normally redirect to OAuth flow
      // For demo purposes, we'll simulate a connection
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const { error } = await supabase
        .from('health_tracker_connections')
        .insert({
          provider,
          device_name: `${provider} Device`,
          access_token: 'demo_token',
          sync_status: 'active'
        });

      if (error) throw error;

      toast({
        title: "Connected!",
        description: `Successfully connected to ${provider}.`,
      });

      loadConnections();
    } catch (error) {
      console.error('Error connecting:', error);
      toast({
        title: "Connection Failed",
        description: `Failed to connect to ${provider}. Please try again.`,
        variant: "destructive"
      });
    } finally {
      setConnecting(null);
    }
  };

  const handleDisconnect = async (connectionId: string) => {
    try {
      const { error } = await supabase
        .from('health_tracker_connections')
        .delete()
        .eq('id', connectionId);

      if (error) throw error;

      toast({
        title: "Disconnected",
        description: "Health tracker has been disconnected.",
      });

      loadConnections();
    } catch (error) {
      console.error('Error disconnecting:', error);
      toast({
        title: "Error",
        description: "Failed to disconnect. Please try again.",
        variant: "destructive"
      });
    }
  };

  const providers = [
    {
      name: 'Fitbit',
      icon: Activity,
      description: 'Connect your Fitbit device for comprehensive health tracking',
      features: ['Steps', 'Heart Rate', 'Sleep', 'Calories']
    },
    {
      name: 'Apple Health',
      icon: Heart,
      description: 'Sync data from Apple Health and connected devices',
      features: ['Heart Rate', 'Sleep', 'Activity', 'Health Records']
    },
    {
      name: 'Google Fit',
      icon: Smartphone,
      description: 'Import activity and wellness data from Google Fit',
      features: ['Steps', 'Activities', 'Weight', 'Heart Points']
    },
    {
      name: 'Oura Ring',
      icon: Moon,
      description: 'Advanced sleep and recovery tracking with Oura',
      features: ['Sleep Quality', 'HRV', 'Temperature', 'Recovery']
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>;
      case 'error':
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Error</Badge>;
      case 'disconnected':
        return <Badge variant="secondary">Disconnected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-indigo-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p>Loading health trackers...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-indigo-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Health Trackers</h1>
            <p className="text-muted-foreground">
              Connect your devices for comprehensive health monitoring and insights.
            </p>
          </div>
        </div>

        <Tabs defaultValue="connect" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="connect">Connect Devices</TabsTrigger>
            <TabsTrigger value="realtime">Real-time Monitor</TabsTrigger>
            <TabsTrigger value="analytics">Biometric Analysis</TabsTrigger>
            <TabsTrigger value="sync">Multi-Device Sync</TabsTrigger>
            <TabsTrigger value="insights">Advanced Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="connect" className="space-y-6">
            {/* Connected Devices */}
            {connections.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Connected Devices</CardTitle>
                  <CardDescription>Your currently connected health trackers</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {connections.map((connection) => (
                      <div key={connection.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <Activity className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">{connection.device_name}</div>
                            <div className="text-sm text-muted-foreground">
                              Last sync: {connection.last_sync_at ? new Date(connection.last_sync_at).toLocaleDateString() : 'Never'}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {getStatusBadge(connection.sync_status)}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDisconnect(connection.id)}
                          >
                            Disconnect
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Available Providers */}
            <Card>
              <CardHeader>
                <CardTitle>Available Integrations</CardTitle>
                <CardDescription>Connect new health tracking devices and apps</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {providers.map((provider) => {
                    const IconComponent = provider.icon;
                    const isConnected = connections.some(c => c.provider === provider.name.toLowerCase());
                    const isConnecting = connecting === provider.name.toLowerCase();
                    
                    return (
                      <Card key={provider.name} className={isConnected ? 'border-green-200 bg-green-50/50' : ''}>
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-primary/10 rounded-lg">
                                <IconComponent className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <h3 className="font-semibold">{provider.name}</h3>
                                <p className="text-sm text-muted-foreground">{provider.description}</p>
                              </div>
                            </div>
                            {isConnected && <CheckCircle className="w-5 h-5 text-green-600" />}
                          </div>
                          
                          <div className="flex flex-wrap gap-1 mb-4">
                            {provider.features.map((feature) => (
                              <Badge key={feature} variant="secondary" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                          
                          <Button
                            onClick={() => handleConnect(provider.name.toLowerCase())}
                            disabled={isConnected || isConnecting}
                            className="w-full"
                            variant={isConnected ? "secondary" : "default"}
                          >
                            {isConnecting ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                Connecting...
                              </>
                            ) : isConnected ? (
                              <>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Connected
                              </>
                            ) : (
                              <>
                                <Plus className="w-4 h-4 mr-2" />
                                Connect
                              </>
                            )}
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="realtime">
            <RealTimeHealthMonitor />
          </TabsContent>

          <TabsContent value="analytics">
            <AdvancedBiometricAnalysis />
          </TabsContent>

          <TabsContent value="sync">
            <MultiDeviceSyncDashboard />
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Advanced Health Insights
                </CardTitle>
                <CardDescription>
                  AI-powered analysis of your health patterns and personalized recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <Card className="border-dashed border-2 border-purple-200 bg-purple-50/50">
                    <CardContent className="pt-6 text-center">
                      <Zap className="w-12 h-12 mx-auto text-purple-600 mb-3" />
                      <h3 className="font-semibold mb-2">Energy Optimization</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        AI recommendations to optimize your energy levels throughout the day
                      </p>
                      <Badge variant="secondary">Coming Soon</Badge>
                    </CardContent>
                  </Card>

                  <Card className="border-dashed border-2 border-blue-200 bg-blue-50/50">
                    <CardContent className="pt-6 text-center">
                      <Moon className="w-12 h-12 mx-auto text-blue-600 mb-3" />
                      <h3 className="font-semibold mb-2">Sleep Coaching</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Personalized sleep improvement strategies based on your patterns
                      </p>
                      <Badge variant="secondary">Coming Soon</Badge>
                    </CardContent>
                  </Card>

                  <Card className="border-dashed border-2 border-green-200 bg-green-50/50">
                    <CardContent className="pt-6 text-center">
                      <Heart className="w-12 h-12 mx-auto text-green-600 mb-3" />
                      <h3 className="font-semibold mb-2">Stress Management</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Proactive stress detection and management recommendations
                      </p>
                      <Badge variant="secondary">Coming Soon</Badge>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default HealthTrackers;
