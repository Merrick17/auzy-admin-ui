"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useDeletePost, usePosts } from "@/hooks/usePosts";
import { Post } from "@/types";
import MDEditor from '@uiw/react-md-editor';
import { Eye, FileEdit, Loader2, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { CreatePostForm } from "./CreatePostForm";

export default function PostsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const { data: posts, isLoading } = usePosts();
  const { toast } = useToast();
  const deletePost = useDeletePost();
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  const handleDelete = async (id: string) => {
    try {
      await deletePost.mutateAsync(id);
      toast({
        title: "Success",
        description: "Post deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive",
      });
    }
  };

  const handleViewPost = (post: Post) => {
    setSelectedPost(post);
    setViewDialogOpen(true);
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Posts</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Post
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>Create New Post</DialogTitle>
            </DialogHeader>
            <ScrollArea className="h-full max-h-[calc(80vh-8rem)]">
              <div className="p-6">
                <CreatePostForm onSuccess={() => setDialogOpen(false)} />
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : posts && posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post: Post) => (
            <Card key={post._id}>
              <CardHeader>
                {post.image && (
                  <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden">
                    <Image
                      src={`${BASE_URL}${post.image}`}
                      alt={post.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                )}
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{post.title}</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleViewPost(post)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <FileEdit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(post._id)}
                      disabled={deletePost.isPending}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4 line-clamp-2">
                  {post.description}
                </p>
                <div className="flex gap-2">
                  <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                    {post.status}
                  </Badge>
                  <Badge variant="outline">{post.views} views</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center text-muted-foreground">
          No posts found. Create your first post!
        </div>
      )}

      {/* View Post Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">View Post</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-full max-h-[calc(80vh-8rem)]">
            {selectedPost && (
              <div className="space-y-6 p-4">
                {selectedPost.image && (
                  <div className="relative w-full h-64 rounded-lg overflow-hidden">
                    <Image
                      src={selectedPost.image}
                      alt={selectedPost.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-muted-foreground mb-1">Title</h3>
                    <p className="text-xl">{selectedPost.title}</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-muted-foreground mb-1">Description</h3>
                    <p>{selectedPost.description}</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-muted-foreground mb-1">Content</h3>
                    <div className="prose max-w-none" data-color-mode="light">
                      <MDEditor.Markdown
                        source={selectedPost.content}
                        style={{ whiteSpace: 'pre-wrap' }}
                      />
                    </div>
                  </div>

                  {selectedPost.additionalImages && selectedPost.additionalImages.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-muted-foreground mb-2">Additional Images</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {selectedPost.additionalImages.map((image, index) => (
                          <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                            <Image
                              src={image}
                              alt={`Additional image ${index + 1}`}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    <div>
                      <Badge variant={selectedPost.status === 'published' ? 'default' : 'secondary'}>
                        {selectedPost.status}
                      </Badge>
                    </div>
                    <Badge variant="outline">{selectedPost.views} views</Badge>
                    {selectedPost.tags && selectedPost.tags.map((tag, index) => (
                      <Badge key={index} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="text-sm text-muted-foreground">
                    <p>Created: {new Date(selectedPost.createdAt).toLocaleDateString()}</p>
                    {selectedPost.updatedAt && (
                      <p>Last updated: {new Date(selectedPost.updatedAt).toLocaleDateString()}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}