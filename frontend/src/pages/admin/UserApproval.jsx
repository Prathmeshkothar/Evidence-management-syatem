import { useState, useEffect } from 'react';
import { Box, Card, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Paper } from '@mui/material';
import { toast } from 'react-toastify';
import axios from 'axios';

function UserApproval() {
  const [pendingUsers, setPendingUsers] = useState([]);

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const fetchPendingUsers = async () => {
    try {
      const response = await axios.get('/api/auth/pending-users');
      setPendingUsers(response.data);
    } catch (error) {
      toast.error('Failed to fetch pending users');
    }
  };

  const handleApprove = async (userId) => {
    try {
      await axios.post(`/api/auth/approve-user/${userId}`);
      toast.success('User approved successfully');
      fetchPendingUsers(); // Refresh the list
    } catch (error) {
      toast.error('Failed to approve user');
    }
  };

  const handleReject = async (userId) => {
    try {
      await axios.post(`/api/auth/reject-user/${userId}`);
      toast.success('User rejected successfully');
      fetchPendingUsers(); // Refresh the list
    } catch (error) {
      toast.error('Failed to reject user');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Pending User Approvals
      </Typography>
      
      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Police Station</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pendingUsers.map((user) => (
              <TableRow key={user._id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>{user.policeStation}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={() => handleApprove(user._id)}
                    sx={{ mr: 1 }}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    size="small"
                    onClick={() => handleReject(user._id)}
                  >
                    Reject
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {pendingUsers.length === 0 && (
        <Typography variant="body1" color="text.secondary" sx={{ mt: 3, textAlign: 'center' }}>
          No pending user approvals
        </Typography>
      )}
    </Box>
  );
}

export default UserApproval;