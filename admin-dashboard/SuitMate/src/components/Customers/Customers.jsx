import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Avatar,
  Chip,
  Alert,
  MenuItem,
  InputAdornment,
  Paper,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [searchBy, setSearchBy] = useState('all'); // 'all', 'name', 'email', 'phone'

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    preferences: {
      fitType: 'regular',
      preferredFabrics: [],
      notes: ''
    }
  });

  const searchOptions = [
    { value: 'all', label: 'All Fields' },
    { value: 'name', label: 'Name' },
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Phone' },
  ];

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Filter customers based on search
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredCustomers(customers);
    } else {
      const filtered = customers.filter(customer => {
        const searchLower = searchTerm.toLowerCase();
        const user = customer.User;
        
        switch (searchBy) {
          case 'name':
            return user?.name?.toLowerCase().includes(searchLower);
          case 'email':
            return user?.email?.toLowerCase().includes(searchLower);
          case 'phone':
            return user?.phone?.toLowerCase().includes(searchLower);
          default: // 'all'
            return (
              user?.name?.toLowerCase().includes(searchLower) ||
              user?.email?.toLowerCase().includes(searchLower) ||
              user?.phone?.toLowerCase().includes(searchLower) ||
              customer?.address?.toLowerCase().includes(searchLower)
            );
        }
      });
      setFilteredCustomers(filtered);
    }
  }, [customers, searchTerm, searchBy]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3001/api/customers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setCustomers(response.data.customers);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      setError('Failed to load customers');
      // Remove sample data fallback - show empty list instead
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (customer = null) => {
    if (customer) {
      setEditingCustomer(customer);
      setFormData({
        name: customer.User.name,
        email: customer.User.email,
        phone: customer.User.phone,
        address: customer.address || '',
        preferences: customer.preferences || {
          fitType: 'regular',
          preferredFabrics: [],
          notes: ''
        }
      });
    } else {
      setEditingCustomer(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        preferences: {
          fitType: 'regular',
          preferredFabrics: [],
          notes: ''
        }
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCustomer(null);
    setError('');
    setSuccess('');
  };

  const handleInputChange = (field, value) => {
    if (field.startsWith('preferences.')) {
      const prefField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          [prefField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      
      if (editingCustomer) {
        const response = await axios.put(
          `http://localhost:3001/api/customers/${editingCustomer.id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (response.data.success) {
          setSuccess('Customer updated successfully!');
          fetchCustomers();
          setTimeout(handleCloseDialog, 1500);
        }
      } else {
        const customerData = {
          ...formData,
          role: 'customer'
        };

        const response = await axios.post(
          'http://localhost:3001/api/auth/register',
          customerData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (response.data.success) {
          setSuccess('Customer created successfully!');
          fetchCustomers();
          setTimeout(handleCloseDialog, 1500);
        }
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (customerId) => {
  // Find the customer to show more info in confirmation
  const customer = customers.find(c => c.id === customerId);
  const customerName = customer?.User?.name || 'this customer';
  const orderCount = customer?.totalOrders || 0;
  
  // Enhanced confirmation dialog
  const confirmMessage = orderCount > 0 
    ? `Are you sure you want to delete ${customerName}? They have ${orderCount} orders. This action cannot be undone.`
    : `Are you sure you want to delete ${customerName}? This action cannot be undone.`;
  
  const confirmDelete = window.confirm(confirmMessage);
  
  if (!confirmDelete) {
    return;
  }

  try {
    console.log('Attempting to delete customer:', customerId);
    
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Authentication token not found. Please login again.');
      return;
    }

    const response = await axios.delete(
      `http://localhost:3001/api/customers/${customerId}`, 
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    
    console.log('Delete response:', response.data);
    
    if (response.data.success) {
      setSuccess('Customer deleted successfully!');
      // Refresh the customers list
      fetchCustomers();
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(response.data.message || 'Failed to delete customer');
      setTimeout(() => setError(''), 3000);
    }
    
  } catch (error) {
    console.error('Delete customer error:', error);
    console.error('Error details:', error.response?.data);
    
    const errorMessage = error.response?.data?.message || 
                        error.message || 
                        'Failed to delete customer';
    
    setError(errorMessage);
    setTimeout(() => setError(''), 3000);
  }
};


  const clearSearch = () => {
    setSearchTerm('');
    setSearchBy('all');
  };

  return (
    <Box>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Customer Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your tailoring customers with advanced search capabilities
            </Typography>
          </Box>
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{
              background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #1d4ed8 0%, #5b21b6 100%)',
              },
            }}
          >
            Add Customer
          </Button>
        </Box>
      </motion.div>

      {/* Success/Error Messages */}
      <AnimatePresence>
        {(success || error) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Alert 
              severity={success ? 'success' : 'error'} 
              sx={{ mb: 2 }}
              onClose={() => { setSuccess(''); setError(''); }}
            >
              {success || error}
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Search Customers
            </Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  select
                  label="Search By"
                  value={searchBy}
                  onChange={(e) => setSearchBy(e.target.value)}
                  size="small"
                >
                  {searchOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder={`Search customers by ${searchBy === 'all' ? 'name, email, phone, or address' : searchBy}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: searchTerm && (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={clearSearch}>
                          <ClearIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={2}>
                <Box display="flex" gap={1}>
                  <Chip 
                    label={`${filteredCustomers.length} found`}
                    color="primary" 
                    variant="outlined"
                  />
                </Box>
              </Grid>
            </Grid>
            
            {searchTerm && (
              <Box mt={2}>
                <Typography variant="body2" color="text.secondary">
                  Showing {filteredCustomers.length} of {customers.length} customers
                  {searchTerm && ` matching "${searchTerm}"`}
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Customers Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Customer</TableCell>
                  <TableCell>Contact Information</TableCell>
                  <TableCell>Address</TableCell>
                  <TableCell>Total Orders</TableCell>
                  <TableCell>Preferences</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <AnimatePresence>
                  {filteredCustomers.map((customer, index) => (
                    <motion.tr
                      key={customer.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            {customer.User?.name?.charAt(0) || 'C'}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {customer.User?.name || 'Unknown'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Customer ID: {customer.id}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Box>
                          <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                            <EmailIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                            <Typography variant="body2">
                              {customer.User?.email || 'No email'}
                            </Typography>
                          </Box>
                          <Box display="flex" alignItems="center" gap={1}>
                            <PhoneIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                            <Typography variant="body2">
                              {customer.User?.phone || 'No phone'}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <LocationIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                          <Typography variant="body2">
                            {customer.address || 'No address provided'}
                          </Typography>
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Chip 
                          label={`${customer.totalOrders || 0} orders`}
                          color="primary"
                          variant="outlined"
                          size="small"
                        />
                      </TableCell>
                      
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            Fit: {customer.preferences?.fitType || 'Regular'}
                          </Typography>
                          {customer.preferences?.notes && (
                            <Typography variant="caption" color="text.secondary">
                              {customer.preferences.notes.substring(0, 30)}
                              {customer.preferences.notes.length > 30 ? '...' : ''}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Box display="flex" gap={1}>
                          <Tooltip title="Edit Customer">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDialog(customer)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title="Delete Customer">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDelete(customer.id)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>
          </TableContainer>
          
          {filteredCustomers.length === 0 && !loading && (
            <Box py={8} textAlign="center">
              <Typography variant="h6" color="text.secondary">
                {searchTerm ? 'No customers found matching your search' : 'No customers found'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {searchTerm ? 'Try adjusting your search criteria' : 'Add your first customer to get started'}
              </Typography>
              {searchTerm && (
                <Button onClick={clearSearch} sx={{ mt: 2 }}>
                  Clear Search
                </Button>
              )}
            </Box>
          )}
        </Card>
      </motion.div>

      {/* Add/Edit Customer Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <PersonIcon />
            {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Box py={2}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  required
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  label="Preferred Fit Type"
                  value={formData.preferences.fitType}
                  onChange={(e) => handleInputChange('preferences.fitType', e.target.value)}
                >
                  <MenuItem value="slim">Slim Fit</MenuItem>
                  <MenuItem value="regular">Regular Fit</MenuItem>
                  <MenuItem value="relaxed">Relaxed Fit</MenuItem>
                </TextField>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  multiline
                  rows={2}
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Customer Notes"
                  multiline
                  rows={3}
                  value={formData.preferences.notes}
                  onChange={(e) => handleInputChange('preferences.notes', e.target.value)}
                  placeholder="Any special preferences or notes about this customer..."
                />
              </Grid>
            </Grid>

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mt: 2 }}>
                {success}
              </Alert>
            )}
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseDialog} startIcon={<CancelIcon />}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={loading}
            startIcon={<SaveIcon />}
          >
            {loading ? 'Saving...' : editingCustomer ? 'Update Customer' : 'Add Customer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Customers;
