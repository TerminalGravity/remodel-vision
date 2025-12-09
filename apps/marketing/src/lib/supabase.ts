import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase environment variables not configured. Blog and case study content will use mock data.'
  );
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

// Database types for content
export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  featured_image: string;
  published_at: string;
  reading_time: number;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface CaseStudy {
  id: string;
  slug: string;
  title: string;
  client: string;
  industry: string;
  location: string;
  excerpt: string;
  content: string;
  featured_image: string;
  metrics: {
    roi: string;
    roiLabel: string;
    time: string;
    timeLabel: string;
    projects: string;
    projectsLabel: string;
  };
  testimonial: {
    quote: string;
    author: string;
    role: string;
  };
  featured: boolean;
  published_at: string;
  created_at: string;
  updated_at: string;
}

// Content fetching functions
export async function getBlogPosts(options?: {
  featured?: boolean;
  category?: string;
  limit?: number;
}): Promise<BlogPost[]> {
  let query = supabase
    .from('blog_posts')
    .select('*')
    .order('published_at', { ascending: false });

  if (options?.featured !== undefined) {
    query = query.eq('featured', options.featured);
  }

  if (options?.category) {
    query = query.eq('category', options.category);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching blog posts:', error);
    return [];
  }

  return data || [];
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching blog post:', error);
    return null;
  }

  return data;
}

export async function getCaseStudies(options?: {
  featured?: boolean;
  industry?: string;
  limit?: number;
}): Promise<CaseStudy[]> {
  let query = supabase
    .from('case_studies')
    .select('*')
    .order('published_at', { ascending: false });

  if (options?.featured !== undefined) {
    query = query.eq('featured', options.featured);
  }

  if (options?.industry) {
    query = query.eq('industry', options.industry);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching case studies:', error);
    return [];
  }

  return data || [];
}

export async function getCaseStudy(slug: string): Promise<CaseStudy | null> {
  const { data, error } = await supabase
    .from('case_studies')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching case study:', error);
    return null;
  }

  return data;
}

// Newsletter subscription
export async function subscribeToNewsletter(email: string): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('newsletter_subscribers')
    .insert({ email, subscribed_at: new Date().toISOString() });

  if (error) {
    if (error.code === '23505') {
      return { success: false, error: 'This email is already subscribed.' };
    }
    console.error('Error subscribing to newsletter:', error);
    return { success: false, error: 'Failed to subscribe. Please try again.' };
  }

  return { success: true };
}

// Contact form submission
export async function submitContactForm(data: {
  name: string;
  email: string;
  company?: string;
  subject: string;
  message: string;
}): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('contact_submissions')
    .insert({
      ...data,
      submitted_at: new Date().toISOString(),
    });

  if (error) {
    console.error('Error submitting contact form:', error);
    return { success: false, error: 'Failed to submit. Please try again.' };
  }

  return { success: true };
}
