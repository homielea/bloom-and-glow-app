
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  Heart, 
  MessageSquare, 
  Calendar, 
  Star,
  Plus,
  UserPlus,
  CheckCircle,
  Clock,
  Target
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useApp } from '../contexts/AppContext';
import { toast } from 'sonner';

interface MentorProfile {
  id: string;
  user_id: string;
  display_name: string;
  bio: string;
  expertise_areas: string[];
  mentoring_style: string;
  availability: string;
  years_experience: number;
  total_mentees: number;
  rating: number;
  created_at: string;
}

interface MentorshipRequest {
  id: string;
  mentor_id: string;
  mentee_id: string;
  status: 'pending' | 'accepted' | 'declined' | 'active' | 'completed';
  goals: string;
  preferred_frequency: string;
  created_at: string;
  mentor_profile?: MentorProfile;
}

const MentorshipProgram: React.FC = () => {
  const { session } = useApp();
  const [mentors, setMentors] = useState<MentorProfile[]>([]);
  const [myRequests, setMyRequests] = useState<MentorshipRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMentor, setSelectedMentor] = useState<MentorProfile | null>(null);
  const [requestGoals, setRequestGoals] = useState('');
  const [preferredFrequency, setPreferredFrequency] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExpertise, setSelectedExpertise] = useState<string>('all');

  useEffect(() => {
    fetchMentors();
    if (session?.user?.id) {
      fetchMyRequests();
    }
  }, [session?.user?.id]);

  const fetchMentors = async () => {
    try {
      // For demo purposes, we'll create some mock data
      const mockMentors: MentorProfile[] = [
        {
          id: '1',
          user_id: 'user1',
          display_name: 'Sarah Chen',
          bio: 'Wellness coach with 8 years of experience helping people develop sustainable healthy habits. Specializes in stress management and work-life balance.',
          expertise_areas: ['Stress Management', 'Work-Life Balance', 'Mindfulness'],
          mentoring_style: 'Supportive and goal-oriented',
          availability: 'Weekday evenings',
          years_experience: 8,
          total_mentees: 15,
          rating: 4.8,
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          user_id: 'user2',
          display_name: 'Dr. Michael Rodriguez',
          bio: 'Former physician turned health coach. Passionate about helping people overcome chronic health challenges through lifestyle changes.',
          expertise_areas: ['Chronic Disease Management', 'Nutrition', 'Exercise Planning'],
          mentoring_style: 'Evidence-based and compassionate',
          availability: 'Weekend mornings',
          years_experience: 12,
          total_mentees: 28,
          rating: 4.9,
          created_at: new Date().toISOString()
        },
        {
          id: '3',
          user_id: 'user3',
          display_name: 'Lisa Thompson',
          bio: 'Mental health advocate and peer support specialist. Experienced in helping others navigate anxiety, depression, and building resilience.',
          expertise_areas: ['Mental Health', 'Anxiety Management', 'Building Resilience'],
          mentoring_style: 'Empathetic and patient',
          availability: 'Flexible schedule',
          years_experience: 6,
          total_mentees: 22,
          rating: 4.7,
          created_at: new Date().toISOString()
        }
      ];
      
      setMentors(mockMentors);
    } catch (error) {
      console.error('Error fetching mentors:', error);
      toast.error('Failed to load mentors');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyRequests = async () => {
    try {
      // Mock data for demonstration
      const mockRequests: MentorshipRequest[] = [];
      setMyRequests(mockRequests);
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  const sendMentorshipRequest = async () => {
    if (!session?.user || !selectedMentor || !requestGoals.trim() || !preferredFrequency) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      // Simulate sending request
      toast.success('Mentorship request sent! The mentor will be notified and will respond within 48 hours.');
      setSelectedMentor(null);
      setRequestGoals('');
      setPreferredFrequency('');
    } catch (error) {
      console.error('Error sending request:', error);
      toast.error('Failed to send mentorship request');
    }
  };

  const filteredMentors = mentors.filter(mentor => {
    const matchesSearch = mentor.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mentor.bio.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesExpertise = selectedExpertise === 'all' || 
                            mentor.expertise_areas.includes(selectedExpertise);
    return matchesSearch && matchesExpertise;
  });

  const allExpertiseAreas = [...new Set(mentors.flatMap(m => m.expertise_areas))];

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Mentorship Program</h2>
          <p className="text-gray-600">Connect with experienced mentors for personalized guidance</p>
        </div>
        
        <Button variant="outline">
          <UserPlus className="w-4 h-4 mr-2" />
          Become a Mentor
        </Button>
      </div>

      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <Input
            placeholder="Search mentors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>
        <Select value={selectedExpertise} onValueChange={setSelectedExpertise}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by expertise" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Expertise Areas</SelectItem>
            {allExpertiseAreas.map((area) => (
              <SelectItem key={area} value={area}>{area}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Program Benefits */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-0">
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <Heart className="w-8 h-8 mx-auto text-blue-600 mb-2" />
              <h3 className="font-semibold mb-1">Personalized Support</h3>
              <p className="text-sm text-gray-600">Get one-on-one guidance tailored to your unique goals</p>
            </div>
            <div className="text-center">
              <Target className="w-8 h-8 mx-auto text-purple-600 mb-2" />
              <h3 className="font-semibold mb-1">Goal Achievement</h3>
              <p className="text-sm text-gray-600">Stay accountable and motivated with regular check-ins</p>
            </div>
            <div className="text-center">
              <Users className="w-8 h-8 mx-auto text-green-600 mb-2" />
              <h3 className="font-semibold mb-1">Community Connection</h3>
              <p className="text-sm text-gray-600">Build lasting relationships with like-minded individuals</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Mentors */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredMentors.map((mentor) => (
          <Card key={mentor.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarFallback>
                    {mentor.display_name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">{mentor.display_name}</CardTitle>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm text-gray-600">{mentor.rating}</span>
                    <span className="text-sm text-gray-400">• {mentor.total_mentees} mentees</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-3 line-clamp-3">{mentor.bio}</p>
              
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium mb-1">Expertise Areas</h4>
                  <div className="flex flex-wrap gap-1">
                    {mentor.expertise_areas.slice(0, 3).map((area, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {area}
                      </Badge>
                    ))}
                    {mentor.expertise_areas.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{mentor.expertise_areas.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>{mentor.availability}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>{mentor.years_experience} years experience</span>
                </div>
              </div>
              
              <Button 
                className="w-full mt-4"
                onClick={() => setSelectedMentor(mentor)}
                disabled={!session?.user}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Request Mentorship
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Mentorship Request Modal */}
      {selectedMentor && (
        <Dialog open={!!selectedMentor} onOpenChange={() => setSelectedMentor(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Request Mentorship from {selectedMentor.display_name}</DialogTitle>
              <DialogDescription>
                Tell us about your goals and what you hope to achieve with this mentorship.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">What are your main goals?</label>
                <Textarea
                  placeholder="Describe what you'd like to work on, what challenges you're facing, and what success looks like to you..."
                  value={requestGoals}
                  onChange={(e) => setRequestGoals(e.target.value)}
                  rows={4}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Preferred meeting frequency</label>
                <Select value={preferredFrequency} onValueChange={setPreferredFrequency}>
                  <SelectTrigger>
                    <SelectValue placeholder="How often would you like to meet?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="biweekly">Bi-weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="as-needed">As needed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="bg-blue-50 p-3 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-1">About {selectedMentor.display_name}</h4>
                <p className="text-sm text-blue-800 mb-2">{selectedMentor.bio}</p>
                <div className="flex items-center gap-2 text-sm text-blue-700">
                  <span>Mentoring Style: {selectedMentor.mentoring_style}</span>
                </div>
              </div>
              
              <Button 
                onClick={sendMentorshipRequest}
                disabled={!requestGoals.trim() || !preferredFrequency}
                className="w-full"
              >
                Send Mentorship Request
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* My Requests */}
      {session?.user && myRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>My Mentorship Requests</CardTitle>
            <CardDescription>Track your pending and active mentorships</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {myRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{request.mentor_profile?.display_name}</div>
                    <div className="text-sm text-gray-600">{request.goals}</div>
                  </div>
                  <Badge 
                    variant={request.status === 'active' ? 'default' : 'secondary'}
                  >
                    {request.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MentorshipProgram;
