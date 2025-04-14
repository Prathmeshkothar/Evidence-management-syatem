import { Box, Typography } from '@mui/material';

function Dashboard() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Welcome to Evidence Management System
      </Typography>
      <Typography variant="body1" color="text.secondary">
        This dashboard will be expanded with evidence management features in future updates.
      </Typography>
    </Box>
  );
}

export default Dashboard;