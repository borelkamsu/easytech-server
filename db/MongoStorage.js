// MongoStorage.js
import { MongoClient, ObjectId } from 'mongodb';
import { connectToDatabase } from './mongodb.js';

export class MongoStorage {
  constructor() {
    this.db = null;
    this.collections = {
      users: 'users',
      services: 'services',
      blogPosts: 'blogPosts',
      testimonials: 'testimonials',
      contactSubmissions: 'contactSubmissions',
      newsletterSubscriptions: 'newsletterSubscriptions',
      bookingRequests: 'bookingRequests'
    };
    this.initDatabase();
  }

  async initDatabase() {
    try {
      this.db = await connectToDatabase();
      console.log('MongoDB Storage initialisé');
      await this.initializeData();
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de MongoDB Storage:', error);
    }
  }

  async initializeData() {
    // Check if we have users, if not initialize with sample data
    const userCount = await this.db.collection(this.collections.users).countDocuments();
    
    if (userCount === 0) {
      // Sample user
      await this.db.collection(this.collections.users).insertOne({
        id: 1,
        username: 'admin',
        password: 'admin123',
        email: 'admin@easytech.com',
        createdAt: new Date().toISOString()
      });
      
      // Sample services
      await this.db.collection(this.collections.services).insertMany([
        {
          id: 1,
          title: 'IT Support',
          description: 'Professional IT support for businesses of all sizes. Our team of experts is available 24/7 to help you resolve technical issues quickly and efficiently.',
          priceFrom: 99,
          priceUnit: 'month',
          imageUrl: '/images/it-support.jpg',
          features: ['24/7 Help Desk', 'Remote Support', 'On-site Visits', 'Preventive Maintenance'],
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          title: 'Cloud Solutions',
          description: 'Secure and scalable cloud infrastructure solutions to help your business leverage the power of cloud computing for improved efficiency and reduced costs.',
          priceFrom: 199,
          priceUnit: 'month',
          imageUrl: '/images/cloud-solutions.jpg',
          features: ['Cloud Migration', 'AWS/Azure/GCP', 'Private Cloud', 'Hybrid Solutions'],
          createdAt: new Date().toISOString()
        },
        {
          id: 3,
          title: 'Cybersecurity',
          description: 'Comprehensive cybersecurity services to protect your business from evolving threats. We implement robust security measures to safeguard your valuable data.',
          priceFrom: 299,
          priceUnit: 'month',
          imageUrl: '/images/cybersecurity.jpg',
          features: ['Vulnerability Assessment', 'Penetration Testing', 'Security Audits', 'Incident Response'],
          createdAt: new Date().toISOString()
        }
      ]);
      
      // Sample blog posts
      await this.db.collection(this.collections.blogPosts).insertMany([
        {
          id: 1,
          title: '5 Ways to Improve Your Company\'s IT Infrastructure',
          excerpt: 'Learn how to optimize your IT infrastructure for better performance, security, and cost-efficiency.',
          content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam consectetur, nisl eget eleifend tincidunt, velit urna aliquet elit, nec tempor nisl felis eget mauris. Phasellus at pharetra dolor. Sed dapibus, nisl eget eleifend tincidunt, velit urna aliquet elit, nec tempor nisl felis eget mauris...',
          category: 'Infrastructure',
          authorName: 'Michael Chen',
          authorAvatar: '/images/authors/michael.jpg',
          publishDate: '2023-05-15',
          readTime: '5 min',
          imageUrl: '/images/blog/it-infrastructure.jpg',
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          title: 'The Importance of Regular Security Audits',
          excerpt: 'Regular security audits are essential for identifying vulnerabilities in your systems before they can be exploited.',
          content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam consectetur, nisl eget eleifend tincidunt, velit urna aliquet elit, nec tempor nisl felis eget mauris. Phasellus at pharetra dolor. Sed dapibus, nisl eget eleifend tincidunt, velit urna aliquet elit, nec tempor nisl felis eget mauris...',
          category: 'Security',
          authorName: 'Sarah Johnson',
          authorAvatar: '/images/authors/sarah.jpg',
          publishDate: '2023-06-22',
          readTime: '7 min',
          imageUrl: '/images/blog/security-audit.jpg',
          createdAt: new Date().toISOString()
        },
        {
          id: 3,
          title: 'Cloud Migration: A Step-by-Step Guide',
          excerpt: 'Moving your business to the cloud? Follow our comprehensive guide to ensure a smooth transition.',
          content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam consectetur, nisl eget eleifend tincidunt, velit urna aliquet elit, nec tempor nisl felis eget mauris. Phasellus at pharetra dolor. Sed dapibus, nisl eget eleifend tincidunt, velit urna aliquet elit, nec tempor nisl felis eget mauris...',
          category: 'Cloud',
          authorName: 'David Rodriguez',
          authorAvatar: '/images/authors/david.jpg',
          publishDate: '2023-07-10',
          readTime: '10 min',
          imageUrl: '/images/blog/cloud-migration.jpg',
          createdAt: new Date().toISOString()
        }
      ]);
      
      // Sample testimonials
      await this.db.collection(this.collections.testimonials).insertMany([
        {
          id: 1,
          name: 'Jennifer Lee',
          position: 'CTO, Nexus Innovations',
          content: 'EasyTech has transformed how our business handles IT. Their support team is responsive, knowledgeable, and always goes the extra mile to solve our technical challenges.',
          rating: 5,
          initials: 'JL',
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          name: 'Robert Chen',
          position: 'IT Director, Global Logistics',
          content: 'Since partnering with EasyTech for our cloud migration, we\'ve seen significant improvements in our system performance and a 30% reduction in IT costs.',
          rating: 5,
          initials: 'RC',
          createdAt: new Date().toISOString()
        },
        {
          id: 3,
          name: 'Maria Santos',
          position: 'CEO, Brightwave Solutions',
          content: 'The cybersecurity team at EasyTech identified vulnerabilities we weren\'t even aware of. Their proactive approach has given us peace of mind knowing our data is secure.',
          rating: 5,
          initials: 'MS',
          createdAt: new Date().toISOString()
        }
      ]);
    }
  }

