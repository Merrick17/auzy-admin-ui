import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTags } from "@/hooks/useTags";
import MultipleSelector from "@/components/ui/multi-selector";
import { X } from "lucide-react";
import { User } from "@/types";
import { useUpdateUser } from "@/hooks/useUsers";
import { Switch } from "@/components/ui/switch";
import { useEffect } from "react";
import * as z from "zod";

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
}

export const updateFormSchema = z.object({
  firstName: z.string().min(1, "First name is required").optional(),
  lastName: z.string().min(1, "Last name is required").optional(),
  email: z.string().email("Invalid email address").optional(),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  phoneNumber: z.string().min(1, "Phone number is required").optional(),
  address: z.string().min(1, "Address is required").optional(),
  city: z.string().min(1, "City is required").optional(),
  zipCode: z.string().min(1, "ZIP code is required").optional(),
  profileImage: z.instanceof(File).optional(),
  profilePicture: z.string().nullable().optional(),
  role: z.enum(["patient", "doctor", "admin"]).optional(),
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

 type UpdateUserFormData = z.infer<typeof updateFormSchema>;

export function EditUserDialog({ open, onOpenChange, user }: EditUserDialogProps) {
  const { toast } = useToast();
  const { data: specialtyTags } = useTags(1, 100);
  const updateUser = useUpdateUser();

  const tagOptions = (specialtyTags?.data?.items || []).map(tag => ({
    label: tag.name || '',
    value: tag._id || ''
  }));

  const form = useForm<UpdateUserFormData>({
    resolver: zodResolver(updateFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      address: '',
      city: '',
      zipCode: '',
      role: 'patient',
      description: '',
      about: '',
      education: [],
      experience: [],
      profileImage: undefined,
      profilePicture: null,
      rating: 0,
      reviewsCount: 0,
      isVerified: false,
      tags: []
    }
  });

  useEffect(() => {
    if (user) {
      console.log("User",user); 
      form.reset({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        address: user.address,
        city: user.city,
        zipCode: user.zipCode,
        role: user.role,
        description: user.description || '',
        about: user.about || '',
        education: user.education || [],
        experience: user.experience || [],
        profileImage: undefined,
        profilePicture: user.profilePicture,
        rating: user.rating,
        reviewsCount: user.reviewsCount,
        isVerified: user.isVerified,
        tags: user.tags?.map(tag => tag._id) || []
      });
    }
  }, [user, form]);

  const handleSubmit = async (data: UpdateUserFormData) => {
    if (!user) return;

    try {
      const formData = new FormData();
      
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) {
          if (key === 'profilePicture') {
            return;
          } else if (key === 'profileImage' && value) {
            formData.append('profileImage', value);
          } else if (Array.isArray(value)) {
            if (value.length > 0) {
              if (key === 'education' || key === 'experience') {
                formData.append(key, JSON.stringify(value));
              } else if (key === 'tags') {
                formData.append('tags', JSON.stringify(value));
              }
            }
          } else if (typeof value === 'boolean') {
            formData.append(key, value.toString());
          } else if (value !== null && value !== '') {
            formData.append(key, value.toString());
          }
        }
      });

      await updateUser.mutateAsync({
        id: user._id,
        formData: formData
      });

      onOpenChange(false);
      toast({
        title: "Success",
        description: "User updated successfully",
      });
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message;
      
      if (errorMessage?.includes('email')) {
        form.setError('email', {
          type: 'manual',
          message: errorMessage
        });
      } else if (errorMessage?.includes('phone')) {
        form.setError('phoneNumber', {
          type: 'manual', 
          message: errorMessage
        });
      } else {
        toast({
          title: "Error",
          description: errorMessage || "Failed to update user",
          variant: "destructive",
        });
      }
    }
  };

  const role = form.watch("role");

  const educationFields = useFieldArray({
    control: form.control,
    name: "education"
  });

  const experienceFields = useFieldArray({
    control: form.control,
    name: "experience"
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[90vh] p-0 flex flex-col">
        <DialogHeader className="px-6 py-4">
          <DialogTitle className="text-2xl font-bold text-primary">
            Edit User: {user?.firstName} {user?.lastName}
          </DialogTitle>
        </DialogHeader>
        
        {user ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit, (errors) => {
              console.log('Form errors:', errors);
              toast({
                title: "Validation Error",
                description: "Please check all required fields",
                variant: "destructive"
              });
            })} className="flex-1 overflow-hidden">
              <ScrollArea className="flex-1 h-[calc(90vh-8rem)]">
                <div className="space-y-6 px-6 pb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input {...field} type="email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="zipCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Zip Code <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Role <span className="text-red-500">*</span></FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
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
                  </div>

                  {role === "doctor" && (
                    <div className="space-y-6">
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="about"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>About <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="tags"
                        render={({ field }) => {
                          const values = field.value || [];
                          const mappedValues = values.map(value => {
                            const tag = specialtyTags?.data?.items.find(tag => tag._id === value);
                            return {
                              label: tag?.name || value,
                              value: value
                            };
                          });
                          return (
                            <FormItem>
                              <FormLabel>Specialties <span className="text-red-500">*</span></FormLabel>
                              <FormControl>
                                <MultipleSelector
                                  value={mappedValues}
                                  onChange={(values) => field.onChange(values.map(v => v.value))}
                                  options={tagOptions}
                                  placeholder="Select specialties"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          );
                        }}
                      />

                      <div className="space-y-2">
                        <FormLabel>Education <span className="text-red-500">*</span></FormLabel>
                        {educationFields.fields.map((field, index) => (
                          <div key={field.id} className="flex gap-2 items-start">
                            <FormField
                              control={form.control}
                              name={`education.${index}.institution`}
                              render={({ field }) => (
                                <FormItem className="flex-1">
                                  <FormControl>
                                    <Input {...field} placeholder="Institution" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`education.${index}.degree`}
                              render={({ field }) => (
                                <FormItem className="flex-1">
                                  <FormControl>
                                    <Input {...field} placeholder="Degree" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`education.${index}.year`}
                              render={({ field }) => (
                                <FormItem className="w-32">
                                  <FormControl>
                                    <Input {...field} type="number" placeholder="Year" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              onClick={() => educationFields.remove(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => educationFields.append({
                            institution: '',
                            degree: '',
                            year: new Date().getFullYear()
                          })}
                        >
                          Add Education
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <FormLabel>Experience <span className="text-red-500">*</span></FormLabel>
                        {experienceFields.fields.map((field, index) => (
                          <div key={field.id} className="flex gap-2 items-start">
                            <FormField
                              control={form.control}
                              name={`experience.${index}.hospital`}
                              render={({ field }) => (
                                <FormItem className="flex-1">
                                  <FormControl>
                                    <Input {...field} placeholder="Hospital" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`experience.${index}.position`}
                              render={({ field }) => (
                                <FormItem className="flex-1">
                                  <FormControl>
                                    <Input {...field} placeholder="Position" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`experience.${index}.startYear`}
                              render={({ field }) => (
                                <FormItem className="w-32">
                                  <FormControl>
                                    <Input {...field} type="number" placeholder="Start Year" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`experience.${index}.endYear`}
                              render={({ field }) => (
                                <FormItem className="w-32">
                                  <FormControl>
                                    <Input {...field} type="number" placeholder="End Year" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              onClick={() => experienceFields.remove(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => experienceFields.append({
                            hospital: '',
                            position: '',
                            startYear: new Date().getFullYear(),
                            endYear: new Date().getFullYear(),
                            current: true
                          })}
                        >
                          Add Experience
                        </Button>
                      </div>
                    </div>
                  )}

                  <Button type="submit" className="w-full">
                    Update User
                  </Button>
                </div>
              </ScrollArea>
            </form>
          </Form>
        ) : (
          <div className="p-6 text-center text-muted-foreground">
            No user selected
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}