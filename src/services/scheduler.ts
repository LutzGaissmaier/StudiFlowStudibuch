/**
 * Advanced Scheduler Service for Social Media Post Management
 * 
 * Features:
 * - Configurable weekly post frequency (3-5 posts per week)
 * - Intelligent scheduling based on optimal posting times
 * - Post timeline management
 * - Recurring content campaigns
 * - Engagement-optimized scheduling
 */

import { mainLogger } from '../core/logger';
import * as cron from 'node-cron';

export interface ScheduledPost {
  id: string;
  contentId: string;
  title: string;
  content: string;
  hashtags: string[];
  imageUrl?: string;
  scheduledFor: Date;
  status: 'scheduled' | 'posted' | 'failed' | 'cancelled';
  priority: 'high' | 'medium' | 'low';
  platform: 'instagram' | 'facebook' | 'twitter';
  campaignId?: string;
  createdAt: Date;
  postedAt?: Date;
  engagement?: {
    likes: number;
    comments: number;
    shares: number;
    reach: number;
  };
}

export interface PostingScheduleConfig {
  postsPerWeek: number; // 3-5 posts per week
  preferredTimes: string[]; // ['09:00', '15:00', '19:00']
  excludeDays: string[]; // ['sunday']
  timezone: string;
  autoApprove: boolean;
  minHoursBetweenPosts: number;
}

export interface WeeklyCalendar {
  monday: ScheduledPost[];
  tuesday: ScheduledPost[];
  wednesday: ScheduledPost[];
  thursday: ScheduledPost[];
  friday: ScheduledPost[];
  saturday: ScheduledPost[];
  sunday: ScheduledPost[];
}

export class SchedulerService {
  private isInitialized = false;
  private scheduledPosts: ScheduledPost[] = [];
  private scheduleConfig: PostingScheduleConfig;
  private cronJobs: Map<string, cron.ScheduledTask> = new Map();

  constructor() {
    this.scheduleConfig = {
      postsPerWeek: 4,
      preferredTimes: ['09:00', '15:00', '19:00'],
      excludeDays: [],
      timezone: 'Europe/Berlin',
      autoApprove: false,
      minHoursBetweenPosts: 4
    };
  }

  async initialize(): Promise<void> {
    mainLogger.info('⏰ Advanced Scheduler service initializing...');
    
    // Initialize scheduled posts from storage
    await this.loadScheduledPosts();
    
    // Setup cron jobs for checking and posting
    this.setupCronJobs();
    
    this.isInitialized = true;
    mainLogger.info('✅ Advanced Scheduler service initialized');
    mainLogger.info(`📅 Current schedule: ${this.scheduleConfig.postsPerWeek} posts/week`);
  }

  async shutdown(): Promise<void> {
    mainLogger.info('⏰ Scheduler service shutting down...');
    
    // Stop all cron jobs
    this.cronJobs.forEach(job => job.stop());
    this.cronJobs.clear();
    
    this.isInitialized = false;
    mainLogger.info('✅ Scheduler service shutdown');
  }

  async isHealthy(): Promise<boolean> {
    return this.isInitialized;
  }

  /**
   * Schedule a new post
   */
  async schedulePost(post: Omit<ScheduledPost, 'id' | 'createdAt' | 'status'>): Promise<string> {
    const scheduledPost: ScheduledPost = {
      ...post,
      id: this.generatePostId(),
      status: 'scheduled',
      createdAt: new Date()
    };

    this.scheduledPosts.push(scheduledPost);
    await this.saveScheduledPosts();

    mainLogger.info(`📅 Post scheduled: ${scheduledPost.title} for ${scheduledPost.scheduledFor}`);
    return scheduledPost.id;
  }

  /**
   * Get weekly calendar view
   */
  getWeeklyCalendar(weekStart?: Date): WeeklyCalendar {
    const start = weekStart || this.getWeekStart(new Date());
    const calendar: WeeklyCalendar = {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: []
    };

    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

    this.scheduledPosts
      .filter(post => {
        const postDate = new Date(post.scheduledFor);
        const weekEnd = new Date(start);
        weekEnd.setDate(weekEnd.getDate() + 7);
        return postDate >= start && postDate < weekEnd;
      })
      .forEach(post => {
        const dayOfWeek = days[new Date(post.scheduledFor).getDay()];
        calendar[dayOfWeek as keyof WeeklyCalendar].push(post);
      });

    // Sort posts by time for each day
    Object.keys(calendar).forEach(day => {
      calendar[day as keyof WeeklyCalendar].sort((a, b) => 
        new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime()
      );
    });

    return calendar;
  }

