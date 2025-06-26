
export interface Forum {
  id: string;
  title: string;
  description?: string;
  category: 'general' | 'symptoms' | 'treatments' | 'emotional-support' | 'expert-qa';
  created_by?: string;
  created_at: string;
  updated_at: string;
  is_expert_moderated: boolean;
  post_count: number;
  member_count: number;
}

export interface ForumPost {
  id: string;
  forum_id: string;
  user_id?: string;
  title: string;
  content: string;
  is_pinned: boolean;
  is_locked: boolean;
  reply_count: number;
  like_count: number;
  created_at: string;
  updated_at: string;
  author_display_name?: string;
  is_anonymous?: boolean;
}

export interface ForumReply {
  id: string;
  post_id: string;
  user_id?: string;
  content: string;
  parent_reply_id?: string;
  like_count: number;
  is_solution: boolean;
  created_at: string;
  updated_at: string;
  author_display_name?: string;
  replies?: ForumReply[];
}

export interface ExpertProfile {
  id: string;
  user_id: string;
  professional_title: string;
  credentials: string;
  specialization?: string[];
  bio?: string;
  verification_status: 'pending' | 'verified' | 'rejected';
  years_experience?: number;
  created_at: string;
  updated_at: string;
}

export interface SupportGroup {
  id: string;
  name: string;
  description?: string;
  group_type: 'open' | 'closed' | 'private';
  max_members: number;
  current_members: number;
  created_by?: string;
  moderator_ids?: string[];
  created_at: string;
  updated_at: string;
}

export interface GroupMembership {
  id: string;
  group_id: string;
  user_id: string;
  role: 'member' | 'moderator' | 'admin';
  joined_at: string;
}

export interface GroupMessage {
  id: string;
  group_id: string;
  user_id?: string;
  message: string;
  message_type: 'text' | 'image' | 'file';
  reply_to_id?: string;
  created_at: string;
  updated_at: string;
  author_display_name?: string;
  reply_to?: GroupMessage;
}

export interface UserReport {
  id: string;
  reporter_id?: string;
  reported_user_id?: string;
  content_type: 'post' | 'reply' | 'message' | 'user';
  content_id?: string;
  reason: 'harassment' | 'spam' | 'inappropriate' | 'misinformation' | 'other';
  description?: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  created_at: string;
  resolved_at?: string;
  resolved_by?: string;
}
