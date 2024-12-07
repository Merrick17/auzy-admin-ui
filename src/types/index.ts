// Base types
export type Role = 'patient' | 'doctor' | 'admin';
export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
export type PostStatus = 'draft' | 'published';
export type PaymentStatus = 'pending' | 'completed' | 'failed';

// User related types
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string;
  city: string;
  zipCode: string;
  profilePicture?: string;
  role: Role;
  description?: string;
  specialities?: string[];
  about?: string;
  education?: Education[];
  experience?: Experience[];
  rating?: number;
  reviewsCount?: number;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Education {
  degree: string;
  institution: string;
  year: number;
}

export interface Experience {
  position: string;
  hospital: string;
  startYear: number;
  endYear?: number;
  current: boolean;
}

// Appointment related types
export interface Appointment {
  id: string;
  doctorId: User;
  patientId: User;
  appointmentDate: string;
  status: AppointmentStatus;
  meetingId?: string;
  meetingStatus?: string;
  createdAt: string;
  updatedAt: string;
}

// Post related types
export interface Post {
  id: string;
  title: string;
  description: string;
  content: string;
  image?: string;
  additionalImages?: string[];
  tags?: string[];
  status: PostStatus;
  isPublished: boolean;
  authorId: User;
  createdAt: string;
  updatedAt: string;
}

// Payment related types
export interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  appointmentId?: string;
  userId: string;
  paymentMethod: string;
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
}

// DTOs
export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto extends Omit<User, 'id' | 'createdAt' | 'updatedAt'> {
  password: string;
}

export interface CreateAppointmentDto {
  doctorId: string;
  appointmentDate: string;
}

export interface CreatePostDto {
  title: string;
  description: string;
  content: string;
  image?: File;
  additionalImages?: File[];
  tags?: string[];
  isPublished?: boolean;
  status?: PostStatus;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    token: string;
    user: User;
  };
  message: string;
} 