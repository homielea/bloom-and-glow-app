
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Heart, Zap, TrendingUp, AlertCircle, Play, Pause, RefreshCw } from 'lucide-react';

const RealTimeHealthMonitor: React.FC = () => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [currentData, setCurrentData] = useState({
    heartRate: 0,
    steps: 0,
    calories: 0,
    lastUpdate: new Date()
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isMonitoring) {
      interval = setInterval(() => {
        // Simulate real-time data
        const newData = {
          heartRate: Math.floor(Math.random() * 40) + 60, // 60-100 BPM
          steps: Math.floor(Math.random() * 100) + currentData.steps,
          calories: Math.floor(Math.random() * 5) + currentData.calories,
          lastUpdate: new Date()
        };
        
        setCurrentData(newData);
        
        // Add to chart data
        setChartData(prev => {
          const newPoint = {
            time: new Date().toLocaleTimeString(),
            heartRate: newData.heartRate,
            steps: newData.steps
          };
          return [...prev.slice(-19), newPoint]; // Keep last 20 points
        });
        
        // Check for alerts
        if (newData.heartRate > 100) {
          setAlerts(prev => [...prev, {
            id: Date.now(),
            type: 'warning',
            message: 'Elevated heart rate detected',
            timestamp: new Date()
          }]);
        }
      }, 2000);
    }
    
    return () => clearInterval(interval);
  }, [isMonitoring, currentData.steps, currentData.calories]);

  const toggleMonitoring = () => {
    setIsMonitoring(!isMonitoring);
    if (!isMonitoring) {
      setChartData([]);
      setAlerts([]);
    }
  };

  const dismissAlert = (alertId: number) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Real-Time Health Monitor
              </CardTitle>
              <CardDescription>
                Monitor your health metrics in real-time
              </CardDescription>
            </div>
            <Button onClick={toggleMonitoring} variant={isMonitoring ? "destructive" : "default"}>
              {isMonitoring ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Stop Monitoring
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Start Monitoring
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Badge variant={isMonitoring ? "default" : "secondary"}>
              {isMonitoring ? "Active" : "Inactive"}
            </Badge>
            {isMonitoring && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <RefreshCw className="w-4 h-4 animate-spin" />
                Last update: {currentData.lastUpdate.toLocaleTimeString()}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Current Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Heart Rate</CardTitle>
            <Heart className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isMonitoring ? currentData.heartRate : '--'} BPM
            </div>
            <p className="text-xs text-muted-foreground">
              Real-time measurement
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Steps</CardTitle>
            <Zap className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isMonitoring ? currentData.steps.toLocaleString() : '--'}
            </div>
            <p className="text-xs text-muted-foreground">
              Steps today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Calories</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isMonitoring ? currentData.calories : '--'}
            </div>
            <p className="text-xs text-muted-foreground">
              Calories burned
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Chart */}
      {isMonitoring && chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Real-time Trends</CardTitle>
            <CardDescription>Your health metrics over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="heartRate" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  name="Heart Rate (BPM)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-medium">Health Alerts</h3>
          {alerts.map((alert) => (
            <Alert key={alert.id} variant={alert.type === 'warning' ? 'destructive' : 'default'}>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>{alert.message}</span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => dismissAlert(alert.id)}
                >
                  Dismiss
                </Button>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}
    </div>
  );
};

export default RealTimeHealthMonitor;
