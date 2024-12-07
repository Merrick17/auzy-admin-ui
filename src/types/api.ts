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
  role: 'patient' | 'doctor' | 'admin';
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

export interface Appointment {
  id: string;
  doctorId: User;
  patientId: User;
  appointmentDate: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  meetingId: string;
  meetingStatus: string;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  lastMessage?: Message;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  sender: string;
  receiver: string;
  content: string;
  conversationId: string;
  read: boolean;
  createdAt: string;
} 