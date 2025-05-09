import express from "express";
import { createServer } from "http";
import { storage } from "./storage.js";
import { z } from "zod";
import { 
  insertUserSchema, 
  insertServiceSchema, 
  insertBlogPostSchema, 
  insertTestimonialSchema, 
  insertContactSchema, 
  insertNewsletterSchema, 
  insertBookingSchema
} from "../shared/schema.js";

import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import MemoryStore from "memorystore";

export async function registerRoutes(app) {
  // Initialize session storage
  const SessionStore = MemoryStore(session);
  
  // Session configuration
  app.use(session({
    secret: process.env.SESSION_SECRET || 'easytech-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { 
      secure: process.env.NODE_ENV === 'production', 
      maxAge: 1000 * 60 * 60 * 24 // 24 hours
    },
    store: new SessionStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    })
  }));
  
  // Initialize Passport
  app.use(passport.initialize());
  app.use(passport.session());
  
  // Configure Local Strategy for Passport
  passport.use(new LocalStrategy(
    async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        
        if (!user) {
          return done(null, false, { message: 'Incorrect username.' });
        }
        
        // In a real app, you would compare hashed passwords
        // For simplicity, we're doing a direct comparison here
        if (user.password !== password) {
          return done(null, false, { message: 'Incorrect password.' });
        }
        
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  ));
  
  // Serialize user for session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  
  // Deserialize user from session
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
  
  // Middleware to check if user is authenticated
  const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: 'Unauthorized' });
  };
  
  // Authentication routes
  
  // Register a new user
  app.post('/api/register', async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: 'Username already exists' });
      }
      
      // Create new user
      const user = await storage.createUser(userData);
      
      // Strip password from response
      const { password, ...userWithoutPassword } = user;
      
      return res.status(201).json({
        message: 'User registered successfully',
        user: userWithoutPassword
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: 'Validation error',
          errors: error.errors 
        });
      }
      return res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  // Login
  app.post('/api/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ message: info.message || 'Authentication failed' });
      }
      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        // Strip password from response
        const { password, ...userWithoutPassword } = user;
        return res.json({ 
          message: 'Login successful',
          user: userWithoutPassword
        });
      });
    })(req, res, next);
  });
  
  // Logout
  app.post('/api/logout', (req, res) => {
    req.logout(() => {
      res.json({ message: 'Logged out successfully' });
    });
  });
  
  // Get current user
  app.get('/api/user', isAuthenticated, (req, res) => {
    const { password, ...userWithoutPassword } = req.user;
    res.json({ user: userWithoutPassword });
  });
  
  // Services routes
  
  // Get all services
  app.get('/api/services', async (req, res) => {
    try {
      const services = await storage.getAllServices();
      res.json(services);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching services' });
    }
  });
  
  // Get service by ID
  app.get('/api/services/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid ID format' });
      }
      
      const service = await storage.getServiceById(id);
      
      if (!service) {
        return res.status(404).json({ message: 'Service not found' });
      }
      
      res.json(service);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching service' });
    }
  });
  
  // Create new service (admin only)
  app.post('/api/services', isAuthenticated, async (req, res) => {
    try {
      // Check if user is admin (in a real app)
      // if (req.user.role !== 'admin') {
      //   return res.status(403).json({ message: 'Forbidden' });
      // }
      
      const serviceData = insertServiceSchema.parse(req.body);
      const service = await storage.createService(serviceData);
      
      res.status(201).json({
        message: 'Service created successfully',
        service
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: 'Validation error',
          errors: error.errors 
        });
      }
      res.status(500).json({ message: 'Error creating service' });
    }
  });
  
  // Blog post routes
  
  // Get all blog posts
  app.get('/api/blog-posts', async (req, res) => {
    try {
      const blogPosts = await storage.getAllBlogPosts();
      res.json(blogPosts);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching blog posts' });
    }
  });
  
  // Get blog post by ID
  app.get('/api/blog-posts/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid ID format' });
      }
      
      const blogPost = await storage.getBlogPostById(id);
      
      if (!blogPost) {
        return res.status(404).json({ message: 'Blog post not found' });
      }
      
      res.json(blogPost);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching blog post' });
    }
  });
  
  // Get related blog posts
  app.get('/api/blog-posts/related/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid ID format' });
      }
      
      const relatedPosts = await storage.getRelatedBlogPosts(id);
      res.json(relatedPosts);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching related blog posts' });
    }
  });
  
  // Create new blog post (admin only)
  app.post('/api/blog-posts', isAuthenticated, async (req, res) => {
    try {
      // Check if user is admin (in a real app)
      // if (req.user.role !== 'admin') {
      //   return res.status(403).json({ message: 'Forbidden' });
      // }
      
      const blogPostData = insertBlogPostSchema.parse(req.body);
      const blogPost = await storage.createBlogPost(blogPostData);
      
      res.status(201).json({
        message: 'Blog post created successfully',
        blogPost
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: 'Validation error',
          errors: error.errors 
        });
      }
      res.status(500).json({ message: 'Error creating blog post' });
    }
  });
  
  // Testimonial routes
  
  // Get all testimonials
  app.get('/api/testimonials', async (req, res) => {
    try {
      const testimonials = await storage.getAllTestimonials();
      res.json(testimonials);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching testimonials' });
    }
  });
  
  // Create new testimonial (admin only)
  app.post('/api/testimonials', isAuthenticated, async (req, res) => {
    try {
      // Check if user is admin (in a real app)
      // if (req.user.role !== 'admin') {
      //   return res.status(403).json({ message: 'Forbidden' });
      // }
      
      const testimonialData = insertTestimonialSchema.parse(req.body);
      const testimonial = await storage.createTestimonial(testimonialData);
      
      res.status(201).json({
        message: 'Testimonial created successfully',
        testimonial
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: 'Validation error',
          errors: error.errors 
        });
      }
      res.status(500).json({ message: 'Error creating testimonial' });
    }
  });
  
  // Contact form submission
  app.post('/api/contact', async (req, res) => {
    try {
      const contactData = insertContactSchema.parse(req.body);
      const submission = await storage.createContactSubmission(contactData);
      
      res.status(201).json({
        message: 'Contact form submitted successfully',
        submission
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: 'Validation error',
          errors: error.errors 
        });
      }
      res.status(500).json({ message: 'Error submitting contact form' });
    }
  });
  
  // Newsletter subscription
  app.post('/api/newsletter-subscribe', async (req, res) => {
    try {
      const emailSchema = z.object({
        email: z.string().email({ message: 'Invalid email address' })
      });
      
      const { email } = emailSchema.parse(req.body);
      
      // Check if email already exists
      const existingSubscription = await storage.getNewsletterSubscriptionByEmail(email);
      
      if (existingSubscription) {
        if (existingSubscription.active) {
          return res.status(400).json({ message: 'Email already subscribed' });
        } else {
          // Reactivate subscription
          await storage.updateNewsletterSubscription(existingSubscription.id, { active: true });
          return res.status(200).json({ message: 'Subscription reactivated successfully' });
        }
      }
      
      const subscription = await storage.createNewsletterSubscription({ email });
      
      res.status(201).json({
        message: 'Subscribed to newsletter successfully',
        subscription
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: 'Validation error',
          errors: error.errors 
        });
      }
      res.status(500).json({ message: 'Error subscribing to newsletter' });
    }
  });
  
  // Booking routes
  
  // Create a booking request
  app.post('/api/bookings', isAuthenticated, async (req, res) => {
    try {
      const bookingData = insertBookingSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      const booking = await storage.createBookingRequest(bookingData);
      
      res.status(201).json({
        message: 'Booking request submitted successfully',
        booking
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: 'Validation error',
          errors: error.errors 
        });
      }
      res.status(500).json({ message: 'Error creating booking request' });
    }
  });
  
  // Get user's bookings
  app.get('/api/bookings', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const bookings = await storage.getUserBookings(userId);
      
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching bookings' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}