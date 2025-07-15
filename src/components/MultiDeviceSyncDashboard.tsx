
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Smartphone, Watch, Activity, Wifi, WifiOff, RefreshCw, Settings, Clock, Database, AlertTriangle, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useApp } from '../contexts/AppContext';
import { toast } from '@/hooks/use-toast';
import { HealthTrackerConnection } from '../types';

interface SyncStatus {
  connectionId: string;
  provider: string;
  lastSync: string;
  status: 'syncing' | 'success' | 'error' | 'pending';
  progress: number;
  recordsSynced: number;
  errorMessage?: string;
}

interface DeviceSettings {
  autoSync: boolean;
  syncInterval: number; // in minutes
  dataTypes: string[];
  notifications: boolean;
}

const MultiDeviceSyncDashboard: React.FC = () => {
  const [connections, setConnections] = useState<HealthTrackerConnection[]>([]);
  const [syncStatuses, setSyncStatuses] = useState<SyncStatus[]>([]);
  const [deviceSettings, setDeviceSettings] = useState<{ [key: string]: DeviceSettings }>({});
  const [globalSyncing, setGlobalSyncing] = useState(false);
  const [loading, setLoading] = useState(true);
  const { session } = useApp();

  useEffect(() => {
    if (session?.user?.id) {
      loadConnections();
      setupRealTimeSync();
    }
  }, [session?.user?.id]);

  const loadConnections = async () => {
    try {
      const { data, error } = await supabase
        .from('health_tracker_connections')
        .select('*')
        .order('connected_at', { ascending: false });

      if (error) throw error;

      const typedConnections: HealthTrackerConnection[] = (data || []).map(connection => ({
        ...connection,
        sync_status: connection.sync_status as 'active' | 'error' | 'disconnected'
      }));

      setConnections(typedConnections);
      initializeSyncStatuses(typedConnections);
      loadDeviceSettings(typedConnections);
    } catch (error) {
      console.error('Error loading connections:', error);
      toast({
        title: "Error",
        description: "Failed to load device connections.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const initializeSyncStatuses = (connections: HealthTrackerConnection[]) => {
    const statuses = connections.map(conn => ({
      connectionId: conn.id,
      provider: conn.provider,
      lastSync: conn.last_sync_at || 'Never',
      status: 'pending' as const,
      progress: 0,
      recordsSynced: 0
    }));
    setSyncStatuses(statuses);
  };

  const loadDeviceSettings = (connections: HealthTrackerConnection[]) => {
    const settings: { [key: string]: DeviceSettings } = {};
    connections.forEach(conn => {
      settings[conn.id] = {
        autoSync: true,
        syncInterval: 15, // 15 minutes default
        dataTypes: ['sleep', 'heart_rate', 'hrv', 'activity'],
        notifications: true
      };
    });
    setDeviceSettings(settings);
  };

  const setupRealTimeSync = () => {
    // Set up real-time subscription for sync logs
    const channel = supabase
      .channel('sync-logs-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'health_tracker_sync_logs'
        },
        handleSyncLogUpdate
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'health_tracker_sync_logs'
        },
        handleSyncLogUpdate
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleSyncLogUpdate = (payload: any) => {
    const logData = payload.new;
    
    setSyncStatuses(prev => prev.map(status => {
      if (status.connectionId === logData.connection_id) {
        return {
          ...status,
          status: logData.sync_status === 'completed' ? 'success' : 
                 logData.sync_status === 'failed' ? 'error' : 'syncing',
          progress: logData.sync_status === 'completed' ? 100 : 
                   logData.sync_status === 'running' ? 50 : 0,
          recordsSynced: logData.records_synced || 0,
          errorMessage: logData.error_message,
          lastSync: logData.sync_completed_at || logData.sync_started_at
        };
      }
      return status;
    }));
  };

  const syncAllDevices = async () => {
    setGlobalSyncing(true);
    
    try {
      const activeConnections = connections.filter(conn => conn.sync_status === 'active');
      
      for (const connection of activeConnections) {
        updateSyncStatus(connection.id, 'syncing', 0);
        
        try {
          const { data, error } = await supabase.functions.invoke('sync-health-data', {
            body: { connectionId: connection.id, days: 7 }
          });

          if (error) throw error;

          updateSyncStatus(connection.id, 'success', 100, data.recordsSynced);
        } catch (error) {
          console.error(`Sync error for ${connection.provider}:`, error);
          updateSyncStatus(connection.id, 'error', 0, 0, error.message);
        }
      }

      toast({
        title: "Sync completed! 📊",
        description: `Synced data from ${activeConnections.length} devices.`,
      });
    } catch (error) {
      console.error('Global sync error:', error);
      toast({
        title: "Sync failed",
        description: "Failed to sync some devices. Please try again.",
        variant: "destructive"
      });
    } finally {
      setGlobalSyncing(false);
    }
  };

  const updateSyncStatus = (connectionId: string, status: SyncStatus['status'], progress: number, recordsSynced = 0, errorMessage?: string) => {
    setSyncStatuses(prev => prev.map(sync => 
      sync.connectionId === connectionId 
        ? { 
            ...sync, 
            status, 
            progress, 
            recordsSynced,
            errorMessage,
            lastSync: status === 'success' ? new Date().toISOString() : sync.lastSync
          }
        : sync
    ));
  };

  const syncSingleDevice = async (connectionId: string) => {
    updateSyncStatus(connectionId, 'syncing', 0);
    
    try {
      const { data, error } = await supabase.functions.invoke('sync-health-data', {
        body: { connectionId, days: 7 }
      });

      if (error) throw error;

      updateSyncStatus(connectionId, 'success', 100, data.recordsSynced);
      
      toast({
        title: "Sync completed! 📊",
        description: `Synced ${data.recordsSynced} records.`,
      });
    } catch (error) {
      console.error('Sync error:', error);
      updateSyncStatus(connectionId, 'error', 0, 0, error.message);
      
      toast({
        title: "Sync failed",
        description: "Failed to sync device data. Please try again.",
        variant: "destructive"
      });
    }
  };

  const updateDeviceSettings = (connectionId: string, settings: Partial<DeviceSettings>) => {
    setDeviceSettings(prev => ({
      ...prev,
      [connectionId]: { ...prev[connectionId], ...settings }
    }));
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'fitbit': return <Activity className="w-5 h-5" />;
      case 'oura': return <Watch className="w-5 h-5" />;
      case 'apple_health': return <Smartphone className="w-5 h-5" />;
      case 'google_fit': return <Smartphone className="w-5 h-5" />;
      default: return <Smartphone className="w-5 h-5" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'syncing': return <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">Loading device sync dashboard...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Multi-Device Sync Dashboard
              </CardTitle>
              <CardDescription>
                Manage synchronization across all your health devices
              </CardDescription>
            </div>
            <Button 
              onClick={syncAllDevices} 
              disabled={globalSyncing || connections.length === 0}
              className="bg-gradient-to-r from-rose-400 to-purple-400 hover:from-rose-500 hover:to-purple-500"
            >
              {globalSyncing ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Sync All Devices
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Sync Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{connections.length}</div>
            <div className="text-sm text-muted-foreground">Connected Devices</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {connections.filter(c => c.sync_status === 'active').length}
            </div>
            <div className="text-sm text-muted-foreground">Active Syncing</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {syncStatuses.reduce((sum, status) => sum + status.recordsSynced, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Records Synced Today</div>
          </CardContent>
        </Card>
      </div>

      {/* Device Sync Status */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Device Sync Status</h2>
        {connections.map((connection) => {
          const syncStatus = syncStatuses.find(s => s.connectionId === connection.id);
          const settings = deviceSettings[connection.id];
          
          return (
            <Card key={connection.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                      {getProviderIcon(connection.provider)}
                    </div>
                    <div>
                      <CardTitle className="text-lg capitalize">{connection.provider}</CardTitle>
                      <CardDescription>{connection.device_name}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {syncStatus && getStatusIcon(syncStatus.status)}
                    <Badge variant={connection.sync_status === 'active' ? 'default' : 'secondary'}>
                      {connection.sync_status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Sync Progress */}
                  {syncStatus?.status === 'syncing' && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Syncing...</span>
                        <span>{syncStatus.progress}%</span>
                      </div>
                      <Progress value={syncStatus.progress} className="h-2" />
                    </div>
                  )}

                  {/* Error Message */}
                  {syncStatus?.status === 'error' && syncStatus.errorMessage && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>{syncStatus.errorMessage}</AlertDescription>
                    </Alert>
                  )}

                  {/* Sync Info */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Last sync:</span>
                        <span className="ml-2">
                          {syncStatus?.lastSync === 'Never' ? 'Never' : 
                           new Date(syncStatus?.lastSync || '').toLocaleString()}
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Records synced:</span>
                        <span className="ml-2">{syncStatus?.recordsSynced || 0}</span>
                      </div>
                    </div>

                    {/* Device Settings */}
                    {settings && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label htmlFor={`auto-sync-${connection.id}`} className="text-sm">
                            Auto-sync
                          </Label>
                          <Switch
                            id={`auto-sync-${connection.id}`}
                            checked={settings.autoSync}
                            onCheckedChange={(checked) => 
                              updateDeviceSettings(connection.id, { autoSync: checked })
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor={`notifications-${connection.id}`} className="text-sm">
                            Notifications
                          </Label>
                          <Switch
                            id={`notifications-${connection.id}`}
                            checked={settings.notifications}
                            onCheckedChange={(checked) => 
                              updateDeviceSettings(connection.id, { notifications: checked })
                            }
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => syncSingleDevice(connection.id)}
                      disabled={syncStatus?.status === 'syncing'}
                      className="bg-gradient-to-r from-rose-400 to-purple-400 hover:from-rose-500 hover:to-purple-500"
                    >
                      {syncStatus?.status === 'syncing' ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4 mr-2" />
                      )}
                      Sync Now
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {connections.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Wifi className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Devices Connected</h3>
            <p className="text-muted-foreground mb-4">
              Connect your health devices to start syncing data automatically.
            </p>
            <Button>Connect Device</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MultiDeviceSyncDashboard;
