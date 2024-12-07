import React from 'react';
import { usePayments } from '@/hooks/usePayments';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default function PaymentsList() {
  const { data: payments, isLoading, error } = usePayments();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading payments</div>;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Customer</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Payment Method</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {payments?.map((payment) => (
          <TableRow key={payment.id}>
            <TableCell>{payment.customerName}</TableCell>
            <TableCell>${payment.amount.toFixed(2)}</TableCell>
            <TableCell>{payment.paymentMethod}</TableCell>
            <TableCell>{new Date(payment.date).toLocaleDateString()}</TableCell>
            <TableCell>
              <Badge className={`capitalize ${getStatusColor(payment.status)}`}>
                {payment.status}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function getStatusColor(status: string) {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'failed':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
} 