"use client"

import { Button } from '@/components/ui/button';
import {
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogHeader, 
  DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import { Eye, Pencil, Trash2, UserPlus, Search, X } from 'lucide-react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { User } from '@/types';
import { UserProfileDialog } from '@/components/UserProfileDialog';
import { UserForm } from '@/components/users/UserForm';
import { Pagination } from '@/components/ui/pagination';
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from '@/hooks/useUsers';
import { AddUserDialog } from '@/components/users/AddUserDialog';
import { EditUserDialog } from '@/components/users/EditUserDialog';

// Helper function for profile picture URL
const getProfilePictureUrl = (profilePicture: string | null | undefined) => {
  if (!profilePicture) return '';
  return profilePicture.startsWith('http') ? profilePicture : `${process.env.NEXT_PUBLIC_BASE_URL}/${profilePicture}`;
};

// Role badge variants
const roleBadgeVariants = {
  admin: 'default',
  doctor: 'secondary',
  patient: 'outline'
} as const;

export default function UsersPage() {
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // Hooks
  const { toast } = useToast();
  const { data, isLoading } = useUsers(page, limit);
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  // Filter users based on search term
  const filteredUsers = data?.data?.filter(user => 
    user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Event handlers
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => setSearchTerm('');

  const handleEditClick = (user: User) => {
    setEditingUser(user);
  };

  const handleDeleteClick = (userId: string) => {
    setUserToDelete(userId);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    
    try {
      await deleteUser.mutateAsync(userToDelete);
      toast({
        title: "Success",
        description: "User has been successfully deleted.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUserToDelete(null);
    }
  };

  // Loading state
  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4 p-4 sm:p-8">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-0.5">
          <h2 className="text-2xl font-bold tracking-tight">Users</h2>
          <p className="text-muted-foreground">
            Manage user accounts and permissions
          </p>
        </div>
        <Button 
          className="w-full sm:w-auto flex items-center gap-2"
          onClick={() => setIsAddDialogOpen(true)}
        >
          <UserPlus className="h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={handleSearch}
            className="pl-10 pr-10"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
              onClick={clearSearch}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Users table */}
      <div className="overflow-x-auto">
        <Card className="border-primary/20 min-w-[800px]">
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
              {filteredUsers.map((user) => (
                <TableRow key={user.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarImage 
                          src={getProfilePictureUrl(user.profilePicture)} 
                          alt={`${user.firstName} ${user.lastName}`}
                        />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {user.firstName[0]}{user.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate">{user.firstName} {user.lastName}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          Joined {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[200px]">
                    <p className="truncate">{user.email}</p>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={roleBadgeVariants[user.role]}
                      className="capitalize"
                    >
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.phoneNumber}</TableCell>
                  <TableCell>
                    <div className="flex flex-col sm:flex-row gap-2 justify-end">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            <span className="hidden sm:inline">View</span>
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
                        <span className="hidden sm:inline">Edit</span>
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteClick(user._id)}
                        className="flex items-center gap-1"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="hidden sm:inline">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Pagination */}
      {data?.meta && (
        <div className="flex justify-center">
          <Pagination
            currentPage={data.meta.currentPage}
            totalPages={data.meta.totalPages}
            onPageChange={setPage}
          />
        </div>
      )}

      {/* Delete confirmation dialog */}
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

      {/* Edit user dialog */}
      <EditUserDialog 
        open={!!editingUser}
        onOpenChange={(open) => !open && setEditingUser(null)}
        user={editingUser}
      />

      <AddUserDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen}
      />
    </div>
  );
}