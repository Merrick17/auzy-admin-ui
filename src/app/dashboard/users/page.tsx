"use client"
import { useUsers, useDeleteUser, useCreateUser, useUpdateUser } from '@/hooks/users';
import { useRegister } from '@/hooks/auth';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Eye, Pencil, Trash2, UserPlus, Search } from 'lucide-react';
import Image from 'next/image';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User } from '@/types';

import { Skeleton } from "@/components/ui/skeleton";
import { UserProfileDialog } from '@/components/UserProfileDialog';

// Form schema based on CreateUserDto
const userFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  zipCode: z.string().min(1, "ZIP code is required"),
  profilePicture: z.any().optional(),
  role: z.enum(["patient", "doctor", "admin"]).default("patient"),
  // Doctor specific fields
  speciality: z.string().optional(),
  workAddress: z.string().optional(),
  workPhone: z.string().optional(),
  qualifications: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  biography: z.string().optional()
});

// Add this helper function at the top of the file, after imports
const getProfilePictureUrl = (profilePicture: string | null | undefined) => {
  if (!profilePicture) return '';
  if (profilePicture.startsWith('http://') || profilePicture.startsWith('https://')) {
    return profilePicture;
  }
  return `${process.env.NEXT_PUBLIC_BASE_URL}/${profilePicture}`;
};

