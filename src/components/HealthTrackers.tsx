import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Smartphone, Watch, Activity, Wifi, WifiOff, RefreshCw, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useApp } from '../contexts/AppContext';
import { toast } from '@/hooks/use-toast';
import { HealthTrackerConnection } from '../types';
import AppleHealthConnect from './AppleHealthConnect';
import GoogleFitConnect from './GoogleFitConnect';

const HealthTrackers: React.FC = () => {
  const [connections, setConnections] = useState<HealthTrackerConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<string | null>(null);
  const { session } = useApp();

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      const { data, error } = await supabase
        .from('health_tracker_connections')
        .select('id, provider, device_name, connected_at, last_sync_at, sync_status, sync_error_message')
        .order('connected_at', { ascending: false });

      if (error) throw error;
      
      // Type cast to ensure sync_status is properly typed
      const typedConnections: HealthTrackerConnection[] = (data || []).map(connection => ({
        ...connection,
        sync_status: connection.sync_status as 'active' | 'error' | 'disconnected'
      }));
      
      setConnections(typedConnections);
    } catch (error) {
      console.error('Error fetching connections:', error);
      toast({
        title: "Error",
        description: "Failed to load health tracker connections.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const connectFitbit = async () => {
    const clientId = 'YOUR_FITBIT_CLIENT_ID'; // This would come from environment
    const redirectUri = `${window.location.origin}/health-trackers`;
    const scope = 'activity heartrate sleep temperature weight';
    
    const authUrl = `https://www.fitbit.com/oauth2/authorize?` +
      `response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=fitbit`;
    
    window.location.href = authUrl;
  };

  const connectOura = async () => {
    const clientId = 'YOUR_OURA_CLIENT_ID'; // This would come from environment
    const redirectUri = `${window.location.origin}/health-trackers`;
    const scope = 'daily heartrate personal sleep';
    
    const authUrl = `https://cloud.ouraring.com/oauth/authorize?` +
      `response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=oura`;
    
    window.location.href = authUrl;
  };

  const syncConnection = async (connectionId: string) => {
    setSyncing(connectionId);
    
    try {
      const { data, error } = await supabase.functions.invoke('sync-health-data', {
        body: { connectionId, days: 7 }
      });

      if (error) throw error;

      toast({
        title: "Sync completed! 📊",
        description: `Synced ${data.recordsSynced} records from your ${data.provider} device.`,
      });

      fetchConnections();
    } catch (error) {
      console.error('Sync error:', error);
      toast({
        title: "Sync failed",
        description: "Failed to sync data from your device. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSyncing(null);
    }
  };

  const disconnectTracker = async (connectionId: string) => {
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

      fetchConnections();
    } catch (error) {
      console.error('Disconnect error:', error);
      toast({
        title: "Error",
        description: "Failed to disconnect tracker.",
        variant: "destructive"
      });
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'fitbit': return <Activity className="w-5 h-5" />;
      case 'oura': return <Watch className="w-5 h-5" />;
      default: return <Smartphone className="w-5 h-5" />;
    }
  };

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'fitbit': return 'bg-green-500';
      case 'oura': return 'bg-purple-500';
      default: return 'bg-blue-500';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800"><Wifi className="w-3 h-3 mr-1" />Connected</Badge>;
      case 'error':
        return <Badge variant="destructive"><WifiOff className="w-3 h-3 mr-1" />Error</Badge>;
      case 'disconnected':
        return <Badge variant="secondary"><WifiOff className="w-3 h-3 mr-1" />Disconnected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-indigo-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground">Loading health trackers...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-indigo-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Health Trackers</h1>
          <p className="text-muted-foreground">
            Connect your fitness devices to automatically track sleep, heart rate, and other wellness metrics.
          </p>
        </div>

        {/* Connected Devices */}
        {connections.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Connected Devices</h2>
            {connections.map((connection) => (
              <Card key={connection.id}>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${getProviderColor(connection.provider)} text-white`}>
                        {getProviderIcon(connection.provider)}
                      </div>
                      <div>
                        <CardTitle className="text-lg capitalize">{connection.provider}</CardTitle>
                        <CardDescription>{connection.device_name}</CardDescription>
                      </div>
                    </div>
                    {getStatusBadge(connection.sync_status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Connected:</span>
                      <span>{new Date(connection.connected_at).toLocaleDateString()}</span>
                    </div>
                    
                    {connection.last_sync_at && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Last sync:</span>
                        <span>{new Date(connection.last_sync_at).toLocaleString()}</span>
                      </div>
                    )}

                    {connection.sync_error_message && (
                      <div className="p-3 bg-red-50 rounded-lg">
                        <p className="text-sm text-red-700">{connection.sync_error_message}</p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => syncConnection(connection.id)}
                        disabled={syncing === connection.id}
                        className="bg-gradient-to-r from-rose-400 to-purple-400 hover:from-rose-500 hover:to-purple-500"
                      >
                        {syncing === connection.id ? (
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <RefreshCw className="w-4 h-4 mr-2" />
                        )}
                        Sync Now
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => disconnectTracker(connection.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Disconnect
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Available Devices */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Available Integrations</h2>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
            <AppleHealthConnect />
            <GoogleFitConnect />
            
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500 text-white">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle>Fitbit</CardTitle>
                    <CardDescription>Sleep, heart rate, activity tracking</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Automatically sync sleep quality, heart rate, and activity data from your Fitbit device.
                </p>
                <Button onClick={connectFitbit} className="w-full">
                  Connect Fitbit
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500 text-white">
                    <Watch className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle>Oura Ring</CardTitle>
                    <CardDescription>Advanced sleep & recovery metrics</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Get detailed sleep stages, HRV, and body temperature data from your Oura Ring.
                </p>
                <Button onClick={connectOura} className="w-full">
                  Connect Oura
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Coming Soon */}
        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
            <CardDescription>More integrations are on the way</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">Garmin</Badge>
              <Badge variant="outline">Samsung Health</Badge>
              <Badge variant="outline">Withings</Badge>
              <Badge variant="outline">Polar</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HealthTrackers;
