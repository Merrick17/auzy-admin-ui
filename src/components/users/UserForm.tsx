import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userFormSchema, UserFormData } from "./schema";
import { User } from "@/types";
import { PatientForm } from "./forms/PatientForm";
import { DoctorForm } from "./forms/DoctorForm";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

interface UserFormProps {
  user?: User | null;
  onSubmit: (formData: FormData) => Promise<void>;
}

export function UserForm({ user, onSubmit }: UserFormProps) {
  const form = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: user ? {
      ...user,
      password: '',
      doctorFields: user.role === 'doctor' ? {
        description: user.description || '',
        about: user.about || '',
        specialities: user.specialities || [],
        education: user.education || [],
        experience: user.experience || [],
        // ... other doctor fields
      } : undefined
    } : {
      role: 'patient',
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      address: '',
      city: '',
      zipCode: '',
      doctorFields: undefined,
    }
  });

  const role = form.watch("role");

  const handleSubmit = async (data: UserFormData) => {
    console.log('Form data before processing:', data);
    const formData = new FormData();
    
    // Add basic fields
    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'doctorFields' && value !== undefined && value !== '') {
        if (key === 'profileImage' && value instanceof File) {
          formData.append('profileImage', value);
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    // Handle doctor fields
    if (data.role === 'doctor' && data.doctorFields) {
      // Add description and about
      formData.append('description', data.doctorFields.description);
      formData.append('about', data.doctorFields.about);

      // Add specialities as array
      if (data.doctorFields.specialities.length > 0) {
        data.doctorFields.specialities.forEach(speciality => {
          formData.append('specialities[]', speciality);
        });
      }

      // Add education array
      if (data.doctorFields.education.length > 0) {
        formData.append('education', JSON.stringify(data.doctorFields.education));
      }

      // Add experience array
      if (data.doctorFields.experience.length > 0) {
        formData.append('experience', JSON.stringify(data.doctorFields.experience));
      }
    }

    console.log('FormData entries:', Array.from(formData.entries()));

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <ScrollArea className="max-h-[80vh]">
          <div className="space-y-4 p-4">
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="patient">Patient</SelectItem>
                      <SelectItem value="doctor">Doctor</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {role === 'doctor' ? (
              <DoctorForm form={form} />
            ) : (
              <PatientForm form={form} role={role} />
            )}

            <Button type="submit" className="w-full">
              {user ? 'Update User' : 'Create User'}
            </Button>
          </div>
        </ScrollArea>
      </form>
    </Form>
  );
} 