  async getUser(id) {
    return await this.db.collection(this.collections.users).findOne({ id });
  }

  async getUserByUsername(username) {
    return await this.db.collection(this.collections.users).findOne({ username });
  }

  async createUser(userData) {
    const existingUsers = await this.db.collection(this.collections.users).find().toArray();
    const id = existingUsers.length > 0 ? Math.max(...existingUsers.map(user => user.id)) + 1 : 1;
    const createdAt = new Date().toISOString();
    
    const user = { id, ...userData, createdAt };
    await this.db.collection(this.collections.users).insertOne(user);
    
    return user;
  }

  async getAllServices() {
    return await this.db.collection(this.collections.services).find().toArray();
  }

  async getServiceById(id) {
    return await this.db.collection(this.collections.services).findOne({ id });
  }

  async createService(serviceData) {
    const existingServices = await this.db.collection(this.collections.services).find().toArray();
    const id = existingServices.length > 0 ? Math.max(...existingServices.map(service => service.id)) + 1 : 1;
    const createdAt = new Date().toISOString();
    
    const service = { id, ...serviceData, createdAt };
    await this.db.collection(this.collections.services).insertOne(service);
    
    return service;
  }

  async getAllBlogPosts() {
    return await this.db.collection(this.collections.blogPosts).find().toArray();
  }

  async getBlogPostById(id) {
    return await this.db.collection(this.collections.blogPosts).findOne({ id });
  }

  async getRelatedBlogPosts(id) {
    // Get the current blog post
    const blogPost = await this.getBlogPostById(id);
    
    if (!blogPost) {
      return [];
    }
    
    // Find posts in the same category, excluding the current post
    const relatedPosts = await this.db.collection(this.collections.blogPosts)
      .find({ 
        id: { $ne: id },
        category: blogPost.category
      })
      .limit(3)
      .toArray();
    
    return relatedPosts;
  }

  async createBlogPost(blogPostData) {
    const existingPosts = await this.db.collection(this.collections.blogPosts).find().toArray();
    const id = existingPosts.length > 0 ? Math.max(...existingPosts.map(post => post.id)) + 1 : 1;
    const createdAt = new Date().toISOString();
    
    const blogPost = { id, ...blogPostData, createdAt };
    await this.db.collection(this.collections.blogPosts).insertOne(blogPost);
    
    return blogPost;
  }

  async getAllTestimonials() {
    return await this.db.collection(this.collections.testimonials).find().toArray();
  }

  async createTestimonial(testimonialData) {
    const existingTestimonials = await this.db.collection(this.collections.testimonials).find().toArray();
    const id = existingTestimonials.length > 0 ? Math.max(...existingTestimonials.map(testimonial => testimonial.id)) + 1 : 1;
    const createdAt = new Date().toISOString();
    
    const testimonial = { id, ...testimonialData, createdAt };
    await this.db.collection(this.collections.testimonials).insertOne(testimonial);
    
    return testimonial;
  }

  async createContactSubmission(submissionData) {
    const existingSubmissions = await this.db.collection(this.collections.contactSubmissions).find().toArray();
    const id = existingSubmissions.length > 0 ? Math.max(...existingSubmissions.map(submission => submission.id)) + 1 : 1;
    const createdAt = new Date().toISOString();
    
    const submission = { id, ...submissionData, createdAt };
    await this.db.collection(this.collections.contactSubmissions).insertOne(submission);
    
    return submission;
  }

  async getNewsletterSubscriptionByEmail(email) {
    return await this.db.collection(this.collections.newsletterSubscriptions).findOne({ email });
  }

  async createNewsletterSubscription(subscriptionData) {
    const existingSubscriptions = await this.db.collection(this.collections.newsletterSubscriptions).find().toArray();
    const id = existingSubscriptions.length > 0 ? Math.max(...existingSubscriptions.map(subscription => subscription.id)) + 1 : 1;
    const createdAt = new Date().toISOString();
    
    const subscription = { 
      id, 
      ...subscriptionData, 
      active: true, 
      createdAt 
    };
    
    await this.db.collection(this.collections.newsletterSubscriptions).insertOne(subscription);
    
    return subscription;
  }

  async updateNewsletterSubscription(id, data) {
    const subscription = await this.db.collection(this.collections.newsletterSubscriptions).findOne({ id });
    
    if (!subscription) {
      throw new Error('Subscription not found');
    }
    
    const updatedSubscription = {
      ...subscription,
      ...data
    };
    
    await this.db.collection(this.collections.newsletterSubscriptions).updateOne(
      { id },
      { $set: updatedSubscription }
    );
    
    return updatedSubscription;
  }

  async createBookingRequest(bookingData) {
    const existingBookings = await this.db.collection(this.collections.bookingRequests).find().toArray();
    const id = existingBookings.length > 0 ? Math.max(...existingBookings.map(booking => booking.id)) + 1 : 1;
    const createdAt = new Date().toISOString();
    
    const booking = { 
      id, 
      ...bookingData, 
      status: 'pending', 
      createdAt 
    };
    
    await this.db.collection(this.collections.bookingRequests).insertOne(booking);
    
    return booking;
  }

  async getUserBookings(userId) {
    return await this.db.collection(this.collections.bookingRequests)
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();
  }
}

export const mongoStorage = new MongoStorage();
