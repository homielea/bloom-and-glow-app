
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Heart, Activity, Moon, Thermometer, Zap, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useApp } from '../contexts/AppContext';
import { toast } from '@/hooks/use-toast';

interface RealTimeMetric {
  type: 'heart_rate' | 'hrv' | 'temperature' | 'activity' | 'sleep';
  value: number;
  timestamp: string;
  status: 'normal' | 'elevated' | 'low' | 'critical';
  trend: 'up' | 'down' | 'stable';
  source: string;
}

const RealTimeHealthMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<RealTimeMetric[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [alerts, setAlerts] = useState<string[]>([]);
  const { session } = useApp();

  useEffect(() => {
    if (!session?.user?.id) return;

    // Set up real-time subscription for health data
    const channel = supabase
      .channel('health-data-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'health_tracker_data'
        },
        handleRealTimeData
      )
      .subscribe();

    setIsMonitoring(true);
    loadLatestMetrics();

    return () => {
      supabase.removeChannel(channel);
      setIsMonitoring(false);
    };
  }, [session?.user?.id]);

  const handleRealTimeData = (payload: any) => {
    const newData = payload.new;
    const metric = processHealthData(newData);
    
    if (metric) {
      setMetrics(prev => {
        const updated = [metric, ...prev.filter(m => m.type !== metric.type)];
        return updated.slice(0, 5); // Keep only latest 5 metrics
      });

      // Check for alerts
      checkForAlerts(metric);
    }
  };

  const processHealthData = (data: any): RealTimeMetric | null => {
    const { data_type, value, created_at, metadata } = data;
    
    if (!value) return null;

    let status: 'normal' | 'elevated' | 'low' | 'critical' = 'normal';
    let trend: 'up' | 'down' | 'stable' = 'stable';

    // Determine status and trend based on data type and value
    switch (data_type) {
      case 'heart_rate':
        if (value > 100) status = 'elevated';
        else if (value < 60) status = 'low';
        else if (value > 120) status = 'critical';
        break;
      case 'hrv':
        if (value < 20) status = 'low';
        else if (value > 50) status = 'elevated';
        break;
      case 'sleep':
        if (value < 70) status = 'low';
        else if (value > 85) status = 'elevated';
        break;
    }

    return {
      type: data_type as RealTimeMetric['type'],
      value,
      timestamp: created_at,
      status,
      trend,
      source: metadata?.device || 'Unknown Device'
    };
  };

  const loadLatestMetrics = async () => {
    try {
      const { data: connections } = await supabase
        .from('health_tracker_connections')
        .select('id')
        .eq('sync_status', 'active');

      if (!connections?.length) return;

      const { data: latestData } = await supabase
        .from('health_tracker_data')
        .select('*')
        .in('connection_id', connections.map(c => c.id))
        .order('created_at', { ascending: false })
        .limit(10);

      if (latestData) {
        const processedMetrics = latestData
          .map(processHealthData)
          .filter(Boolean) as RealTimeMetric[];
        
        setMetrics(processedMetrics);
      }
    } catch (error) {
      console.error('Error loading latest metrics:', error);
    }
  };

  const checkForAlerts = (metric: RealTimeMetric) => {
    const alertMessages: string[] = [];

    if (metric.status === 'critical') {
      alertMessages.push(`Critical ${metric.type} detected: ${metric.value}`);
    } else if (metric.status === 'elevated' && metric.type === 'heart_rate') {
      alertMessages.push(`Elevated heart rate: ${metric.value} BPM`);
    } else if (metric.status === 'low' && metric.type === 'hrv') {
      alertMessages.push(`Low HRV detected: ${metric.value}ms`);
    }

    if (alertMessages.length > 0) {
      setAlerts(prev => [...alertMessages, ...prev].slice(0, 3));
      
      toast({
        title: "Health Alert",
        description: alertMessages[0],
        variant: metric.status === 'critical' ? 'destructive' : 'default'
      });
    }
  };

  const getMetricIcon = (type: string) => {
    switch (type) {
      case 'heart_rate': return <Heart className="w-5 h-5" />;
      case 'hrv': return <Activity className="w-5 h-5" />;
      case 'sleep': return <Moon className="w-5 h-5" />;
      case 'temperature': return <Thermometer className="w-5 h-5" />;
      default: return <Zap className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'bg-red-500';
      case 'elevated': return 'bg-orange-500';
      case 'low': return 'bg-yellow-500';
      default: return 'bg-green-500';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-600" />;
      default: return <div className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Monitoring Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Real-Time Health Monitor
              </CardTitle>
              <CardDescription>Live health metrics from your connected devices</CardDescription>
            </div>
            <Badge className={isMonitoring ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
              {isMonitoring ? 'Monitoring Active' : 'Not Monitoring'}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Health Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, index) => (
            <Alert key={index} className="border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{alert}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Live Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {metrics.map((metric, index) => (
          <Card key={`${metric.type}-${index}`}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getMetricIcon(metric.type)}
                  <CardTitle className="text-sm capitalize">
                    {metric.type.replace('_', ' ')}
                  </CardTitle>
                </div>
                {getTrendIcon(metric.trend)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">
                    {metric.value}
                    {metric.type === 'heart_rate' && ' BPM'}
                    {metric.type === 'hrv' && ' ms'}
                    {metric.type === 'sleep' && '%'}
                    {metric.type === 'temperature' && '°F'}
                  </span>
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(metric.status)}`} />
                </div>
                
                <div className="text-xs text-muted-foreground">
                  <div>From: {metric.source}</div>
                  <div>{new Date(metric.timestamp).toLocaleTimeString()}</div>
                </div>

                {/* Status indicator */}
                <Progress 
                  value={
                    metric.status === 'critical' ? 100 :
                    metric.status === 'elevated' ? 75 :
                    metric.status === 'low' ? 25 : 50
                  }
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {metrics.length === 0 && isMonitoring && (
        <Card>
          <CardContent className="text-center py-12">
            <Activity className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Waiting for Data</h3>
            <p className="text-muted-foreground">
              Connect your health devices to see real-time monitoring data here.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RealTimeHealthMonitor;
