
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Smartphone, Download, CheckCircle, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const GoogleFitConnect: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);

  const connectGoogleFit = async () => {
    setLoading(true);
    
    try {
      // In a real implementation, this would use Google Fit OAuth
      const clientId = 'YOUR_GOOGLE_FIT_CLIENT_ID'; // This would come from environment
      const redirectUri = `${window.location.origin}/health-trackers`;
      const scope = 'https://www.googleapis.com/auth/fitness.sleep.read https://www.googleapis.com/auth/fitness.heart_rate.read https://www.googleapis.com/auth/fitness.activity.read';
      
      const authUrl = `https://accounts.google.com/oauth2/authorize?` +
        `response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=googlefit`;
      
      // For demo purposes, we'll simulate the connection
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsConnected(true);
      setLastSync(new Date().toISOString());
      
      toast({
        title: "Google Fit connected! 📊",
        description: "Your fitness data will now sync automatically.",
      });
      
    } catch (error) {
      toast({
        title: "Connection failed",
        description: "Failed to connect to Google Fit. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const syncGoogleFitData = async () => {
    setSyncing(true);
    
    try {
      // Simulate data sync
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setLastSync(new Date().toISOString());
      
      toast({
        title: "Sync completed! 📊",
        description: "Synced 15 records from Google Fit.",
      });
      
    } catch (error) {
      toast({
        title: "Sync failed",
        description: "Failed to sync data from Google Fit. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSyncing(false);
    }
  };

  const disconnectGoogleFit = () => {
    setIsConnected(false);
    setLastSync(null);
    
    toast({
      title: "Disconnected",
      description: "Google Fit has been disconnected.",
    });
  };

  if (isConnected) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500 text-white">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <CardTitle>Google Fit</CardTitle>
                <CardDescription>Connected to Google Fit</CardDescription>
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

            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                ✓ Syncing sleep data, heart rate, steps, and activity from Google Fit.
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={syncGoogleFitData}
                disabled={syncing}
                className="bg-gradient-to-r from-rose-400 to-purple-400 hover:from-rose-500 hover:to-purple-500"
              >
                {syncing ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Sync Now
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={disconnectGoogleFit}
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
          <div className="p-2 rounded-lg bg-blue-500 text-white">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <CardTitle>Google Fit</CardTitle>
            <CardDescription>Sleep, heart rate, activity tracking</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Connect your Google Fit account to automatically sync sleep quality, heart rate, steps, and activity data.
        </p>
        
        <div className="space-y-3 mb-4">
          <div className="text-sm">
            <strong>Data we'll access:</strong>
          </div>
          <ul className="text-sm text-muted-foreground space-y-1 ml-4">
            <li>• Sleep duration and quality</li>
            <li>• Heart rate and variability</li>
            <li>• Daily steps and activity levels</li>
            <li>• Workout and exercise data</li>
          </ul>
        </div>
        
        <Button 
          onClick={connectGoogleFit} 
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Connecting...' : 'Connect Google Fit'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default GoogleFitConnect;
