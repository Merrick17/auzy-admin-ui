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
  if (!user) return null;

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] w-[90vw] overflow-hidden">
      <DialogHeader>
        <DialogTitle>User Profile</DialogTitle>
      </DialogHeader>
      <ScrollArea className="max-h-[calc(90vh-8rem)]">
        <div className="space-y-6 p-1">
          {/* Header with basic info */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <Avatar className="h-20 w-20 sm:h-16 sm:w-16">
              <AvatarImage 
                src={getProfilePictureUrl(user?.profilePicture)} 
                alt={`${user?.firstName} ${user?.lastName}`} 
              />
              <AvatarFallback>
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1 text-center sm:text-left">
              <h2 className="text-2xl font-bold">
                {user.firstName} {user.lastName}
              </h2>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
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
              {user.tags && user.tags.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Specialties</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {user.tags.map((tag:any, index:number) => (
                        <Badge 
                          key={index.toString()} 
                          variant="secondary"
                          className="capitalize"
                        >
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

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