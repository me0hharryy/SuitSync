import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { motion } from 'framer-motion';

const Settings = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Settings
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Configure your SuitSync system
        </Typography>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              System Settings
            </Typography>
            <Typography color="text.secondary">
              This section will contain system settings including:
            </Typography>
            <ul style={{ marginTop: 16, paddingLeft: 24 }}>
              <li>Business information</li>
              <li>User management</li>
              <li>System preferences</li>
              <li>Notification settings</li>
              <li>Security settings</li>
            </ul>
          </CardContent>
        </Card>
      </Box>
    </motion.div>
  );
};

export default Settings;
