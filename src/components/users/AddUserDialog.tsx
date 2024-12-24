import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userFormSchema } from "./schema";
import type { UserFormData } from "./schema";
import { useRegister } from "@/hooks/auth";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTags } from "@/hooks/useTags";
import MultipleSelector from "@/components/ui/multi-selector";
import { X } from "lucide-react";
import { useEffect } from "react";
import { Switch } from "@/components/ui/switch";

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddUserDialog({ open, onOpenChange }: AddUserDialogProps) {
  const { mutateAsync: register } = useRegister();
  const { toast } = useToast();
  const { data: specialtyTags } = useTags(1, 100);

  const form = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      phoneNumber: '',
      address: '',
      city: '',
      zipCode: '',
      role: 'patient',
      description: '',
      about: '',
      tags: [],
      education: [],
      experience: [],
      profilePicture: '',
      rating: 0,
      reviewsCount: 0,
      isVerified: false,
      fcmToken: undefined
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
    try {
      const formData = new FormData();
      
      // Add all fields to formData
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) {
          if (key === 'profilePicture') {
            // Skip adding profilePicture here since it's handled separately
            return;
          } else if (Array.isArray(value)) {
            // Handle arrays (tags, education, experience)
            if (value.length > 0) {
              if (key === 'education' || key === 'experience') {
                formData.append(key, JSON.stringify(value));
              } else if (key === 'tags') {
                // Handle tags array
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

      // Get the file input element
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = fileInput?.files?.[0];
      
      // Add the file to formData if it exists
      if (file) {
        formData.append('profilePicture', file);
      }

      // Log the FormData entries for debugging
      console.log('Form Data entries:', Array.from(formData.entries()));

      // Make sure to await the registration
      await register(formData);
      
      onOpenChange(false);
      toast({
        title: "Success",
        description: "User created successfully",
        variant: "default",
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to create user",
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary">
            Add New User
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="flex-1 overflow-hidden">
            <ScrollArea className="h-[calc(90vh-8rem)] px-4">
              <div className="space-y-4 pb-8">
                {/* Role Selection */}
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
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

                {/* Basic Information */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
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
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Address Information */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
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
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
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
                        <FormLabel>ZIP Code</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Profile Image */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="profilePicture"
                    render={({ field: { value, onChange, ...field } }) => (
                      <FormItem>
                        <FormLabel>Profile Image</FormLabel>
                        <FormControl>
                          <Input 
                            type="file" 
                            accept="image/*"
                            {...field}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                // Only store the file name in the form state
                                onChange(file.name);
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="isVerified"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Verified User</FormLabel>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Doctor Specific Fields */}
                {role === 'doctor' && (
                  <div className="space-y-4 border-t pt-4">
                    {/* Doctor Basic Info */}
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Input {...field} value={field.value || ''} />
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
                            <FormLabel>About</FormLabel>
                            <FormControl>
                              <Input {...field} value={field.value || ''} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Tags */}
                    <FormField
                      control={form.control}
                      name="tags"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Specialties</FormLabel>
                          <FormControl>
                            <MultipleSelector
                              defaultOptions={tagOptions}
                              placeholder="Select specialties..."
                              value={tagOptions.filter(opt => (field.value || []).includes(opt.value))}
                              onChange={(selected) => {
                                field.onChange(selected.map(item => item.value));
                              }}
                              emptyIndicator={
                                <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
                                  No specialties found.
                                </p>
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Education */}
                    <div className="space-y-2">
                      <FormLabel>Education</FormLabel>
                      {educationFields.fields.map((field, index) => (
                        <div key={field.id} className="flex gap-2 items-start">
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
                          degree: '',
                          institution: '',
                          year: new Date().getFullYear()
                        })}
                      >
                        Add Education
                      </Button>
                    </div>

                    {/* Experience */}
                    <div className="space-y-2">
                      <FormLabel>Experience</FormLabel>
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
                  Create User
                </Button>
              </div>
            </ScrollArea>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}