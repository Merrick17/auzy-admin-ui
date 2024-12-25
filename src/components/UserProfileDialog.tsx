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

// Add role badge variants
const roleBadgeVariants = {
  admin: 'default',
  doctor: 'secondary',
  patient: 'outline'
} as const;

// Helper function for profile picture URL
const getProfilePictureUrl = (profilePicture: string | null | undefined) => {
  if (!profilePicture) return '';
  if (profilePicture.startsWith('http://') || profilePicture.startsWith('https://')) {
    return profilePicture;
  }
  return `${process.env.NEXT_PUBLIC_BASE_URL}/${profilePicture}`;
};

export function UserProfileDialog({ user }: UserProfileDialogProps) {
  return (
    <DialogContent className="max-w-3xl h-[90vh] p-0 overflow-hidden flex flex-col">
      <DialogHeader className="px-6 py-4">
        <DialogTitle>User Profile</DialogTitle>
      </DialogHeader>
      <ScrollArea className="flex-1">
        <div className="space-y-6 px-6 pb-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage 
                    src={getProfilePictureUrl(user.profilePicture)} 
                    alt={`${user.firstName} ${user.lastName}`}
                  />
                  <AvatarFallback className="text-lg">
                    {user.firstName[0]}{user.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">
                    {user.firstName} {user.lastName}
                  </h3>
                  <Badge variant={roleBadgeVariants[user.role]} className="mt-1">
                    {user.role}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

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
              {/* Specialties/Tags */}
              {user.tags && user.tags.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Specialties</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {user.tags.map((tag, index) => (
                        <Badge 
                          key={index} 
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

              {/* Education */}
              {user.education && user.education.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Education</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {user.education.map((edu, index) => (
                      <div key={index} className="border-b last:border-0 pb-2 last:pb-0">
                        <p className="font-medium">{edu.degree}</p>
                        <p className="text-sm text-muted-foreground">
                          {edu.institution} • {edu.year}
                        </p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Experience */}
              {user.experience && user.experience.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Experience</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {user.experience.map((exp, index) => (
                      <div key={index} className="border-b last:border-0 pb-2 last:pb-0">
                        <p className="font-medium">{exp.position}</p>
                        <p className="text-sm text-muted-foreground">
                          {exp.hospital} • {exp.startYear} - {exp.current ? 'Present' : exp.endYear}
                        </p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Description & About */}
              {(user.description || user.about) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Additional Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {user.description && (
                      <div>
                        <p className="text-sm text-muted-foreground">Description</p>
                        <p>{user.description}</p>
                      </div>
                    )}
                    {user.about && (
                      <div>
                        <p className="text-sm text-muted-foreground">About</p>
                        <p>{user.about}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Ratings & Reviews */}
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
        </div>
      </ScrollArea>
    </DialogContent>
  );
} 