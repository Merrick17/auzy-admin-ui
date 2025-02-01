"use client"

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Badge } from '@/components/ui/badge';
import { useTags, useCreateTag } from '@/hooks/useTags';
import { Pagination } from '@/components/ui/pagination';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface Tag {
  _id: string;
  name: string;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface CreateTagDto {
  name: string;
}

interface TagsResponse {
  success: boolean;
  data: {
    items: Tag[];
    meta: {
      totalItems: number;
      itemsPerPage: string;
      totalPages: number;
      currentPage: string;
    };
  };
  message: string;
}

export default function TagsPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [newTag, setNewTag] = useState<CreateTagDto>({
    name: '',
  });
  
  const { toast } = useToast();
  const { data: tagsResponse, isLoading, error } = useTags(page);
  const createTag = useCreateTag();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTag.name.trim()) {
      toast({
        title: "Error",
        description: "Tag name is required",
        variant: "destructive",
      });
      return;
    }

    createTag.mutate(newTag, {
      onSuccess: () => {
        setIsOpen(false);
        setNewTag({ name: '' });
        toast({
          title: "Success",
          description: "Tag created successfully",
        });
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to create tag",
          variant: "destructive",
        });
      },
    });
  };

  // Determine tag type based on name
  const getTagType = (name: string): 'specialty' | 'language' | 'service' | 'general' => {
    const specialties = ['Pediatrics', 'Cardiology', 'Orthopedics', 'Dermatology'];
    const languages = ['Spanish', 'English'];
    const services = ['Home Visit', 'Emergency Care', 'Video Consultation', 'Lab Tests'];

    if (specialties.includes(name)) return 'specialty';
    if (languages.includes(name)) return 'language';
    if (services.includes(name)) return 'service';
    return 'general';
  };

  const getTagTypeColor = (name: string) => {
    const type = getTagType(name);
    switch (type) {
      case 'specialty':
        return 'bg-blue-500 text-white';
      case 'language':
        return 'bg-green-500 text-white';
      case 'service':
        return 'bg-purple-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] gap-4">
        <p className="text-destructive font-medium">Failed to load tags</p>
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          className="gap-2"
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Tags Management</CardTitle>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>Create New Tag</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Tag</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Input
                    placeholder="Tag name"
                    value={newTag.name}
                    onChange={(e) => setNewTag({ name: e.target.value })}
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={createTag.isPending}
                >
                  {createTag.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Tag'
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Usage Count</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Updated At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // Show loading skeleton
                Array(5).fill(0).map((_, i) => (
                  <TableRow key={`skeleton-${i.toString()}`}>
                    <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  </TableRow>
                ))
              ) : tagsResponse?.data.items.length === 0 ? (
                // Show empty state
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <p className="text-muted-foreground">No tags found</p>
                  </TableCell>
                </TableRow>
              ) : (
                // Show tags data
                tagsResponse?.data.items.map((tag, ind) => (
                  <TableRow key={ind.toString()}>
                    <TableCell className="font-medium">{tag.name}</TableCell>
                    <TableCell>
                      <Badge className={getTagTypeColor(tag.name)}>
                        {getTagType(tag.name)}
                      </Badge>
                    </TableCell>
                    <TableCell>{tag.usageCount}</TableCell>
                    <TableCell>
                      {format(new Date(tag.createdAt), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      {format(new Date(tag.updatedAt), 'MMM dd, yyyy')}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {tagsResponse?.data.meta && (
            <div className="mt-4 flex justify-center">
              <Pagination
                currentPage={Number(tagsResponse.data.meta.currentPage)}
                totalPages={Number(tagsResponse.data.meta.totalPages)}
                onPageChange={setPage}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}