export default function UsersPage() {
  const { data: usersData, isLoading } = useUsers();
  const { mutate: deleteUser } = useDeleteUser();
  const { toast } = useToast();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const { mutate: register } = useRegister();
  const form = useForm<z.infer<typeof userFormSchema>>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      role: "patient",
    },
  });

  useEffect(() => {
    if (!dialogOpen) {
      form.reset();
      setEditingUser(null);
    } else if (editingUser) {
      form.reset({
        firstName: editingUser.firstName,
        lastName: editingUser.lastName,
        email: editingUser.email,
        phoneNumber: editingUser.phoneNumber,
        address: editingUser.address,
        city: editingUser.city,
        zipCode: editingUser.zipCode,
        role: editingUser.role,
        speciality: editingUser.speciality,
        workAddress: editingUser.workAddress,
        workPhone: editingUser.workPhone,
        biography: editingUser.biography,
        qualifications: editingUser.qualifications,
        languages: editingUser.languages,
        profilePicture: editingUser.profilePicture
      });
    }
  }, [dialogOpen, editingUser, form]);

  const onSubmit = async (data: z.infer<typeof userFormSchema>) => {
    try {
      const formData = new FormData();
      
      // Add all required fields
      formData.append('firstName', data.firstName);
      formData.append('lastName', data.lastName);
      formData.append('email', data.email);
      formData.append('password', data.password);
      formData.append('phoneNumber', data.phoneNumber);
      formData.append('address', data.address);
      formData.append('city', data.city);
      formData.append('zipCode', data.zipCode);
      formData.append('role', data.role);

      // Add optional fields if they exist
      if (data.speciality) formData.append('speciality', data.speciality);
      if (data.workAddress) formData.append('workAddress', data.workAddress);
      if (data.workPhone) formData.append('workPhone', data.workPhone);
      if (data.biography) formData.append('biography', data.biography);
      if (data.qualifications?.length) {
        data.qualifications.forEach(qual => formData.append('qualifications[]', qual));
      }
      if (data.languages?.length) {
        data.languages.forEach(lang => formData.append('languages[]', lang));
      }

      // Handle profile picture - check if it's a File object
      if (data.profilePicture instanceof File) {
        formData.append('profilePicture', data.profilePicture);
      }

      if (editingUser) {
        await updateUser.mutateAsync({
          id: editingUser.id,
          data: formData,
        });
        toast({
          title: "Success",
          description: "User updated successfully",
        });
      } else {
        await createUser.mutateAsync(formData);
        toast({
          title: "Success",
          description: "User created successfully",
        });
      }
      
      setDialogOpen(false);
      form.reset();
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = (id: string) => {
    deleteUser(id, {
      onSuccess: () => {
        toast({
          title: 'Success',
          description: 'User deleted successfully',
        });
      },
      onError: () => {
        toast({
          title: 'Error',
          description: 'Failed to delete user',
          variant: 'destructive',
        });
      },
    });
  };

  const filteredUsers = usersData?.data.filter(user => 
    user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setDialogOpen(true);
  };

  const handleDeleteClick = (userId: string) => {
    setUserToDelete(userId);
  };

  const handleConfirmDelete = () => {
    if (userToDelete) {
      deleteUser(userToDelete, {
        onSuccess: () => {
          toast({
            title: "User deleted",
            description: "The user has been successfully deleted.",
          });
          setUserToDelete(null);
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: "Failed to delete user. Please try again.",
            variant: "destructive",
          });
        },
      });
    }
  };

  const dialogTitle = editingUser ? "Edit User" : "Add New User";
  const submitButtonText = editingUser ? "Update User" : "Create User";

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-[200px]" />
          <Skeleton className="h-10 w-[150px]" />
        </div>
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                {["Name", "Email", "Role", "Phone", "Actions"].map((header) => (
                  <TableHead key={`header-${header.toLowerCase()}`}>
                    <Skeleton className="h-4 w-[100px]" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array(5).fill(0).map((_, i) => (
                <TableRow key={`skeleton-row-${i}`}>
                  {Array(5).fill(0).map((_, j) => (
                    <TableCell key={`skeleton-cell-${i}-${j}`}>
                      <Skeleton className="h-4 w-[100px]" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary/80 to-primary bg-clip-text text-transparent">
          Users Management
        </h2>
        <p className="text-muted-foreground">Manage and monitor user accounts.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 border-primary/20 focus:border-primary/50"
          />
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 shrink-0">
              <UserPlus className="h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-primary">
                {dialogTitle}
              </DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[80vh]">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4">
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                        name="role"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Role</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
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

                    {form.watch("role") === "doctor" && (
                      <>
                        <FormField
                          control={form.control}
                          name="speciality"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Speciality</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="workAddress"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Work Address</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="workPhone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Work Phone</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={form.control}
                          name="biography"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Biography</FormLabel>
                              <FormControl>
                                <textarea
                                  className="w-full min-h-[100px] px-3 py-2 border rounded-md"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="qualifications"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Qualifications (comma-separated)</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field}
                                  onChange={(e) => field.onChange(e.target.value.split(',').map(s => s.trim()))}
                                  value={field.value?.join(', ') || ''}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="languages"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Languages (comma-separated)</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field}
                                  onChange={(e) => field.onChange(e.target.value.split(',').map(s => s.trim()))}
                                  value={field.value?.join(', ') || ''}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </>
                    )}

                    <FormField
                      control={form.control}
                      name="profilePicture"
                      render={({ field: { onChange, value, ...field } }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Profile Picture</FormLabel>
                          <FormControl>
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  onChange(file);
                                }
                              }}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end space-x-2">
                      <Button type="submit" className="w-full">
                        {submitButtonText}
                      </Button>
                    </div>
                  </div>
                </form>
              </Form>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-primary/20">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b-primary/20">
              <TableHead className="text-primary font-semibold">Name</TableHead>
              <TableHead className="text-primary font-semibold">Email</TableHead>
              <TableHead className="text-primary font-semibold">Role</TableHead>
              <TableHead className="text-primary font-semibold">Phone</TableHead>
              <TableHead className="text-primary font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers?.map((user, id) => (
              <TableRow key={user.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage 
                        src={getProfilePictureUrl(user?.profilePicture)} 
                        alt={`${user?.firstName} ${user?.lastName}`}
                      />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p>{user?.firstName} {user?.lastName}</p>
                      <p className="text-xs text-muted-foreground">
                        Joined {new Date(user?.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge
                    variant={user.role === 'admin' ? 'default' :
                      user.role === 'doctor' ? 'secondary' : 'outline'}
                    className="capitalize"
                  >
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>{user.phoneNumber}</TableCell>
                <TableCell>
                  <div className="flex gap-2 justify-end">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                      </DialogTrigger>
                      <UserProfileDialog user={user} />
                    </Dialog>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditClick(user)}
                      className="flex items-center gap-1"
                    >
                      <Pencil className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteClick(user.id)}
                      className="flex items-center gap-1"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user
              and remove their data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}