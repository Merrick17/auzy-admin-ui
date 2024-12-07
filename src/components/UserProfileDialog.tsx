import { User } from "@/types";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface UserProfileDialogProps {
  user: User;
}

// Add this helper function at the top of the file, after imports
const getProfilePictureUrl = (profilePicture: string | null | undefined) => {
  if (!profilePicture) return '';
  if (profilePicture.startsWith('http://') || profilePicture.startsWith('https://')) {
    return profilePicture;
  }
  return `${process.env.NEXT_PUBLIC_BASE_URL}/${profilePicture}`;
};

export function UserProfileDialog({ user }: UserProfileDialogProps) {
  if (!user) {
    return null;
  }

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>User Profile</DialogTitle>
      </DialogHeader>
      <ScrollArea className="max-h-[80vh]">
        <div className="space-y-6">
          {/* Header with basic info */}
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage 
                src={getProfilePictureUrl(user?.profilePicture)} 
                alt={`${user?.firstName} ${user?.lastName}`} 
              />
              <AvatarFallback>
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h2 className="text-2xl font-bold">
                {user.firstName} {user.lastName}
              </h2>
              <div className="flex items-center gap-2">
                <Badge
                  variant={user.role === 'admin' ? 'default' :
                    user.role === 'doctor' ? 'secondary' : 'outline'}
                  className="capitalize"
                >
                  {user.role}
                </Badge>
                {user.isVerified && (
                  <Badge variant="outline" className="bg-green-100 text-green-700">
                    Verified
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p>{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p>{user.phoneNumber}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Address</p>
                <p>{user.address}</p>
                <p>{user.city}, {user.zipCode}</p>
              </div>
            </CardContent>
          </Card>

          {/* Doctor Specific Information */}
          {user.role === "doctor" && (
            <>
              {user.description && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{user.description}</p>
                  </CardContent>
                </Card>
              )}

              {user.about && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">About</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{user.about}</p>
                  </CardContent>
                </Card>
              )}

              {/* Add rating and reviews if doctor */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Ratings & Reviews</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold">{user.rating.toFixed(1)}</p>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Based on {user.reviewsCount} reviews
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Member Since</p>
                <p>{new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Updated</p>
                <p>{new Date(user.updatedAt).toLocaleDateString()}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </DialogContent>
  );
} 