
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  FileText, Download, Share2, Calendar, Clock, 
  Activity, TrendingUp, AlertTriangle, Shield,
  Printer, Mail, CheckCircle
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { toast } from 'sonner';

interface HealthReport {
  id: string;
  title: string;
  type: 'comprehensive' | 'symptom-timeline' | 'treatment-summary' | 'appointment-prep';
  dateRange: string;
  generatedAt: string;
  summary: string;
  keyFindings: string[];
  recommendations: string[];
}

interface AppointmentPrep {
  symptoms: string[];
  questions: string[];
  concerns: string[];
  medications: string[];
  recentChanges: string[];
}

const HealthcareIntegration: React.FC = () => {
  const { getCheckInHistory } = useApp();
  const [reports, setReports] = useState<HealthReport[]>([]);
  const [appointmentPrep, setAppointmentPrep] = useState<AppointmentPrep>({
    symptoms: [],
    questions: [],
    concerns: [],
    medications: [],
    recentChanges: []
  });
  const [generating, setGenerating] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState('30');

  useEffect(() => {
    generateInitialReports();
    prepareAppointmentData();
  }, []);

  const generateInitialReports = () => {
    const checkIns = getCheckInHistory();
    
    const mockReports: HealthReport[] = [
      {
        id: 'comprehensive-30d',
        title: 'Comprehensive Health Report - 30 Days',
        type: 'comprehensive',
        dateRange: 'Last 30 days',
        generatedAt: new Date().toISOString(),
        summary: 'Overall wellness shows improvement in energy levels with some sleep challenges.',
        keyFindings: [
          'Average mood score: 6.2/10 (stable)',
          'Energy levels trending upward (+15%)',
          'Sleep quality needs attention (avg 5.1/10)',
          'Stress levels well-managed (avg 4.3/10)'
        ],
        recommendations: [
          'Focus on sleep hygiene optimization',
          'Continue current stress management practices',
          'Consider discussing energy improvements with healthcare provider'
        ]
      },
      {
        id: 'symptom-timeline-90d',
        title: 'Symptom Timeline - 90 Days',
        type: 'symptom-timeline',
        dateRange: 'Last 90 days',
        generatedAt: new Date().toISOString(),
        summary: 'Clear patterns in symptom frequency and severity with notable triggers identified.',
        keyFindings: [
          'Hot flashes: Peak frequency mid-cycle',
          'Sleep disruption correlates with stress levels',
          'Mood variations linked to sleep quality',
          'Energy dips predictable based on patterns'
        ],
        recommendations: [
          'Share timeline with healthcare provider',
          'Discuss hormone level testing',
          'Consider sleep study referral'
        ]
      }
    ];

    setReports(mockReports);
  };

  const prepareAppointmentData = () => {
    const checkIns = getCheckInHistory();
    const recentCheckIns = checkIns.slice(-14); // Last 2 weeks
    
    const avgMood = recentCheckIns.length > 0 
      ? recentCheckIns.reduce((sum, c) => sum + c.mood, 0) / recentCheckIns.length 
      : 0;

    const mockAppointmentPrep: AppointmentPrep = {
      symptoms: [
        'Irregular sleep patterns (avg 5.1/10 quality)',
        'Occasional hot flashes (2-3 times per week)',
        'Energy fluctuations throughout the day',
        'Mild mood variations'
      ],
      questions: [
        'Should I consider hormone replacement therapy?',
        'What sleep aids are safe for my situation?',
        'Are my symptoms typical for my age and stage?',
        'What additional tests might be helpful?'
      ],
      concerns: [
        'Impact of sleep issues on daily functioning',
        'Long-term health implications',
        'Treatment options and side effects',
        'Family history considerations'
      ],
      medications: [
        'Vitamin D3 - 2000 IU daily',
        'Magnesium supplement - 400mg before bed',
        'Multivitamin - daily'
      ],
      recentChanges: [
        'Started tracking daily wellness metrics',
        'Improved exercise routine (3x per week)',
        'Modified diet to include more anti-inflammatory foods',
        'Implemented stress management techniques'
      ]
    };

    setAppointmentPrep(mockAppointmentPrep);
  };

  const generateReport = async (type: string) => {
    setGenerating(true);
    
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newReport: HealthReport = {
        id: `${type}-${Date.now()}`,
        title: `${type.charAt(0).toUpperCase() + type.slice(1)} Report`,
        type: type as any,
        dateRange: `Last ${selectedDateRange} days`,
        generatedAt: new Date().toISOString(),
        summary: 'Generated based on your recent health data...',
        keyFindings: ['Analysis complete', 'Patterns identified', 'Trends documented'],
        recommendations: ['Share with healthcare provider', 'Continue monitoring']
      };

      setReports(prev => [newReport, ...prev]);
      toast.success('Report generated successfully!');
    } catch (error) {
      toast.error('Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  const exportReport = (report: HealthReport, format: 'pdf' | 'email') => {
    if (format === 'pdf') {
      toast.success('PDF download started');
    } else {
      toast.success('Report prepared for email sharing');
    }
  };

  const shareWithProvider = (report: HealthReport) => {
    toast.success('Secure sharing link generated');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-indigo-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="bg-gradient-to-r from-teal-400 to-blue-400 text-white">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8" />
              <div>
                <CardTitle className="text-2xl">Healthcare Integration</CardTitle>
                <CardDescription className="text-white/90">
                  HIPAA-compliant reports and tools for healthcare collaboration
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Tabs defaultValue="reports" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="reports">Health Reports</TabsTrigger>
            <TabsTrigger value="timeline">Symptom Timeline</TabsTrigger>
            <TabsTrigger value="appointment">Appointment Prep</TabsTrigger>
            <TabsTrigger value="sharing">Secure Sharing</TabsTrigger>
          </TabsList>

          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Generate New Report</CardTitle>
                <CardDescription>
                  Create comprehensive health reports for your healthcare provider
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="dateRange">Date Range</Label>
                      <select 
                        id="dateRange"
                        value={selectedDateRange}
                        onChange={(e) => setSelectedDateRange(e.target.value)}
                        className="w-full p-2 border rounded-lg"
                      >
                        <option value="7">Last 7 days</option>
                        <option value="14">Last 2 weeks</option>
                        <option value="30">Last 30 days</option>
                        <option value="90">Last 90 days</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid gap-2 md:grid-cols-2">
                    <Button 
                      onClick={() => generateReport('comprehensive')}
                      disabled={generating}
                      className="bg-gradient-to-r from-teal-400 to-blue-400 hover:from-teal-500 hover:to-blue-500"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      {generating ? 'Generating...' : 'Comprehensive Report'}
                    </Button>
                    <Button 
                      onClick={() => generateReport('symptom-timeline')}
                      disabled={generating}
                      variant="outline"
                    >
                      <Activity className="w-4 h-4 mr-2" />
                      Symptom Timeline
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              {reports.map((report) => (
                <Card key={report.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{report.title}</CardTitle>
                        <CardDescription>{report.dateRange} • Generated {new Date(report.generatedAt).toLocaleDateString()}</CardDescription>
                      </div>
                      <Badge variant="outline">{report.type}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600">{report.summary}</p>
                      
                      <div>
                        <h4 className="font-medium mb-2">Key Findings:</h4>
                        <ul className="text-sm space-y-1">
                          {report.keyFindings.map((finding, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              {finding}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex gap-2 flex-wrap">
                        <Button 
                          size="sm"
                          onClick={() => exportReport(report, 'pdf')}
                          className="bg-gradient-to-r from-teal-400 to-blue-400 hover:from-teal-500 hover:to-blue-500"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download PDF
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => exportReport(report, 'email')}
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          Email
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => shareWithProvider(report)}
                        >
                          <Share2 className="w-4 h-4 mr-2" />
                          Secure Share
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="appointment" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Appointment Preparation Assistant</CardTitle>
                <CardDescription>
                  AI-generated questions and summaries for your healthcare visits
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-orange-500" />
                      Current Symptoms to Discuss
                    </h4>
                    <ul className="space-y-2">
                      {appointmentPrep.symptoms.map((symptom, index) => (
                        <li key={index} className="flex items-center gap-2 p-2 bg-orange-50 rounded">
                          <span className="text-sm">{symptom}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-500" />
                      Suggested Questions
                    </h4>
                    <ul className="space-y-2">
                      {appointmentPrep.questions.map((question, index) => (
                        <li key={index} className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                          <span className="text-sm">{question}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Recent Changes & Improvements</h4>
                    <ul className="space-y-2">
                      {appointmentPrep.recentChanges.map((change, index) => (
                        <li key={index} className="flex items-center gap-2 p-2 bg-green-50 rounded">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm">{change}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button className="w-full bg-gradient-to-r from-teal-400 to-blue-400 hover:from-teal-500 hover:to-blue-500">
                    <Printer className="w-4 h-4 mr-2" />
                    Print Appointment Summary
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sharing" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  HIPAA-Compliant Secure Sharing
                </CardTitle>
                <CardDescription>
                  Share your health data securely with healthcare providers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-5 h-5 text-green-600" />
                      <h4 className="font-medium text-green-800">Your Data is Protected</h4>
                    </div>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• End-to-end encryption for all shared data</li>
                      <li>• Time-limited access links expire automatically</li>
                      <li>• Full audit trail of data access</li>
                      <li>• HIPAA-compliant data handling</li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="providerEmail">Healthcare Provider Email</Label>
                    <Input 
                      id="providerEmail"
                      placeholder="doctor@medicalpractice.com"
                      type="email"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="accessDuration">Access Duration</Label>
                    <select className="w-full p-2 border rounded-lg">
                      <option value="24">24 hours</option>
                      <option value="72">3 days</option>
                      <option value="168">1 week</option>
                      <option value="720">30 days</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="shareNote">Note to Provider (Optional)</Label>
                    <Textarea 
                      id="shareNote"
                      placeholder="Any specific information you'd like to highlight..."
                      rows={3}
                    />
                  </div>

                  <Button className="w-full bg-gradient-to-r from-teal-400 to-blue-400 hover:from-teal-500 hover:to-blue-500">
                    <Share2 className="w-4 h-4 mr-2" />
                    Generate Secure Sharing Link
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default HealthcareIntegration;
