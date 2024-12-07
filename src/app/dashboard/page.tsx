"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useQuery } from "@tanstack/react-query"
import { BarChart3, CalendarCheck, Users, UserCog, RefreshCcw } from "lucide-react"
import { getDashboardStats } from "@/services/api" // You'll need to implement this
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"
import { useEffect } from "react"
import { useAppStats } from "@/hooks/useAppStats"
import { Button } from "@/components/ui/button"

export default function DashboardPage() {
  const { data: stats, isLoading, error } = useAppStats();
  useEffect(() => {
    console.log("Stats", stats);
  }, [isLoading])

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] gap-4">
        <p className="text-destructive font-medium">Failed to load dashboard data</p>
        <Button 
          variant="outline" 
          onClick={() => window.location.reload()}
          className="gap-2"
        >
          <RefreshCcw className="h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return <DashboardSkeleton />
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
        Dashboard Overview
      </h2>

      {/* Main Stats */}
      <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Doctors</CardTitle>
            <UserCog className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats?.totalDoctors}</div>
            <Progress value={65} className="mt-3 h-1" />
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.totalPatients}</div>
            <Progress value={80} className="mt-3 h-1" />
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
            <CalendarCheck className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats?.totalAppointments}</div>
            <Progress value={45} className="mt-3 h-1" />
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Appointment Stats</CardTitle>
            <BarChart3 className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Pending</span>
                <Badge variant="outline" className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200">
                  {stats?.appointmentsByStatus.pending}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Confirmed</span>
                <Badge variant="outline" className="bg-green-100 text-green-700 hover:bg-green-200">
                  {stats?.appointmentsByStatus.confirmed}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Completed</span>
                <Badge variant="outline" className="bg-blue-100 text-blue-700 hover:bg-blue-200">
                  {stats?.appointmentsByStatus.completed}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Appointments & Top Doctors */}
      <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
        <Card className="col-span-1 hover:shadow-lg transition-shadow">
          <CardHeader className="border-b pb-4">
            <CardTitle className="text-lg font-semibold text-purple-600">Recent Appointments</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-6">
              {stats?.recentAppointments?.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between hover:bg-slate-50 p-2 rounded-lg transition-colors">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage 
                        src={appointment.patientId?.profilePicture || ''} 
                        alt={`${appointment.patientId?.firstName || 'Unknown'} ${appointment.patientId?.lastName || 'Patient'}`}
                      />
                      <AvatarFallback>
                        {appointment.patientId?.firstName?.[0] || '?'}
                        {appointment.patientId?.lastName?.[0] || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">
                        {appointment.patientId?.firstName && appointment.patientId?.lastName
                          ? `${appointment.patientId.firstName} ${appointment.patientId.lastName}`
                          : "Unknown Patient"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {appointment.doctorId?.firstName && appointment.doctorId?.lastName
                          ? `with Dr. ${appointment.doctorId.firstName} ${appointment.doctorId.lastName}`
                          : "with Unknown Doctor"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {format(new Date(appointment.appointmentDate), 'MMM dd, yyyy')}
                    </p>
                    <Badge
                      variant="outline"
                      className={cn(
                        "font-medium",
                        {
                          'bg-green-100 text-green-700': appointment.status === 'confirmed',
                          'bg-yellow-100 text-yellow-700': appointment.status === 'pending',
                          'bg-red-100 text-red-700': appointment.status === 'cancelled'
                        }
                      )}
                    >
                      {appointment.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 hover:shadow-lg transition-shadow">
          <CardHeader className="border-b pb-4">
            <CardTitle className="text-lg font-semibold text-blue-600">Top Rated Doctors</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-6">
              {stats?.topDoctors.map((doctor) => (
                <div key={doctor.id} className="flex items-center justify-between hover:bg-slate-50 p-2 rounded-lg transition-colors">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src={doctor.profilePicture} />
                      <AvatarFallback>
                        {doctor.firstName[0]}
                        {doctor.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">
                        Dr. {doctor.firstName} {doctor.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {doctor.specialities?.[0]}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-sm font-medium">{doctor.rating}</span>
                    <span className="text-yellow-500">★</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array(4).fill(0).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-[60px]" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {Array(2).fill(0).map((_, i) => (
          <Card key={`skeleton-card-${i}`}>
            <CardHeader>
              <Skeleton className="h-6 w-[140px]" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array(4).fill(0).map((_, j) => (
                  <div key={`skeleton-item-${i}-${j}`} className="flex items-center space-x-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[150px]" />
                      <Skeleton className="h-3 w-[100px]" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}