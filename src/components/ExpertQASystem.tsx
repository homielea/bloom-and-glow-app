
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
  UserCheck, 
  MessageCircle, 
  Crown, 
  Clock, 
  CheckCircle, 
  Star,
  Filter,
  Search,
  Plus
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useApp } from '../contexts/AppContext';
import { ExpertProfile, ForumPost, ForumReply } from '../types/community';
import { toast } from 'sonner';

const ExpertQASystem: React.FC = () => {
  const { session } = useApp();
  const [experts, setExperts] = useState<ExpertProfile[]>([]);
  const [expertQuestions, setExpertQuestions] = useState<ForumPost[]>([]);
  const [selectedExpert, setSelectedExpert] = useState<ExpertProfile | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<ForumPost | null>(null);
  const [questionReplies, setQuestionReplies] = useState<ForumReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [newQuestion, setNewQuestion] = useState('');
  const [newQuestionTitle, setNewQuestionTitle] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchExperts();
    fetchExpertQuestions();
  }, []);

  const fetchExperts = async () => {
    try {
      const { data, error } = await supabase
        .from('expert_profiles')
        .select('*')
        .eq('verification_status', 'verified')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setExperts((data || []) as ExpertProfile[]);
    } catch (error) {
      toast.error('Failed to load experts');
    }
  };

  const fetchExpertQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('forum_posts')
        .select(`
          *,
          profiles!forum_posts_user_id_fkey(community_display_name)
        `)
        .eq('forum_id', 'expert-qa') // Assuming we have an expert Q&A forum
        .order('created_at', { ascending: false });

      if (error) throw error;
      setExpertQuestions((data || []) as ForumPost[]);
    } catch (error) {
      toast.error('Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestionReplies = async (questionId: string) => {
    try {
      const { data, error } = await supabase
        .from('forum_replies')
        .select(`
          *,
          profiles!forum_replies_user_id_fkey(community_display_name),
          expert_profiles!inner(verification_status, professional_title)
        `)
        .eq('post_id', questionId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setQuestionReplies((data || []) as ForumReply[]);
    } catch (error) {
      toast.error('Failed to load replies');
    }
  };

  const askQuestion = async () => {
    if (!session?.user || !newQuestionTitle.trim() || !newQuestion.trim()) return;

    try {
      const { error } = await supabase
        .from('forum_posts')
        .insert({
          forum_id: 'expert-qa',
          user_id: session.user.id,
          title: newQuestionTitle.trim(),
          content: newQuestion.trim()
        });

      if (error) throw error;

      toast.success('Question submitted successfully! Experts will be notified.');
      setNewQuestion('');
      setNewQuestionTitle('');
      fetchExpertQuestions();
    } catch (error) {
      toast.error('Failed to submit question');
    }
  };

  const filteredExperts = experts.filter(expert => {
    const matchesSearch = expert.professional_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expert.bio?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialization = selectedSpecialization === 'all' || 
                                 expert.specialization?.includes(selectedSpecialization);
    return matchesSearch && matchesSpecialization;
  });

  const specializations = [...new Set(experts.flatMap(e => e.specialization || []))];

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Expert Q&A</h2>
          <p className="text-gray-600">Get answers from verified healthcare professionals</p>
        </div>
        
        {session?.user && (
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Ask Expert
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Ask a Question to Our Experts</DialogTitle>
                <DialogDescription>
                  Submit your health-related question and get professional guidance from verified experts.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Question title (e.g., 'Best practices for managing stress')"
                  value={newQuestionTitle}
                  onChange={(e) => setNewQuestionTitle(e.target.value)}
                />
                <Textarea
                  placeholder="Describe your question in detail. Include relevant context about your situation..."
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  rows={6}
                />
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> This is for general health information only. 
                    For urgent medical concerns, please consult your healthcare provider immediately.
                  </p>
                </div>
                <Button 
                  onClick={askQuestion}
                  disabled={!newQuestionTitle.trim() || !newQuestion.trim()}
                  className="w-full"
                >
                  Submit Question
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <Input
            placeholder="Search experts or questions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>
        <Select value={selectedSpecialization} onValueChange={setSelectedSpecialization}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by specialty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Specialties</SelectItem>
            {specializations.map((spec) => (
              <SelectItem key={spec} value={spec}>{spec}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Verified Experts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="w-5 h-5" />
              Verified Experts
            </CardTitle>
            <CardDescription>Healthcare professionals ready to help</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {filteredExperts.map((expert) => (
                <Card 
                  key={expert.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedExpert(expert)}
                >
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback>
                          <UserCheck className="w-6 h-6" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{expert.professional_title}</h4>
                          <Crown className="w-4 h-4 text-yellow-500" />
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{expert.credentials}</p>
                        {expert.specialization && expert.specialization.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {expert.specialization.slice(0, 3).map((spec, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {spec}
                              </Badge>
                            ))}
                            {expert.specialization.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{expert.specialization.length - 3} more
                              </Badge>
                            )}
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Star className="w-3 h-3" />
                          <span>{expert.years_experience} years experience</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Questions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Recent Questions
            </CardTitle>
            <CardDescription>Latest questions from the community</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {expertQuestions.slice(0, 10).map((question) => (
                <Card 
                  key={question.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => {
                    setSelectedQuestion(question);
                    fetchQuestionReplies(question.id);
                  }}
                >
                  <CardContent className="pt-4">
                    <h4 className="font-medium mb-2 line-clamp-2">{question.title}</h4>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(question.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-3 h-3" />
                          {question.reply_count}
                        </span>
                        {question.reply_count > 0 && (
                          <Badge variant="outline" className="text-xs">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Answered
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Expert Profile Modal */}
      {selectedExpert && (
        <Dialog open={!!selectedExpert} onOpenChange={() => setSelectedExpert(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-500" />
                {selectedExpert.professional_title}
              </DialogTitle>
              <DialogDescription>{selectedExpert.credentials}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {selectedExpert.bio && (
                <div>
                  <h4 className="font-semibold mb-2">About</h4>
                  <p className="text-gray-600">{selectedExpert.bio}</p>
                </div>
              )}
              
              {selectedExpert.specialization && selectedExpert.specialization.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Specializations</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedExpert.specialization.map((spec, index) => (
                      <Badge key={index} variant="secondary">{spec}</Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4" />
                  <span>{selectedExpert.years_experience} years experience</span>
                </div>
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verified Professional
                </Badge>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Question Detail Modal */}
      {selectedQuestion && (
        <Dialog open={!!selectedQuestion} onOpenChange={() => setSelectedQuestion(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedQuestion.title}</DialogTitle>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>Asked by {selectedQuestion.author_display_name || 'Anonymous'}</span>
                <span>•</span>
                <span>{new Date(selectedQuestion.created_at).toLocaleDateString()}</span>
              </div>
            </DialogHeader>
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="whitespace-pre-wrap">{selectedQuestion.content}</p>
              </div>
              
              {questionReplies.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Expert Responses ({questionReplies.length})
                  </h4>
                  <div className="space-y-4">
                    {questionReplies.map((reply) => (
                      <Card key={reply.id} className="border-l-4 border-l-blue-500">
                        <CardContent className="pt-4">
                          <div className="flex items-start gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback>
                                <UserCheck className="w-4 h-4" />
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-medium">{reply.author_display_name}</span>
                                <Crown className="w-4 h-4 text-yellow-500" />
                                <Badge className="bg-blue-100 text-blue-800">Expert</Badge>
                                <span className="text-sm text-gray-500">
                                  {new Date(reply.created_at).toLocaleString()}
                                </span>
                              </div>
                              <p className="whitespace-pre-wrap text-gray-700">{reply.content}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
              
              {questionReplies.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No expert responses yet. Our experts will be notified.</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ExpertQASystem;
