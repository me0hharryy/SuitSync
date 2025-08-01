import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { motion } from 'framer-motion';

const Inventory = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Inventory Management
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Manage fabrics, materials, and supplies
        </Typography>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Inventory Management System
            </Typography>
            <Typography color="text.secondary">
              This section will contain inventory management functionality including:
            </Typography>
            <ul style={{ marginTop: 16, paddingLeft: 24 }}>
              <li>Fabric inventory</li>
              <li>Material tracking</li>
              <li>Stock levels</li>
              <li>Supplier management</li>
              <li>Purchase orders</li>
            </ul>
          </CardContent>
        </Card>
      </Box>
    </motion.div>
  );
};

export default Inventory;
