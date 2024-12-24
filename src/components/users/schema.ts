import * as z from "zod";

// Update the schema to match DTO structure
export const userFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  zipCode: z.string().min(1, "ZIP code is required"),
  profileImage: z.instanceof(File).optional(),
  profilePicture: z.string().optional(),
  role: z.enum(["patient", "doctor", "admin"]).default("patient"),
  description: z.string().optional(),
  about: z.string().optional(),
  education: z.array(z.object({
    degree: z.string().min(1, "Degree is required"),
    institution: z.string().min(1, "Institution is required"),
    year: z.number()
  })).optional(),
  experience: z.array(z.object({
    position: z.string().min(1, "Position is required"),
    hospital: z.string().min(1, "Hospital is required"),
    startYear: z.number(),
    endYear: z.number().optional(),
    current: z.boolean().default(false)
  })).optional(),
  rating: z.number().min(0).max(5).optional(),
  reviewsCount: z.number().optional(),
  isVerified: z.boolean().optional(),
  fcmToken: z.string().optional(),
  tags: z.array(z.string()).optional()
});

export type UserFormData = z.infer<typeof userFormSchema>; 