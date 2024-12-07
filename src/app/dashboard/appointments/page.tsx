"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAppointments, useMyAppointments, useUpdateAppointmentStatus } from "@/hooks/appointments";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar, CheckCircle2, Clock, Search, XCircle, RefreshCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export default function AppointmentsPage() {
  const { data: appointments, isLoading, error } = useAppointments();
  const { toast } = useToast();
  const { mutate: updateStatus } = useUpdateAppointmentStatus();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  console.log("Data", appointments);
  // Show error state if there's an error
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] gap-4">
        <p className="text-destructive font-medium">Failed to load appointments</p>
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

  // Calculate statistics with null checks
  const stats = {
    total: appointments?.length || 0,
    pending: appointments?.filter(apt => apt.status === "pending").length || 0,
    confirmed: appointments?.filter(apt => apt.status === "confirmed").length || 0,
    cancelled: appointments?.filter(apt => apt.status === "cancelled").length || 0,
  };

  const handleStatusUpdate = (id: string, status: 'confirmed' | 'cancelled') => {
    updateStatus(
      { id, status },
      {
        onSuccess: () => {
          toast({
            title: "Success",
            description: `Appointment ${status} successfully`,
          });
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to update appointment status",
            variant: "destructive",
          });
        },
      }
    );
  };

  const filteredAppointments = appointments?.filter((appointment) => {
    if (!appointment?.patientId || !appointment?.doctorId) return false;

    const searchLower = searchTerm.toLowerCase();
    const patientName = `${appointment.patientId?.firstName || ''} ${appointment.patientId?.lastName || ''}`.toLowerCase();
    const doctorName = `${appointment.doctorId?.firstName || ''} ${appointment.doctorId?.lastName || ''}`.toLowerCase();
    const matchesSearch = patientName.includes(searchLower) || doctorName.includes(searchLower);
    const matchesStatus = statusFilter === "all" || appointment.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary/80 to-primary bg-clip-text text-transparent">
          Appointments
        </h2>
        <p className="text-muted-foreground">Manage and track patient appointments.</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-primary/50 hover:border-l-primary transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-yellow-500/50 hover:border-l-yellow-500 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500/50 hover:border-l-green-500 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats.confirmed}</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-destructive/50 hover:border-l-destructive transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
            <XCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.cancelled}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-primary" />
          <Input
            placeholder="Search by doctor or patient..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 border-primary/20 focus:border-primary/50"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px] border-primary/20 focus:border-primary/50">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending" className="text-yellow-500">Pending</SelectItem>
            <SelectItem value="confirmed" className="text-green-500">Confirmed</SelectItem>
            <SelectItem value="cancelled" className="text-destructive">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="border-primary/20">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b-primary/20">
                <TableHead className="text-primary font-semibold">Patient</TableHead>
                <TableHead className="text-primary font-semibold">Doctor</TableHead>
                <TableHead className="text-primary font-semibold">Date</TableHead>
                <TableHead className="text-primary font-semibold">Time</TableHead>
                <TableHead className="text-primary font-semibold">Status</TableHead>
                <TableHead className="text-primary font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array(3).fill(0).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  </TableRow>
                ))
              ) : filteredAppointments?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <p className="text-muted-foreground">No appointments found</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredAppointments?.map((appointment) => (
                  <TableRow
                    key={appointment.id}
                    className="hover:bg-primary/5 transition-colors border-b-primary/10"
                  >
                    <TableCell className="font-medium">
                      {appointment.patientId?.firstName && appointment.patientId?.lastName
                        ? `${appointment.patientId.firstName} ${appointment.patientId.lastName}`
                        : "Unknown Patient"}
                    </TableCell>
                    <TableCell>
                      {appointment.doctorId?.firstName && appointment.doctorId?.lastName
                        ? `${appointment.doctorId.firstName} ${appointment.doctorId.lastName}`
                        : "Unknown Doctor"}
                    </TableCell>
                    <TableCell>
                      {appointment.appointmentDate
                        ? format(new Date(appointment.appointmentDate), "MMM dd, yyyy")
                        : "Date not set"}
                    </TableCell>
                    <TableCell>
                      {appointment.appointmentDate
                        ? format(new Date(appointment.appointmentDate), "hh:mm a")
                        : "Time not set"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          appointment.status === "pending" ? "default" :
                            appointment.status === "confirmed" ? "success" :
                              "destructive"
                        }
                        className={cn(
                          "capitalize",
                          {
                            "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200": appointment.status === "pending",
                            "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200": appointment.status === "confirmed",
                            "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200": appointment.status === "cancelled"
                          }
                        )}
                      >
                        {appointment.status || "Unknown"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-primary/20 hover:border-primary/50 hover:bg-primary/5"
                          >
                            Update Status
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[160px]">
                          <DropdownMenuItem
                            onClick={() => handleStatusUpdate(appointment._id, "confirmed")}
                            disabled={appointment.status === "confirmed"}
                            className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/50"
                          >
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Confirm
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleStatusUpdate(appointment._id, "cancelled")}
                            disabled={appointment.status === "cancelled"}
                            className="text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Cancel
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
} 