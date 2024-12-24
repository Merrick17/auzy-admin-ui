import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userFormSchema } from "./schema";
import type { UserFormData } from "./schema";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTags } from "@/hooks/useTags";
import MultipleSelector from "@/components/ui/multi-selector";
import { X } from "lucide-react";
import { User } from "@/types";
import { useUpdateUser } from "@/hooks/useUsers";

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
}

export function EditUserDialog({ open, onOpenChange, user }: EditUserDialogProps) {
  const { toast } = useToast();
  const { data: specialtyTags } = useTags(1, 100);
  const updateUser = useUpdateUser();

  const form = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      password: '', // Empty for edit form
      phoneNumber: user?.phoneNumber || '',
      address: user?.address || '',
      city: user?.city || '',
      zipCode: user?.zipCode || '',
      role: user?.role || 'patient',
      description: user?.description || '',
      about: user?.about || '',
      specialities: user?.specialities || [],
      education: user?.education || [],
      experience: user?.experience || [],
      profileImage: undefined,
      profilePicture: user?.profilePicture,
      rating: user?.rating || 0,
      reviewsCount: user?.reviewsCount || 0,
      isVerified: user?.isVerified || false,
      fcmToken: user?.fcmToken,
      tags: user?.tags || []
    }
  });

  const role = form.watch("role");

  const educationFields = useFieldArray({
    control: form.control,
    name: "education"
  });

  const experienceFields = useFieldArray({
    control: form.control,
    name: "experience"
  });

  const handleSubmit = async (data: UserFormData) => {
    if (!user) return;

    try {
      const formData = new FormData();
      
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) {
          if (key === 'profileImage' && value instanceof File) {
            formData.append('profileImage', value);
          } else if (Array.isArray(value)) {
            if (value.length > 0) {
              if (key === 'education' || key === 'experience') {
                formData.append(key, JSON.stringify(value));
              } else {
                value.forEach(item => formData.append(`${key}[]`, item));
              }
            }
          } else if (typeof value === 'boolean') {
            formData.append(key, value.toString());
          } else if (value !== null) {
            formData.append(key, value.toString());
          }
        }
      });

      await updateUser.mutateAsync({ id: user.id, data: formData });
      onOpenChange(false);
      toast({
        title: "Success",
        description: "User updated successfully",
        variant: "default",
      });
    } catch (error: any) {
      console.error('Update error:', error);
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to update user",
        variant: "destructive",
      });
    }
  };

  const tagOptions = (specialtyTags?.data?.items || []).map(tag => ({
    label: tag.name,
    value: tag._id
  }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary">
            Edit User
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <ScrollArea className="max-h-[80vh]">
              {/* Form fields - same as AddUserDialog but with defaultValues */}
              {/* ... Copy the form fields from AddUserDialog ... */}
            </ScrollArea>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 