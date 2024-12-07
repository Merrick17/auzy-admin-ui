"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreatePost, useUpdatePost } from "@/hooks/usePosts";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import MDEditor from '@uiw/react-md-editor';
import { CreatePostDto } from "@/types";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

const postFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  content: z.string().min(1, "Content is required"),
  image: z.instanceof(File).optional(),
  additionalImages: z.array(z.instanceof(File)).optional(),
  tags: z.array(z.string()).optional(),
  isPublished: z.boolean().default(true),
  status: z.enum(["draft", "published"]).default("draft"),
});

type PostFormValues = z.infer<typeof postFormSchema>;

interface CreatePostFormProps {
  onSuccess: () => void;
  initialData?: Post;
}

export function CreatePostForm({ onSuccess, initialData }: CreatePostFormProps) {
  const { toast } = useToast();
  const createPost = useCreatePost();
  const updatePost = useUpdatePost();

  const form = useForm<PostFormValues>({
    resolver: zodResolver(postFormSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      content: initialData?.content || "",
      tags: initialData?.tags || [],
      isPublished: initialData?.isPublished ?? true,
      status: initialData?.status || "draft",
    },
  });

  const onSubmit = async (data: PostFormValues) => {
    try {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("content", data.content);
      
      if (data.image) {
        formData.append("files", data.image); // First file is main image
      }
      
      if (data.additionalImages?.length) {
        data.additionalImages.forEach(file => {
          formData.append("files", file); // Additional images
        });
      }
      
      if (data.tags?.length) {
        formData.append("tags", data.tags.join(",")); // API expects comma-separated tags
      }
      
      formData.append("isPublished", String(data.isPublished));
      formData.append("status", data.status);

      await createPost.mutateAsync(formData);
      toast({
        title: "Success",
        description: "Post created successfully",
      });
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content</FormLabel>
              <FormControl>
                <MDEditor
                  value={field.value}
                  onChange={field.onChange}
                  preview="edit"
                  height={400}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="image"
          render={({ field: { onChange, value, ...field } }) => (
            <FormItem>
              <FormLabel>Main Image</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => onChange(e.target.files?.[0])}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="additionalImages"
          render={({ field: { onChange, value, ...field } }) => (
            <FormItem>
              <FormLabel>Additional Images</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => onChange(Array.from(e.target.files || []))}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={createPost.isPending}>
          {createPost.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create Post
        </Button>
      </form>
    </Form>
  );
} 