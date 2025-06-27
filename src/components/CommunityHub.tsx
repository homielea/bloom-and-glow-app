import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  MessageSquare, 
  Users, 
  UserCheck, 
  Search, 
  Plus, 
  Heart, 
  Reply, 
  Flag,
  Lock,
  Pin,
  Crown
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useApp } from '../contexts/AppContext';
import { Forum, ForumPost, ForumReply, SupportGroup, ExpertProfile } from '../types/community';
import { toast } from 'sonner';

const CommunityHub: React.FC = () => {
  const { session } = useApp();
  const [forums, setForums] = useState<Forum[]>([]);
  const [supportGroups, setSupportGroups] = useState<SupportGroup[]>([]);
  const [experts, setExperts] = useState<ExpertProfile[]>([]);
  const [selectedForum, setSelectedForum] = useState<Forum | null>(null);
  const [forumPosts, setForumPosts] = useState<ForumPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  const [postReplies, setPostReplies] = useState<ForumReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newReplyContent, setNewReplyContent] = useState('');

  useEffect(() => {
    fetchCommunityData();
  }, []);

  const fetchCommunityData = async () => {
    try {
      // Fetch forums
      const { data: forumsData, error: forumsError } = await supabase
        .from('forums')
        .select('*')
        .order('created_at', { ascending: false });

      if (forumsError) throw forumsError;
      setForums((forumsData || []) as Forum[]);

      // Fetch support groups
      const { data: groupsData, error: groupsError } = await supabase
        .from('support_groups')
        .select('*')
        .eq('group_type', 'open')
        .order('created_at', { ascending: false });

      if (groupsError) throw groupsError;
      setSupportGroups((groupsData || []) as SupportGroup[]);

      // Fetch verified experts
      const { data: expertsData, error: expertsError } = await supabase
        .from('expert_profiles')
        .select('*')
        .eq('verification_status', 'verified')
        .order('created_at', { ascending: false });

      if (expertsError) throw expertsError;
      setExperts((expertsData || []) as ExpertProfile[]);

    } catch (error) {
      console.error('Error fetching community data:', error);
      toast.error('Failed to load community data');
    } finally {
      setLoading(false);
    }
  };

  const fetchForumPosts = async (forumId: string) => {
    try {
      const { data, error } = await supabase
        .from('forum_posts')
        .select(`
          *,
          profiles!forum_posts_user_id_fkey(community_display_name)
        `)
        .eq('forum_id', forumId)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setForumPosts((data || []) as ForumPost[]);
    } catch (error) {
      console.error('Error fetching forum posts:', error);
      toast.error('Failed to load forum posts');
    }
  };

  const fetchPostReplies = async (postId: string) => {
    try {
      const { data, error } = await supabase
        .from('forum_replies')
        .select(`
          *,
          profiles!forum_replies_user_id_fkey(community_display_name)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setPostReplies((data || []) as ForumReply[]);
    } catch (error) {
      console.error('Error fetching post replies:', error);
      toast.error('Failed to load replies');
    }
  };

  const createPost = async () => {
    if (!session?.user || !selectedForum || !newPostTitle.trim() || !newPostContent.trim()) return;

    try {
      const { error } = await supabase
        .from('forum_posts')
        .insert({
          forum_id: selectedForum.id,
          user_id: session.user.id,
          title: newPostTitle.trim(),
          content: newPostContent.trim()
        });

      if (error) throw error;

      toast.success('Post created successfully!');
      setNewPostTitle('');
      setNewPostContent('');
      fetchForumPosts(selectedForum.id);
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post');
    }
  };

  const createReply = async () => {
    if (!session?.user || !selectedPost || !newReplyContent.trim()) return;

    try {
      const { error } = await supabase
        .from('forum_replies')
        .insert({
          post_id: selectedPost.id,
          user_id: session.user.id,
          content: newReplyContent.trim()
        });

      if (error) throw error;

      toast.success('Reply posted successfully!');
      setNewReplyContent('');
      fetchPostReplies(selectedPost.id);
    } catch (error) {
      console.error('Error creating reply:', error);
      toast.error('Failed to post reply');
    }
  };

  const filteredForums = forums.filter(forum =>
    forum.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    forum.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-indigo-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-indigo-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Community Hub</h1>
            <p className="text-gray-600 mt-2">Connect, share, and support each other on your wellness journey</p>
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Search community..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
            <Button>
              <Search className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <Tabs defaultValue="forums" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="forums">Forums</TabsTrigger>
            <TabsTrigger value="experts">Expert Q&A</TabsTrigger>
            <TabsTrigger value="groups">Support Groups</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>

          <TabsContent value="forums" className="space-y-4">
            {!selectedForum && !selectedPost && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredForums.map((forum) => (
                  <Card 
                    key={forum.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => {
                      setSelectedForum(forum);
                      fetchForumPosts(forum.id);
                    }}
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <MessageSquare className="w-5 h-5" />
                            {forum.title}
                            {forum.is_expert_moderated && (
                              <Crown className="w-4 h-4 text-yellow-500" />
                            )}
                          </CardTitle>
                          <Badge variant="secondary" className="mt-1">
                            {forum.category.replace('-', ' ')}
                          </Badge>
                        </div>
                      </div>
                      <CardDescription>{forum.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>{forum.post_count} posts</span>
                        <span>{forum.member_count} members</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {selectedForum && !selectedPost && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <Button 
                      variant="ghost" 
                      onClick={() => setSelectedForum(null)}
                      className="mb-2"
                    >
                      ← Back to Forums
                    </Button>
                    <h2 className="text-2xl font-bold">{selectedForum.title}</h2>
                    <p className="text-gray-600">{selectedForum.description}</p>
                  </div>
                  
                  {session?.user && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="w-4 h-4 mr-2" />
                          New Post
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Create New Post</DialogTitle>
                          <DialogDescription>
                            Share your thoughts or ask a question in {selectedForum.title}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <Input
                            placeholder="Post title"
                            value={newPostTitle}
                            onChange={(e) => setNewPostTitle(e.target.value)}
                          />
                          <Textarea
                            placeholder="Write your post content..."
                            value={newPostContent}
                            onChange={(e) => setNewPostContent(e.target.value)}
                            rows={4}
                          />
                          <Button 
                            onClick={createPost}
                            disabled={!newPostTitle.trim() || !newPostContent.trim()}
                            className="w-full"
                          >
                            Create Post
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>

                <div className="space-y-3">
                  {forumPosts.map((post) => (
                    <Card 
                      key={post.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => {
                        setSelectedPost(post);
                        fetchPostReplies(post.id);
                      }}
                    >
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <CardTitle className="flex items-center gap-2">
                              {post.is_pinned && <Pin className="w-4 h-4 text-green-500" />}
                              {post.is_locked && <Lock className="w-4 h-4 text-red-500" />}
                              {post.title}
                            </CardTitle>
                            <div className="flex items-center gap-2 mt-2">
                              <Avatar className="w-6 h-6">
                                <AvatarFallback className="text-xs">
                                  {post.author_display_name?.[0] || 'A'}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm text-gray-600">
                                {post.author_display_name || 'Anonymous'}
                              </span>
                              <span className="text-sm text-gray-400">•</span>
                              <span className="text-sm text-gray-400">
                                {new Date(post.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <Reply className="w-4 h-4" />
                                {post.reply_count}
                              </span>
                              <span className="flex items-center gap-1">
                                <Heart className="w-4 h-4" />
                                {post.like_count}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {selectedPost && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Button 
                    variant="ghost" 
                    onClick={() => setSelectedPost(null)}
                    className="mb-2"
                  >
                    ← Back to Posts
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Flag className="w-4 h-4" />
                  </Button>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>{selectedPost.title}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback>
                          {selectedPost.author_display_name?.[0] || 'A'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <span className="font-medium">
                          {selectedPost.author_display_name || 'Anonymous'}
                        </span>
                        <div className="text-sm text-gray-500">
                          {new Date(selectedPost.created_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap">{selectedPost.content}</p>
                    <div className="flex items-center gap-4 mt-4 pt-4 border-t">
                      <Button variant="ghost" size="sm">
                        <Heart className="w-4 h-4 mr-1" />
                        {selectedPost.like_count}
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Reply className="w-4 h-4 mr-1" />
                        Reply
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {session?.user && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Reply to this post</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        placeholder="Write your reply..."
                        value={newReplyContent}
                        onChange={(e) => setNewReplyContent(e.target.value)}
                        rows={3}
                      />
                      <Button 
                        onClick={createReply}
                        disabled={!newReplyContent.trim()}
                        className="mt-3"
                      >
                        Post Reply
                      </Button>
                    </CardContent>
                  </Card>
                )}

                <div className="space-y-3">
                  {postReplies.map((reply) => (
                    <Card key={reply.id}>
                      <CardContent className="pt-4">
                        <div className="flex items-start gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback>
                              {reply.author_display_name?.[0] || 'A'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-medium">
                                {reply.author_display_name || 'Anonymous'}
                              </span>
                              <span className="text-sm text-gray-500">
                                {new Date(reply.created_at).toLocaleString()}
                              </span>
                              {reply.is_solution && (
                                <Badge variant="default" className="bg-green-100 text-green-800">
                                  Solution
                                </Badge>
                              )}
                            </div>
                            <p className="whitespace-pre-wrap">{reply.content}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Button variant="ghost" size="sm">
                                <Heart className="w-3 h-3 mr-1" />
                                {reply.like_count}
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Reply className="w-3 h-3 mr-1" />
                                Reply
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="experts" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {experts.map((expert) => (
                <Card key={expert.id}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback>
                          <UserCheck className="w-6 h-6" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{expert.professional_title}</CardTitle>
                        <Badge variant="default" className="bg-blue-100 text-blue-800">
                          Verified Expert
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-3">{expert.credentials}</p>
                    {expert.bio && (
                      <p className="text-sm mb-3">{expert.bio}</p>
                    )}
                    {expert.specialization && expert.specialization.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {expert.specialization.map((spec, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {spec}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>{expert.years_experience} years experience</span>
                      <Button size="sm">Ask Question</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="groups" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {supportGroups.map((group) => (
                <Card key={group.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Users className="w-5 h-5" />
                          {group.name}
                        </CardTitle>
                        <Badge variant="secondary" className="mt-1">
                          {group.group_type}
                        </Badge>
                      </div>
                    </div>
                    <CardDescription>{group.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{group.current_members} members</span>
                      <Button size="sm">Join Group</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="resources" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Community Guidelines</CardTitle>
                  <CardDescription>
                    Learn about our community standards and how to create a supportive environment
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button>Read Guidelines</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Moderation & Reporting</CardTitle>
                  <CardDescription>
                    Report inappropriate content or behavior to keep our community safe
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button>Report Content</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Become an Expert</CardTitle>
                  <CardDescription>
                    Healthcare professionals can apply to become verified experts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button>Apply Now</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Privacy & Safety</CardTitle>
                  <CardDescription>
                    Learn about anonymous posting and privacy controls
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button>Privacy Settings</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CommunityHub;
