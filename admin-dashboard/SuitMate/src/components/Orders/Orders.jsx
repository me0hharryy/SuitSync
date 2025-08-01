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
  MenuItem,
  Grid,
  Avatar,
  Chip,
  Alert,
  Autocomplete,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  Divider,
  Step,
  Stepper,
  StepLabel,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Tooltip,
  Menu,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  ShoppingBag as OrderIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  AddCircle as AddCircleIcon,
  RemoveCircle as RemoveCircleIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Status menu states
  const [statusMenuAnchor, setStatusMenuAnchor] = useState(null);
  const [selectedOrderForMenu, setSelectedOrderForMenu] = useState(null);

  // Order form state
  const [orderData, setOrderData] = useState({
    selectedCustomer: null,
    newCustomer: {
      name: '',
      email: '',
      phone: '',
      address: '',
    },
    isNewCustomer: false,
    items: [{
      itemType: '',
      fabric: '',
      color: '',
      specifications: {
        style: '',
        collar: '',
        sleeves: '',
        pockets: '',
        customNotes: '',
      },
      measurements: {},
      price: 0,
    }],
    selectedWorker: null,
    priority: 'medium',
    deliveryDate: '',
    notes: '',
    advancePayment: 0,
    measurements: {
      chest: '',
      waist: '',
      hips: '',
      shoulder: '',
      sleeveLength: '',
      collarSize: '',
      inseam: '',
      thigh: '',
      customMeasurements: '',
    }
  });

  const steps = ['Customer Selection', 'Order Items', 'Measurements', 'Worker Assignment', 'Review & Submit'];

  const itemTypes = [
    'Shirt',
    'Pant',
    'Suit',
    'Blazer',
    'Waistcoat',
    'Kurta',
    'Sherwani',
    'Alterations'
  ];

  const fabricOptions = [
    'Cotton',
    'Linen',
    'Wool',
    'Silk',
    'Polyester',
    'Viscose',
    'Cotton Blend',
    'Wool Blend'
  ];

  const statusOptions = [
    { value: 'received', label: 'Received', color: 'info' },
    { value: 'in-progress', label: 'In Progress', color: 'warning' },
    { value: 'ready', label: 'Ready', color: 'success' },
    { value: 'delivered', label: 'Delivered', color: 'default' },
    { value: 'cancelled', label: 'Cancelled', color: 'error' }
  ];

  useEffect(() => {
    fetchOrders();
    fetchCustomers();
    fetchWorkers();
  }, []);

  const fetchOrders = async () => {
  setLoading(true);
  try {
    const token = localStorage.getItem('token');
    console.log('Fetching orders from API...');
    
    const response = await axios.get('http://localhost:3001/api/orders', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('Orders API response:', response.data);
    
    if (response.data.success) {
      setOrders(response.data.orders);
      console.log(`Loaded ${response.data.orders.length} orders from database`);
    }
  } catch (error) {
    console.error('Error fetching orders:', error);
    console.error('Error details:', error.response?.data);
    setError(`Failed to load orders: ${error.response?.data?.message || error.message}`);
    // Remove sample data fallback
    setOrders([]);
  } finally {
    setLoading(false);
  }
};


  const fetchCustomers = async () => {
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
      setCustomers([
        {
          id: 1,
          User: {
            name: 'John Doe',
            email: 'john@example.com',
            phone: '9876543210'
          }
        },
        {
          id: 2,
          User: {
            name: 'Jane Smith',
            email: 'jane@example.com',
            phone: '9876543211'
          }
        }
      ]);
    }
  };

  const fetchWorkers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3001/api/workers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        // The worker model no longer has a status field, so we just set all workers
        setWorkers(response.data.workers);
      }
    } catch (error) {
      console.error('Error fetching workers:', error);
      setWorkers([
        {
          id: 1,
          User: {
            name: 'John Taylor',
            email: 'john.taylor@suitsync.com'
          },
          skills: ['Shirt Making', 'Suit Construction'],
          specialization: 'Men\'s Formal Wear',
        },
        {
          id: 2,
          User: {
            name: 'Maria Rodriguez',
            email: 'maria@suitsync.com'
          },
          skills: ['Pattern Making', 'Women\'s Formal Wear'],
          specialization: 'Women\'s Formal Wear',
        }
      ]);
    }
  };

  const handleOpenDialog = (order = null) => {
    if (order) {
      setEditingOrder(order);
      setActiveStep(0);
      setOrderData({
        selectedCustomer: order.Customer,
        newCustomer: {
          name: '',
          email: '',
          phone: '',
          address: '',
        },
        isNewCustomer: false,
        items: order.items || [{
          itemType: '',
          fabric: '',
          color: '',
          specifications: {
            style: '',
            collar: '',
            sleeves: '',
            pockets: '',
            customNotes: '',
          },
          measurements: {},
          price: 0,
        }],
        selectedWorker: order.Worker,
        priority: order.priority || 'medium',
        deliveryDate: order.deliveryDate ? order.deliveryDate.split('T')[0] : '',
        notes: order.notes || '',
        advancePayment: order.advancePayment || 0,
        measurements: order.measurements?.[0] || { // Assuming there is one measurement object per order
          chest: '', waist: '', hips: '', shoulder: '', sleeveLength: '', collarSize: '', inseam: '', thigh: '', customMeasurements: ''
        },
      });
    } else {
      setEditingOrder(null);
      setActiveStep(0);
      setOrderData({
        selectedCustomer: null,
        newCustomer: {
          name: '',
          email: '',
          phone: '',
          address: '',
        },
        isNewCustomer: false,
        items: [{
          itemType: '',
          fabric: '',
          color: '',
          specifications: {
            style: '',
            collar: '',
            sleeves: '',
            pockets: '',
            customNotes: '',
          },
          measurements: {},
          price: 0,
        }],
        selectedWorker: null,
        priority: 'medium',
        deliveryDate: '',
        notes: '',
        advancePayment: 0,
        measurements: {
          chest: '', waist: '', hips: '', shoulder: '', sleeveLength: '', collarSize: '', inseam: '', thigh: '', customMeasurements: ''
        }
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingOrder(null);
    setError('');
    setSuccess('');
    setActiveStep(0);
  };

  // Status menu handlers
  const handleStatusMenuOpen = (event, order) => {
    event.stopPropagation();
    setStatusMenuAnchor(event.currentTarget);
    setSelectedOrderForMenu(order);
  };

  const handleStatusMenuClose = () => {
    setStatusMenuAnchor(null);
    setSelectedOrderForMenu(null);
  };

  const handleQuickStatusUpdate = async (newStatus) => {
    if (!selectedOrderForMenu) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `http://localhost:3001/api/orders/${selectedOrderForMenu.id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setSuccess('Order status updated successfully!');
        fetchOrders();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      setError('Failed to update order status');
      setTimeout(() => setError(''), 3000);
    }
    
    handleStatusMenuClose();
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const validateStep = (step) => {
    switch (step) {
      case 0:
        if (orderData.isNewCustomer) {
          return orderData.newCustomer.name && orderData.newCustomer.email && orderData.newCustomer.phone;
        }
        return orderData.selectedCustomer !== null;
      
      case 1:
        return orderData.items.every(item => item.itemType && item.price > 0);
      
      case 2: // Measurements
        // Measurements are optional, so we don't need to validate
        return true;
      
      case 3: // Worker Assignment
        return orderData.selectedWorker !== null && orderData.deliveryDate;
        
      default:
        return true;
    }
  };

  const addOrderItem = () => {
    setOrderData(prev => ({
      ...prev,
      items: [...prev.items, {
        itemType: '',
        fabric: '',
        color: '',
        specifications: {
          style: '',
          collar: '',
          sleeves: '',
          pockets: '',
          customNotes: '',
        },
        measurements: {},
        price: 0,
      }]
    }));
  };

  const removeOrderItem = (index) => {
    setOrderData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const updateOrderItem = (index, field, value) => {
    setOrderData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index 
          ? field.includes('.') 
            ? {
                ...item,
                [field.split('.')[0]]: {
                  ...item[field.split('.')[0]],
                  [field.split('.')[1]]: value
                }
              }
            : { ...item, [field]: value }
          : item
      )
    }));
  };
  
  const handleMeasurementChange = (field, value) => {
    setOrderData(prev => ({
      ...prev,
      measurements: {
        ...prev.measurements,
        [field]: value
      }
    }));
  };

  const calculateTotal = () => {
    return orderData.items.reduce((total, item) => total + (parseFloat(item.price) || 0), 0);
  };

  const handleSubmitOrder = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found. Please login again.');
        setLoading(false);
        return;
      }
      
      // Cleanse measurements data: convert empty strings to null
      const cleansedMeasurements = Object.fromEntries(
        Object.entries(orderData.measurements).map(([key, value]) => [key, value === '' ? null : value])
      );
      
      // Filter out empty measurements
      const hasMeasurements = Object.values(cleansedMeasurements).some(value => value !== null && value !== '');

      const submitData = {
        selectedCustomer: orderData.selectedCustomer,
        newCustomer: orderData.newCustomer,
        isNewCustomer: orderData.isNewCustomer,
        items: orderData.items,
        selectedWorker: orderData.selectedWorker,
        priority: orderData.priority,
        deliveryDate: orderData.deliveryDate,
        notes: orderData.notes,
        advancePayment: orderData.advancePayment,
        totalAmount: calculateTotal(),
        balanceAmount: calculateTotal() - (orderData.advancePayment || 0),
        measurements: hasMeasurements ? cleansedMeasurements : null
      };
      
      // Validate customer selection before submitting
      if (submitData.isNewCustomer && (!submitData.newCustomer.name || !submitData.newCustomer.email || !submitData.newCustomer.phone)) {
        setError('Please fill in all required customer fields.');
        setLoading(false);
        return;
      } else if (!submitData.isNewCustomer && !submitData.selectedCustomer) {
        setError('Please select an existing customer.');
        setLoading(false);
        return;
      }
      
      // Validate order items before submitting
      if (submitData.items.length === 0 || submitData.items.some(item => !item.itemType || !item.price)) {
        setError('Please ensure all order items have a type and a price.');
        setLoading(false);
        return;
      }

      let response;
      
      if (editingOrder) {
        response = await axios.put(
          `http://localhost:3001/api/orders/${editingOrder.id}`,
          submitData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        response = await axios.post(
          'http://localhost:3001/api/orders/create-with-customer',
          submitData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      
      if (response.data.success) {
        // After creating the order, if measurements exist, submit them separately
        if (hasMeasurements) {
          await axios.post(
            `http://localhost:3001/api/orders/${response.data.order.id}/measurements`,
            cleansedMeasurements, // Use the cleansed data
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }
        
        setSuccess(editingOrder ? 'Order updated successfully!' : 'Order created successfully!');
        fetchOrders();
        setTimeout(() => {
          handleCloseDialog();
          setSuccess('');
        }, 2000);
      }
    } catch (error) {
      console.error('Error in handleSubmitOrder:', error);
      setError(error.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrder = async (orderId) => {
  // Add confirmation dialog
  const confirmDelete = window.confirm(
    'Are you sure you want to delete this order? This action cannot be undone and will free up the assigned worker.'
  );
  
  if (!confirmDelete) {
    return;
  }

  try {
    console.log('Attempting to delete order:', orderId);
    
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Authentication token not found. Please login again.');
      return;
    }

    // Set loading state if you have it
    setLoading && setLoading(true);

    const response = await axios.delete(
      `http://localhost:3001/api/orders/${orderId}`, 
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    
    console.log('Delete response:', response.data);
    
    if (response.data.success) {
      setSuccess('Order deleted successfully!');
      // Refresh the orders list
      fetchOrders();
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(response.data.message || 'Failed to delete order');
      setTimeout(() => setError(''), 3000);
    }
    
  } catch (error) {
    console.error('Delete order error:', error);
    console.error('Error details:', error.response?.data);
    
    const errorMessage = error.response?.data?.message || 
                        error.message || 
                        'Failed to delete order';
    
    setError(errorMessage);
    setTimeout(() => setError(''), 3000);
    
  } finally {
    setLoading && setLoading(false);
  }
};


  const getStatusColor = (status) => {
    const colors = {
      'received': 'info',
      'in-progress': 'warning',
      'ready': 'success',
      'delivered': 'default',
      'cancelled': 'error'
    };
    return colors[status] || 'default';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'low': 'success',
      'medium': 'warning',
      'high': 'error'
    };
    return colors[priority] || 'default';
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.Customer?.User?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const renderStepContent = (step) => {
    switch (step) {
      case 0: // Customer Selection
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Select or Add Customer
            </Typography>
            
            <FormControl component="fieldset" sx={{ mb: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Button
                    variant={!orderData.isNewCustomer ? "contained" : "outlined"}
                    onClick={() => setOrderData(prev => ({ ...prev, isNewCustomer: false }))}
                    sx={{ mr: 2 }}
                  >
                    Existing Customer
                  </Button>
                  <Button
                    variant={orderData.isNewCustomer ? "contained" : "outlined"}
                    onClick={() => setOrderData(prev => ({ ...prev, isNewCustomer: true }))}
                  >
                    New Customer
                  </Button>
                </Grid>
              </Grid>
            </FormControl>

            {!orderData.isNewCustomer ? (
              <Autocomplete
                options={customers}
                getOptionLabel={(option) => `${option.User.name} (${option.User.email})`}
                value={orderData.selectedCustomer}
                onChange={(event, newValue) => {
                  setOrderData(prev => ({ ...prev, selectedCustomer: newValue }));
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Search Customer" fullWidth />
                )}
                renderOption={(props, option) => (
                  <Box component="li" {...props}>
                    <Avatar sx={{ mr: 2 }}>{option.User.name.charAt(0)}</Avatar>
                    <Box>
                      <Typography variant="body2">{option.User.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {option.User.email} • {option.User.phone}
                      </Typography>
                    </Box>
                  </Box>
                )}
              />
            ) : (
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Customer Name"
                    value={orderData.newCustomer.name}
                    onChange={(e) => setOrderData(prev => ({
                      ...prev,
                      newCustomer: { ...prev.newCustomer, name: e.target.value }
                    }))}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={orderData.newCustomer.email}
                    onChange={(e) => setOrderData(prev => ({
                      ...prev,
                      newCustomer: { ...prev.newCustomer, email: e.target.value }
                    }))}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    value={orderData.newCustomer.phone}
                    onChange={(e) => setOrderData(prev => ({
                      ...prev,
                      newCustomer: { ...prev.newCustomer, phone: e.target.value }
                    }))}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Address"
                    value={orderData.newCustomer.address}
                    onChange={(e) => setOrderData(prev => ({
                      ...prev,
                      newCustomer: { ...prev.newCustomer, address: e.target.value }
                    }))}
                  />
                </Grid>
              </Grid>
            )}
          </Box>
        );

      case 1: // Order Items
        return (
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6">Order Items</Typography>
              <Button
                startIcon={<AddCircleIcon />}
                onClick={addOrderItem}
                variant="outlined"
              >
                Add Item
              </Button>
            </Box>

            {orderData.items.map((item, index) => (
              <Paper key={index} sx={{ p: 2, mb: 2, position: 'relative' }}>
                <Box display="flex" justifyContent="between" alignItems="center" mb={2}>
                  <Typography variant="subtitle1">Item {index + 1}</Typography>
                  {orderData.items.length > 1 && (
                    <IconButton
                      color="error"
                      onClick={() => removeOrderItem(index)}
                      sx={{ position: 'absolute', top: 8, right: 8 }}
                    >
                      <RemoveCircleIcon />
                    </IconButton>
                  )}
                </Box>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      select
                      label="Item Type"
                      value={item.itemType}
                      onChange={(e) => updateOrderItem(index, 'itemType', e.target.value)}
                      required
                    >
                      {itemTypes.map((type) => (
                        <MenuItem key={type} value={type}>
                          {type}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      select
                      label="Fabric"
                      value={item.fabric}
                      onChange={(e) => updateOrderItem(index, 'fabric', e.target.value)}
                    >
                      {fabricOptions.map((fabric) => (
                        <MenuItem key={fabric} value={fabric}>
                          {fabric}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Color"
                      value={item.color}
                      onChange={(e) => updateOrderItem(index, 'color', e.target.value)}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Style"
                      value={item.specifications.style}
                      onChange={(e) => updateOrderItem(index, 'specifications.style', e.target.value)}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Price (₹)"
                      type="number"
                      value={item.price}
                      onChange={(e) => updateOrderItem(index, 'price', e.target.value)}
                      required
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Custom Notes"
                      multiline
                      rows={2}
                      value={item.specifications.customNotes}
                      onChange={(e) => updateOrderItem(index, 'specifications.customNotes', e.target.value)}
                    />
                  </Grid>
                </Grid>
              </Paper>
            ))}

            <Paper sx={{ p: 2, bgcolor: 'primary.50' }}>
              <Typography variant="h6" color="primary">
                Total Amount: ₹{calculateTotal().toLocaleString()}
              </Typography>
            </Paper>
          </Box>
        );

      case 2: // Measurements
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Measurements
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Chest (inches)"
                  type="number"
                  value={orderData.measurements.chest}
                  onChange={(e) => handleMeasurementChange('chest', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Waist (inches)"
                  type="number"
                  value={orderData.measurements.waist}
                  onChange={(e) => handleMeasurementChange('waist', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Hips (inches)"
                  type="number"
                  value={orderData.measurements.hips}
                  onChange={(e) => handleMeasurementChange('hips', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Shoulder (inches)"
                  type="number"
                  value={orderData.measurements.shoulder}
                  onChange={(e) => handleMeasurementChange('shoulder', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Sleeve Length (inches)"
                  type="number"
                  value={orderData.measurements.sleeveLength}
                  onChange={(e) => handleMeasurementChange('sleeveLength', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Collar Size (inches)"
                  type="number"
                  value={orderData.measurements.collarSize}
                  onChange={(e) => handleMeasurementChange('collarSize', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Inseam (inches)"
                  type="number"
                  value={orderData.measurements.inseam}
                  onChange={(e) => handleMeasurementChange('inseam', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Thigh (inches)"
                  type="number"
                  value={orderData.measurements.thigh}
                  onChange={(e) => handleMeasurementChange('thigh', e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Custom Measurements"
                  multiline
                  rows={2}
                  value={orderData.measurements.customMeasurements}
                  onChange={(e) => handleMeasurementChange('customMeasurements', e.target.value)}
                  placeholder="e.g. Back length: 18 inches, Arm circumference: 12 inches"
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 3: // Worker Assignment
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Assign Worker & Set Details
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Autocomplete
                  options={workers}
                  getOptionLabel={(option) => `${option.User.name} - ${option.specialization}`}
                  value={orderData.selectedWorker}
                  onChange={(event, newValue) => {
                    setOrderData(prev => ({ ...prev, selectedWorker: newValue }));
                  }}
                  renderInput={(params) => (
                    <TextField {...params} label="Select Worker" fullWidth required />
                  )}
                  renderOption={(props, option) => (
                    <Box component="li" {...props}>
                      <Avatar sx={{ mr: 2 }}>{option.User.name.charAt(0)}</Avatar>
                      <Box>
                        <Typography variant="body2">{option.User.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.specialization}
                        </Typography>
                        <Box display="flex" gap={0.5} mt={0.5}>
                          {option.skills?.slice(0, 2).map((skill, idx) => (
                            <Chip key={idx} label={skill} size="small" variant="outlined" />
                          ))}
                        </Box>
                      </Box>
                    </Box>
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  label="Priority"
                  value={orderData.priority}
                  onChange={(e) => setOrderData(prev => ({ ...prev, priority: e.target.value }))}
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </TextField>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Delivery Date"
                  type="date"
                  value={orderData.deliveryDate}
                  onChange={(e) => setOrderData(prev => ({ ...prev, deliveryDate: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Advance Payment (₹)"
                  type="number"
                  value={orderData.advancePayment}
                  onChange={(e) => setOrderData(prev => ({ ...prev, advancePayment: e.target.value }))}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Order Notes"
                  multiline
                  rows={3}
                  value={orderData.notes}
                  onChange={(e) => setOrderData(prev => ({ ...prev, notes: e.target.value }))}
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 4: // Review
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Order Review
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Customer Information
                    </Typography>
                    {orderData.isNewCustomer ? (
                      <Box>
                        <Typography variant="body2"><strong>Name:</strong> {orderData.newCustomer.name}</Typography>
                        <Typography variant="body2"><strong>Email:</strong> {orderData.newCustomer.email}</Typography>
                        <Typography variant="body2"><strong>Phone:</strong> {orderData.newCustomer.phone}</Typography>
                        {orderData.newCustomer.address && (
                          <Typography variant="body2"><strong>Address:</strong> {orderData.newCustomer.address}</Typography>
                        )}
                      </Box>
                    ) : (
                      <Box>
                        <Typography variant="body2"><strong>Name:</strong> {orderData.selectedCustomer?.User.name}</Typography>
                        <Typography variant="body2"><strong>Email:</strong> {orderData.selectedCustomer?.User.email}</Typography>
                        <Typography variant="body2"><strong>Phone:</strong> {orderData.selectedCustomer?.User.phone}</Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Assigned Worker
                    </Typography>
                    <Box>
                      <Typography variant="body2"><strong>Name:</strong> {orderData.selectedWorker?.User.name}</Typography>
                      <Typography variant="body2"><strong>Specialization:</strong> {orderData.selectedWorker?.specialization}</Typography>
                      <Box display="flex" gap={0.5} mt={1}>
                        {orderData.selectedWorker?.skills?.map((skill, idx) => (
                          <Chip key={idx} label={skill} size="small" variant="outlined" />
                        ))}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Order Items
                    </Typography>
                    <List dense>
                      {orderData.items.map((item, index) => (
                        <ListItem key={index}>
                          <ListItemText
                            primary={`${item.itemType} - ${item.fabric} ${item.color}`}
                            secondary={item.specifications.customNotes}
                          />
                          <ListItemSecondaryAction>
                            <Typography variant="body2" fontWeight="bold">
                              ₹{item.price}
                            </Typography>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                    </List>
                    <Divider />
                    <Box display="flex" justifyContent="space-between" mt={2}>
                      <Typography variant="h6">Total Amount:</Typography>
                      <Typography variant="h6" color="primary">₹{calculateTotal().toLocaleString()}</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2">Advance Payment:</Typography>
                      <Typography variant="body2">₹{orderData.advancePayment}</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2" fontWeight="bold">Balance Amount:</Typography>
                      <Typography variant="body2" fontWeight="bold">₹{(calculateTotal() - orderData.advancePayment).toLocaleString()}</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Measurements
                    </Typography>
                    <Grid container spacing={2}>
                      {Object.entries(orderData.measurements).map(([key, value]) => (
                        <Grid item xs={12} sm={6} md={3} key={key}>
                          <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                            <strong>{key.replace(/([A-Z])/g, ' $1').trim()}:</strong> {value}
                          </Typography>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        );

      default:
        return null;
    }
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
              Orders Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Create and manage tailoring orders with smart customer linking
            </Typography>
          </Box>
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{
              background: 'linear-gradient(135deg, #669BBC 0%, #669BBC 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #003049 0%, #003049 100%)',
              },
            }}
          >
            Create Order
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

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: '#669BBC' }} />,
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  select
                  label="Status Filter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="received">Received</MenuItem>
                  <MenuItem value="in-progress">In Progress</MenuItem>
                  <MenuItem value="ready">Ready</MenuItem>
                  <MenuItem value="delivered">Delivered</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </TextField>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <Box display="flex" gap={1}>
                  <Button
                    variant="outlined"
                    startIcon={<FilterIcon />}
                    fullWidth                    
                  >
                    More Filters
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </motion.div>

      {/* Orders Table */}
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
                  <TableCell>Order #</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Worker</TableCell>
                  <TableCell>Items</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Delivery Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <AnimatePresence>
                  {filteredOrders.map((order, index) => (
                    <motion.tr
                      key={order.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {order.orderNumber}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Avatar sx={{ width: 32, height: 32 }}>
                            {order.Customer?.User?.name?.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2">{order.Customer?.User?.name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {order.Customer?.User?.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <WorkIcon fontSize="small" />
                          <Typography variant="body2">
                            {order.Worker?.User?.name || 'Unassigned'}
                          </Typography>
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {order.items?.length || 0} items
                          </Typography>
                          {order.items?.slice(0, 2).map((item, idx) => (
                            <Chip
                              key={idx}
                              label={item.itemType}
                              size="small"
                              variant="outlined"
                              sx={{ mr: 0.5, mt: 0.5, fontSize: '0.75rem' }}
                            />
                          ))}
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            ₹{order.totalAmount?.toLocaleString()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Advance: ₹{order.advancePayment || 0}
                          </Typography>
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Box display="flex" gap={1} flexDirection="column">
                          <Chip 
                            label={order.status} 
                            color={getStatusColor(order.status)}
                            size="small"
                            sx={{ 
                              minWidth: 80,
                              cursor: 'pointer',
                              '&:hover': {
                                opacity: 0.8,
                                transform: 'scale(1.05)'
                              }
                            }}
                            onClick={(e) => handleStatusMenuOpen(e, order)}
                          />
                          <Chip
                            label={order.priority}
                            color={getPriorityColor(order.priority)}
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(order.deliveryDate).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      
                      <TableCell>
                        <Box display="flex" gap={1}>
                          <Tooltip title="Edit Order">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDialog(order)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title="Delete Order">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteOrder(order.id)}
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
          
          {filteredOrders.length === 0 && (
            <Box py={8} textAlign="center">
              <Typography variant="h6" color="text.secondary">
                No orders found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Try adjusting your search or filter criteria
              </Typography>
            </Box>
          )}
        </Card>
      </motion.div>

      {/* Status Change Menu */}
      <Menu
        anchorEl={statusMenuAnchor}
        open={Boolean(statusMenuAnchor)}
        onClose={handleStatusMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 200,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          }
        }}
      >
        <Box sx={{ p: 1 }}>
          <Typography variant="subtitle2" sx={{ px: 2, py: 1, color: 'text.secondary' }}>
            Change Status
          </Typography>
          {statusOptions.map((option) => (
            <MenuItem 
              key={option.value}
              onClick={() => handleQuickStatusUpdate(option.value)}
              disabled={option.value === selectedOrderForMenu?.status}
              sx={{
                borderRadius: 1,
                mx: 1,
                my: 0.5,
                '&:hover': {
                  bgcolor: `${option.color === 'default' ? 'grey' : option.color}.50`
                }
              }}
            >
              <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
                <Chip
                  label={option.label}
                  color={option.color}
                  size="small"
                  variant={option.value === selectedOrderForMenu?.status ? "filled" : "outlined"}
                />
                {option.value === selectedOrderForMenu?.status && (
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                    Current
                  </Typography>
                )}
              </Box>
            </MenuItem>
          ))}
        </Box>
      </Menu>

      {/* Create/Edit Order Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { minHeight: '80vh' }
        }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <OrderIcon />
            {editingOrder ? 'Edit Order' : 'Create New Order'}
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ width: '100%', mt: 2 }}>
            <Stepper activeStep={activeStep}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
            
            <Box sx={{ mt: 3, mb: 2 }}>
              {renderStepContent(activeStep)}
            </Box>

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
        
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseDialog} startIcon={<CancelIcon />}>
            Cancel
          </Button>
          
          <Box sx={{ flex: '1 1 auto' }} />
          
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            sx={{ mr: 1 }}
          >
            Back
          </Button>
          
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleSubmitOrder}
              disabled={loading}
              startIcon={<SaveIcon />}
            >
              {loading 
                ? (editingOrder ? 'Updating...' : 'Creating...')
                : (editingOrder ? 'Update Order' : 'Create Order')
              }
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={!validateStep(activeStep)}
            >
              Next
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Orders;
