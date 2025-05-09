import { z } from "zod";

// User schema
export const insertUserSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6).max(100),
  email: z.string().email().optional(),
});

// Service schema
export const insertServiceSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10),
  priceFrom: z.number().positive(),
  priceUnit: z.string(),
  imageUrl: z.string().url(),
  features: z.array(z.string()).optional(),
});

// Blog post schema
export const insertBlogPostSchema = z.object({
  title: z.string().min(3).max(100),
  excerpt: z.string().min(10).max(200),
  content: z.string().min(50),
  category: z.string(),
  authorName: z.string(),
  authorAvatar: z.string().optional(),
  publishDate: z.date().or(z.string()),
  readTime: z.string(),
  imageUrl: z.string().url(),
});

// Testimonial schema
export const insertTestimonialSchema = z.object({
  name: z.string().min(2).max(100),
  position: z.string().max(100),
  content: z.string().min(10),
  rating: z.number().min(1).max(5),
  initials: z.string().max(5),
});

// Contact form schema
export const insertContactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().optional(),
  service: z.string(),
  message: z.string().min(10),
});

// Newsletter schema
export const insertNewsletterSchema = z.object({
  email: z.string().email(),
});

// Booking schema
export const insertBookingSchema = z.object({
  userId: z.number().int().positive(),
  serviceId: z.number().int().positive(),
  date: z.string(),
  time: z.string(),
  notes: z.string().optional(),
});

// Type definitions for MongoDB models
export const UserModel = {
  username: String,
  password: String, 
  email: String,
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  createdAt: { type: Date, default: Date.now }
};

export const ServiceModel = {
  title: String,
  description: String,
  priceFrom: Number,
  priceUnit: String,
  imageUrl: String,
  features: [String],
  createdAt: { type: Date, default: Date.now }
};

export const BlogPostModel = {
  title: String,
  excerpt: String,
  content: String,
  category: String,
  authorName: String,
  authorAvatar: String,
  publishDate: { type: Date, default: Date.now },
  readTime: String,
  imageUrl: String,
  createdAt: { type: Date, default: Date.now }
};

export const TestimonialModel = {
  name: String,
  position: String,
  content: String,
  rating: Number,
  initials: String,
  createdAt: { type: Date, default: Date.now }
};

export const ContactSubmissionModel = {
  name: String,
  email: String,
  phone: String,
  service: String,
  message: String,
  createdAt: { type: Date, default: Date.now }
};

export const NewsletterSubscriptionModel = {
  email: { type: String, unique: true },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
};

export const BookingRequestModel = {
  userId: { type: Number, required: true },
  serviceId: { type: Number, required: true },
  date: String,
  time: String,
  status: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled'], default: 'pending' },
  notes: String,
  createdAt: { type: Date, default: Date.now }
};