  /**
   * Update posting frequency configuration
   */
  updatePostingFrequency(config: Partial<PostingScheduleConfig>): void {
    this.scheduleConfig = { ...this.scheduleConfig, ...config };
    mainLogger.info(`📊 Posting frequency updated: ${this.scheduleConfig.postsPerWeek} posts/week`);
  }

  /**
   * Get optimal posting times based on historical engagement
   */
  getOptimalPostingTimes(): string[] {
    // This would analyze historical engagement data in production
    // For now, return configured preferred times
    return this.scheduleConfig.preferredTimes;
  }

  /**
   * Auto-schedule posts for the week based on available content
   */
  async autoScheduleWeek(contentIds: string[]): Promise<ScheduledPost[]> {
    const weekStart = this.getWeekStart(new Date());
    const optimalTimes = this.getOptimalPostingTimes();
    const scheduledPosts: ScheduledPost[] = [];

    const postsToSchedule = Math.min(contentIds.length, this.scheduleConfig.postsPerWeek);
    
    for (let i = 0; i < postsToSchedule; i++) {
      const dayOffset = this.calculateOptimalDay(i, postsToSchedule);
      const timeIndex = i % optimalTimes.length;
      
      const scheduledDate = new Date(weekStart);
      scheduledDate.setDate(scheduledDate.getDate() + dayOffset);
      
      const [hours, minutes] = optimalTimes[timeIndex].split(':').map(Number);
      scheduledDate.setHours(hours, minutes, 0, 0);

      const post: ScheduledPost = {
        id: this.generatePostId(),
        contentId: contentIds[i],
        title: `Auto-scheduled Post ${i + 1}`,
        content: `Content for ${contentIds[i]}`,
        hashtags: [],
        scheduledFor: scheduledDate,
        status: 'scheduled',
        priority: 'medium',
        platform: 'instagram',
        createdAt: new Date()
      };

      scheduledPosts.push(post);
      this.scheduledPosts.push(post);
    }

    await this.saveScheduledPosts();
    mainLogger.info(`🤖 Auto-scheduled ${scheduledPosts.length} posts for the week`);
    
    return scheduledPosts;
  }

  /**
   * Get posts scheduled for today
   */
  getTodaysPosts(): ScheduledPost[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.scheduledPosts.filter(post => {
      const postDate = new Date(post.scheduledFor);
      return postDate >= today && postDate < tomorrow;
    });
  }

  /**
   * Get upcoming posts (next 7 days)
   */
  getUpcomingPosts(): ScheduledPost[] {
    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    return this.scheduledPosts
      .filter(post => {
        const postDate = new Date(post.scheduledFor);
        return postDate >= now && postDate <= nextWeek && post.status === 'scheduled';
      })
      .sort((a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime());
  }

  /**
   * Reschedule a post
   */
  async reschedulePost(postId: string, newDateTime: Date): Promise<boolean> {
    const post = this.scheduledPosts.find(p => p.id === postId);
    if (!post) return false;

    post.scheduledFor = newDateTime;
    await this.saveScheduledPosts();
    
    mainLogger.info(`📅 Post rescheduled: ${post.title} to ${newDateTime}`);
    return true;
  }

  /**
   * Cancel a scheduled post
   */
  async cancelPost(postId: string): Promise<boolean> {
    const post = this.scheduledPosts.find(p => p.id === postId);
    if (!post) return false;

    post.status = 'cancelled';
    await this.saveScheduledPosts();
    
    mainLogger.info(`❌ Post cancelled: ${post.title}`);
    return true;
  }

  /**
   * Get scheduling statistics
   */
  getSchedulingStats() {
    const total = this.scheduledPosts.length;
    const scheduled = this.scheduledPosts.filter(p => p.status === 'scheduled').length;
    const posted = this.scheduledPosts.filter(p => p.status === 'posted').length;
    const failed = this.scheduledPosts.filter(p => p.status === 'failed').length;
    const cancelled = this.scheduledPosts.filter(p => p.status === 'cancelled').length;

    const today = this.getTodaysPosts().length;
    const upcoming = this.getUpcomingPosts().length;

    return {
      total,
      scheduled,
      posted,
      failed,
      cancelled,
      today,
      upcoming,
      postsPerWeek: this.scheduleConfig.postsPerWeek,
      nextPost: this.getNextScheduledPost()
    };
  }

  private setupCronJobs(): void {
    // Check for posts to publish every minute
    const publishJob = cron.schedule('* * * * *', () => {
      this.checkForPostsToPublish();
    }, { scheduled: false });

    // Weekly auto-scheduling (Sundays at 10:00)
    const autoScheduleJob = cron.schedule('0 10 * * 0', () => {
      this.performWeeklyAutoScheduling();
    }, { scheduled: false });

    publishJob.start();
    autoScheduleJob.start();

    this.cronJobs.set('publish', publishJob);
    this.cronJobs.set('autoSchedule', autoScheduleJob);

    mainLogger.info('⏰ Cron jobs initialized');
  }

  private async checkForPostsToPublish(): Promise<void> {
    const now = new Date();
    const postsToPublish = this.scheduledPosts.filter(post => 
      post.status === 'scheduled' && 
      new Date(post.scheduledFor) <= now
    );

    for (const post of postsToPublish) {
      try {
        await this.publishPost(post);
      } catch (error) {
        mainLogger.error(`Failed to publish post ${post.id}: ${error}`);
        post.status = 'failed';
      }
    }

    if (postsToPublish.length > 0) {
      await this.saveScheduledPosts();
    }
  }

  private async publishPost(post: ScheduledPost): Promise<void> {
    // This would integrate with Instagram API in production
    mainLogger.info(`📤 Publishing post: ${post.title}`);
    
    post.status = 'posted';
    post.postedAt = new Date();
    
    // Simulate engagement metrics
    post.engagement = {
      likes: Math.floor(Math.random() * 100) + 50,
      comments: Math.floor(Math.random() * 20) + 5,
      shares: Math.floor(Math.random() * 10) + 2,
      reach: Math.floor(Math.random() * 500) + 200
    };

    mainLogger.info(`✅ Post published successfully: ${post.title}`);
  }

  private async performWeeklyAutoScheduling(): Promise<void> {
    // This would fetch available content from content service
    const mockContentIds = ['content1', 'content2', 'content3', 'content4'];
    await this.autoScheduleWeek(mockContentIds);
  }

  private calculateOptimalDay(postIndex: number, totalPosts: number): number {
    // Distribute posts evenly across the week, avoiding excluded days
    const availableDays = [1, 2, 3, 4, 5, 6, 7].filter(day => 
      !this.scheduleConfig.excludeDays.includes(this.getDayName(day))
    );

    const dayIndex = Math.floor((postIndex * availableDays.length) / totalPosts);
    return availableDays[dayIndex] || 1;
  }

  private getDayName(dayNumber: number): string {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[dayNumber] || 'monday';
  }

  private getWeekStart(date: Date): Date {
    const start = new Date(date);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Monday start
    start.setDate(diff);
    start.setHours(0, 0, 0, 0);
    return start;
  }

  private getNextScheduledPost(): ScheduledPost | null {
    const upcoming = this.getUpcomingPosts();
    return upcoming.length > 0 ? upcoming[0] : null;
  }

  private generatePostId(): string {
    return `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async loadScheduledPosts(): Promise<void> {
    // In production, this would load from database
    this.scheduledPosts = this.generateMockScheduledPosts();
  }

  private async saveScheduledPosts(): Promise<void> {
    // In production, this would save to database
    mainLogger.debug(`💾 Saved ${this.scheduledPosts.length} scheduled posts`);
  }

  private generateMockScheduledPosts(): ScheduledPost[] {
    const posts: ScheduledPost[] = [];
    const now = new Date();

    // Generate some upcoming posts
    for (let i = 0; i < 12; i++) {
      const scheduledDate = new Date(now);
      scheduledDate.setDate(now.getDate() + i);
      scheduledDate.setHours(9 + (i % 3) * 5, 0, 0, 0);

      posts.push({
        id: `mock_post_${i}`,
        contentId: `content_${i}`,
        title: `StudiBuch Post ${i + 1}`,
        content: `Motivierender Content für Studenten #${i + 1}`,
        hashtags: ['#studium', '#motivation', '#lernen', '#studibuch'],
        scheduledFor: scheduledDate,
        status: i < 3 ? 'posted' : 'scheduled',
        priority: i % 3 === 0 ? 'high' : 'medium',
        platform: 'instagram',
        createdAt: new Date(now.getTime() - (12 - i) * 24 * 60 * 60 * 1000),
        postedAt: i < 3 ? new Date(scheduledDate.getTime() - 10000) : undefined,
        engagement: i < 3 ? {
          likes: Math.floor(Math.random() * 150) + 50,
          comments: Math.floor(Math.random() * 25) + 5,
          shares: Math.floor(Math.random() * 15) + 2,
          reach: Math.floor(Math.random() * 800) + 300
        } : undefined
      });
    }

    return posts;
  }
}  