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
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  Tooltip,
  Switch,
  FormControlLabel,
  Divider,
  Badge,
  Menu,
  ListItemIcon,
  ListItemText,
  Paper,
  LinearProgress,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Work as WorkIcon,
  Star as StarIcon,
  Assignment as AssignmentIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Circle as CircleIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Timeline as TimelineIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const Workers = () => {
  const [workers, setWorkers] = useState([]);
  const [filteredWorkers, setFilteredWorkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingWorker, setEditingWorker] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [searchBy, setSearchBy] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [specializationFilter, setSpecializationFilter] = useState('all');
  const [paymentTypeFilter, setPaymentTypeFilter] = useState('all');

  // Status menu states
  const [statusMenuAnchor, setStatusMenuAnchor] = useState(null);
  const [selectedWorkerForStatus, setSelectedWorkerForStatus] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    skills: [],
    paymentType: 'hourly',
    hourlyRate: '',
    monthlyFee: '',
    pieceRate: '',
    specialization: '',
    experience: '',
    status: 'available',
    address: '',
    emergencyContact: '',
    joinDate: new Date().toISOString().split('T')[0],
    isActive: true,
    workingHours: {
      start: '09:00',
      end: '18:00',
      daysPerWeek: 6
    },
    performanceMetrics: {
      completedOrders: 0,
      averageRating: 0,
      onTimeDelivery: 0
    }
  });

  const searchOptions = [
    { value: 'all', label: 'All Fields' },
    { value: 'name', label: 'Name' },
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Phone' },
    { value: 'specialization', label: 'Specialization' },
    { value: 'skills', label: 'Skills' },
  ];

  const skillOptions = [
    'Shirt Making',
    'Pant Tailoring',
    'Suit Construction',
    'Blazer Making',
    'Alterations',
    'Pattern Making',
    'Embroidery',
    'Button Hole Making',
    'Hand Stitching',
    'Machine Operation',
    'Cutting',
    'Pressing & Finishing'
  ];

  const specializationOptions = [
    'Men\'s Formal Wear',
    'Women\'s Formal Wear',
    'Wedding Suits',
    'Casual Wear',
    'Alterations Specialist',
    'Custom Designs',
    'Traditional Wear',
    'Designer Clothing'
  ];

  const statusOptions = [
    { value: 'available', label: 'Available', color: 'success', icon: CheckCircleIcon },
    { value: 'busy', label: 'Busy', color: 'warning', icon: WarningIcon },
    { value: 'on_break', label: 'On Break', color: 'info', icon: ScheduleIcon },
    { value: 'offline', label: 'Offline', color: 'error', icon: CircleIcon }
  ];

  useEffect(() => {
    fetchWorkers();
    const interval = setInterval(fetchWorkers, 30000);
    return () => clearInterval(interval);
  }, []);

  // Filter workers based on search and filters
  useEffect(() => {
    let filtered = [...workers];

    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(worker => {
        const searchLower = searchTerm.toLowerCase();
        const user = worker.User;
        
        switch (searchBy) {
          case 'name':
            return user?.name?.toLowerCase().includes(searchLower);
          case 'email':
            return user?.email?.toLowerCase().includes(searchLower);
          case 'phone':
            return user?.phone?.toLowerCase().includes(searchLower);
          case 'specialization':
            return worker.specialization?.toLowerCase().includes(searchLower);
          case 'skills':
            return worker.skills?.some(skill => skill.toLowerCase().includes(searchLower));
          default: // 'all'
            return (
              user?.name?.toLowerCase().includes(searchLower) ||
              user?.email?.toLowerCase().includes(searchLower) ||
              user?.phone?.toLowerCase().includes(searchLower) ||
              worker.specialization?.toLowerCase().includes(searchLower) ||
              worker.skills?.some(skill => skill.toLowerCase().includes(searchLower)) ||
              worker.address?.toLowerCase().includes(searchLower)
            );
        }
      });
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(worker => worker.status === statusFilter);
    }

    // Apply specialization filter
    if (specializationFilter !== 'all') {
      filtered = filtered.filter(worker => worker.specialization === specializationFilter);
    }

    // Apply payment type filter
    if (paymentTypeFilter !== 'all') {
      filtered = filtered.filter(worker => worker.paymentType === paymentTypeFilter);
    }

    setFilteredWorkers(filtered);
  }, [workers, searchTerm, searchBy, statusFilter, specializationFilter, paymentTypeFilter]);

  const fetchWorkers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setWorkers([
          {
            id: 1,
            User: {
              name: 'John Taylor',
              email: 'john.taylor@suitsync.com',
              phone: '8876543210'
            },
            skills: ['Shirt Making', 'Suit Construction', 'Alterations'],
            paymentType: 'hourly',
            hourlyRate: 25.00,
            monthlyFee: null,
            pieceRate: null,
            specialization: 'Men\'s Formal Wear',
            experience: 5,
            status: 'available',
            address: '123 Worker St, City',
            emergencyContact: '9876543210',
            joinDate: '2023-01-15',
            isActive: true,
            workingHours: {
              start: '09:00',
              end: '18:00',
              daysPerWeek: 6
            },
            performanceMetrics: {
              completedOrders: 45,
              averageRating: 4.5,
              onTimeDelivery: 92
            },
            currentOrders: 3
          },
          {
            id: 2,
            User: {
              name: 'Maria Rodriguez',
              email: 'maria@suitsync.com',
              phone: '8876543211'
            },
            skills: ['Pattern Making', 'Women\'s Formal Wear', 'Custom Designs'],
            paymentType: 'monthly',
            hourlyRate: null,
            monthlyFee: 15000,
            pieceRate: null,
            specialization: 'Women\'s Formal Wear',
            experience: 8,
            status: 'busy',
            address: '456 Tailor Ave, City',
            emergencyContact: '9876543211',
            joinDate: '2022-03-10',
            isActive: true,
            workingHours: {
              start: '08:30',
              end: '17:30',
              daysPerWeek: 5
            },
            performanceMetrics: {
              completedOrders: 78,
              averageRating: 4.8,
              onTimeDelivery: 96
            },
            currentOrders: 5
          },
          {
            id: 3,
            User: {
              name: 'Ahmed Khan',
              email: 'ahmed@suitsync.com',
              phone: '8876543212'
            },
            skills: ['Embroidery', 'Traditional Wear', 'Hand Stitching'],
            paymentType: 'per_piece',
            hourlyRate: null,
            monthlyFee: null,
            pieceRate: 150,
            specialization: 'Traditional Wear',
            experience: 12,
            status: 'on_break',
            address: '789 Craft Lane, City',
            emergencyContact: '9876543212',
            joinDate: '2021-06-20',
            isActive: true,
            workingHours: {
              start: '10:00',
              end: '19:00',
              daysPerWeek: 6
            },
            performanceMetrics: {
              completedOrders: 120,
              averageRating: 4.9,
              onTimeDelivery: 89
            },
            currentOrders: 2
          }
        ]);
        return;
      }
      const response = await axios.get('http://localhost:3001/api/workers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setWorkers(response.data.workers);
      }
    } catch (error) {
      console.error('Error fetching workers:', error);
      // Enhanced sample data for demonstration
      setWorkers([
        {
          id: 1,
          User: {
            name: 'John Taylor',
            email: 'john.taylor@suitsync.com',
            phone: '8876543210'
          },
          skills: ['Shirt Making', 'Suit Construction', 'Alterations'],
          paymentType: 'hourly',
          hourlyRate: 25.00,
          monthlyFee: null,
          pieceRate: null,
          specialization: 'Men\'s Formal Wear',
          experience: 5,
          status: 'available',
          address: '123 Worker St, City',
          emergencyContact: '9876543210',
          joinDate: '2023-01-15',
          isActive: true,
          workingHours: {
            start: '09:00',
            end: '18:00',
            daysPerWeek: 6
          },
          performanceMetrics: {
            completedOrders: 45,
            averageRating: 4.5,
            onTimeDelivery: 92
            },
            currentOrders: 3
          },
          {
            id: 2,
            User: {
              name: 'Maria Rodriguez',
              email: 'maria@suitsync.com',
              phone: '8876543211'
            },
            skills: ['Pattern Making', 'Women\'s Formal Wear', 'Custom Designs'],
            paymentType: 'monthly',
            hourlyRate: null,
            monthlyFee: 15000,
            pieceRate: null,
            specialization: 'Women\'s Formal Wear',
            experience: 8,
            status: 'busy',
            address: '456 Tailor Ave, City',
            emergencyContact: '9876543211',
            joinDate: '2022-03-10',
            isActive: true,
            workingHours: {
              start: '08:30',
              end: '17:30',
              daysPerWeek: 5
            },
            performanceMetrics: {
              completedOrders: 78,
              averageRating: 4.8,
              onTimeDelivery: 96
            },
            currentOrders: 5
          },
          {
            id: 3,
            User: {
              name: 'Ahmed Khan',
              email: 'ahmed@suitsync.com',
              phone: '8876543212'
            },
            skills: ['Embroidery', 'Traditional Wear', 'Hand Stitching'],
            paymentType: 'per_piece',
            hourlyRate: null,
            monthlyFee: null,
            pieceRate: 150,
            specialization: 'Traditional Wear',
            experience: 12,
            status: 'on_break',
            address: '789 Craft Lane, City',
            emergencyContact: '9876543212',
            joinDate: '2021-06-20',
            isActive: true,
            workingHours: {
              start: '10:00',
              end: '19:00',
              daysPerWeek: 6
            },
            performanceMetrics: {
              completedOrders: 120,
              averageRating: 4.9,
              onTimeDelivery: 89
            },
            currentOrders: 2
          }
      ]);
    }
  };

  // Status menu handlers
  const handleStatusMenuOpen = (event, worker) => {
    event.stopPropagation();
    setStatusMenuAnchor(event.currentTarget);
    setSelectedWorkerForStatus(worker);
  };

  const handleStatusMenuClose = () => {
    setStatusMenuAnchor(null);
    setSelectedWorkerForStatus(null);
  };

  const handleQuickStatusUpdate = async (newStatus) => {
    if (!selectedWorkerForStatus) return;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found. Please login.');
        return;
      }
      
      const response = await axios.put(
        `http://localhost:3001/api/workers/${selectedWorkerForStatus.id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setSuccess('Worker status updated successfully!');
        fetchWorkers();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      setError('Failed to update worker status');
      setTimeout(() => setError(''), 3000);
    }
    
    handleStatusMenuClose();
  };

  const handleOpenDialog = (worker = null) => {
    if (worker) {
      setEditingWorker(worker);
      setFormData({
        name: worker.User.name,
        email: worker.User.email,
        phone: worker.User.phone,
        skills: worker.skills || [],
        paymentType: worker.paymentType || 'hourly',
        hourlyRate: worker.hourlyRate || '',
        monthlyFee: worker.monthlyFee || '',
        pieceRate: worker.pieceRate || '',
        specialization: worker.specialization || '',
        experience: worker.experience || '',
        status: worker.status || 'available',
        address: worker.address || '',
        emergencyContact: worker.emergencyContact || '',
        joinDate: worker.joinDate || new Date().toISOString().split('T')[0],
        isActive: worker.isActive !== undefined ? worker.isActive : true,
        workingHours: worker.workingHours || {
          start: '09:00',
          end: '18:00',
          daysPerWeek: 6
        },
        performanceMetrics: worker.performanceMetrics || {
          completedOrders: 0,
          averageRating: 0,
          onTimeDelivery: 0
        }
      });
    } else {
      setEditingWorker(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        skills: [],
        paymentType: 'hourly',
        hourlyRate: '',
        monthlyFee: '',
        pieceRate: '',
        specialization: '',
        experience: '',
        status: 'available',
        address: '',
        emergencyContact: '',
        joinDate: new Date().toISOString().split('T')[0],
        isActive: true,
        workingHours: {
          start: '09:00',
          end: '18:00',
          daysPerWeek: 6
        },
        performanceMetrics: {
          completedOrders: 0,
          averageRating: 0,
          onTimeDelivery: 0
        }
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingWorker(null);
    setError('');
    setSuccess('');
  };

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
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
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      
      if (editingWorker) {
        const response = await axios.put(
          `http://localhost:3001/api/workers/${editingWorker.id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (response.data.success) {
          setSuccess('Worker updated successfully!');
          fetchWorkers();
          setTimeout(handleCloseDialog, 1500);
        }
      } else {
        const workerData = {
          ...formData,
          role: 'worker'
        };

        const response = await axios.post(
          'http://localhost:3001/api/auth/register',
          workerData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (response.data.success) {
          setSuccess('Worker created successfully!');
          fetchWorkers();
          setTimeout(handleCloseDialog, 1500);
        }
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (workerId) => {
  // Add confirmation dialog
  const confirmDelete = window.confirm(
    'Are you sure you want to delete this worker? This action cannot be undone and will unassign them from any current orders.'
  );
  
  if (!confirmDelete) {
    return;
  }

  try {
    console.log('Attempting to delete worker:', workerId);
    
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Authentication token not found. Please login again.');
      return;
    }

    const response = await axios.delete(
      `http://localhost:3001/api/workers/${workerId}`, 
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    
    console.log('Delete response:', response.data);
    
    if (response.data.success) {
      setSuccess('Worker deleted successfully!');
      // Refresh the workers list
      fetchWorkers();
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(response.data.message || 'Failed to delete worker');
      setTimeout(() => setError(''), 3000);
    }
    
  } catch (error) {
    console.error('Delete worker error:', error);
    console.error('Error details:', error.response?.data);
    
    const errorMessage = error.response?.data?.message || 
                        error.message || 
                        'Failed to delete worker';
    
    setError(errorMessage);
    setTimeout(() => setError(''), 3000);
  }
};


  const getStatusColor = (status) => {
    const colors = {
      'available': 'success',
      'busy': 'warning',
      'on_break': 'info',
      'offline': 'error'
    };
    return colors[status] || 'default';
  };

  const getPaymentDisplay = (worker) => {
    switch (worker.paymentType) {
      case 'monthly':
        return `₹${worker.monthlyFee?.toLocaleString()}/month`;
      case 'per_piece':
        return `₹${worker.pieceRate}/piece`;
      default:
        return `₹${worker.hourlyRate}/hr`;
    }
  };

  const getPerformanceColor = (percentage) => {
    if (percentage >= 90) return 'success';
    if (percentage >= 75) return 'warning';
    return 'error';
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSearchBy('all');
    setStatusFilter('all');
    setSpecializationFilter('all');
    setPaymentTypeFilter('all');
  };

  const getUniqueSpecializations = () => {
    const specializations = workers.map(w => w.specialization).filter(Boolean);
    return [...new Set(specializations)];
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
              Worker Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your tailoring team with auto status updates, flexible payment options, and advanced search
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
            Add Worker
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

      {/* Search and Filters Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Search & Filter Workers
            </Typography>
            
            {/* Search Row */}
            <Grid container spacing={2} alignItems="center" mb={2}>
              <Grid item xs={12} md={3}>
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
                  placeholder={`Search workers by ${searchBy === 'all' ? 'name, email, phone, specialization, or skills' : searchBy}...`}
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
                        <IconButton size="small" onClick={() => setSearchTerm('')}>
                          <ClearIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={3}>
                <Box display="flex" gap={1} alignItems="center">
                  <Chip 
                    label={`${filteredWorkers.length} found`}
                    color="primary" 
                    variant="outlined"
                  />
                  <Tooltip title="Clear all filters">
                    <IconButton size="small" onClick={clearAllFilters}>
                      <FilterIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Grid>
            </Grid>

            {/* Filter Row */}
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  select
                  label="Status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  size="small"
                >
                  <MenuItem value="all">All Status</MenuItem>
                  {statusOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  select
                  label="Specialization"
                  value={specializationFilter}
                  onChange={(e) => setSpecializationFilter(e.target.value)}
                  size="small"
                >
                  <MenuItem value="all">All Specializations</MenuItem>
                  {getUniqueSpecializations().map((spec) => (
                    <MenuItem key={spec} value={spec}>
                      {spec}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  select
                  label="Payment Type"
                  value={paymentTypeFilter}
                  onChange={(e) => setPaymentTypeFilter(e.target.value)}
                  size="small"
                >
                  <MenuItem value="all">All Payment Types</MenuItem>
                  <MenuItem value="hourly">Hourly</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                  <MenuItem value="per_piece">Per Piece</MenuItem>
                </TextField>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={clearAllFilters}
                  startIcon={<ClearIcon />}
                  size="small"
                >
                  Clear Filters
                </Button>
              </Grid>
            </Grid>
            
            {(searchTerm || statusFilter !== 'all' || specializationFilter !== 'all' || paymentTypeFilter !== 'all') && (
              <Box mt={2}>
                <Typography variant="body2" color="text.secondary">
                  Showing {filteredWorkers.length} of {workers.length} workers
                  {searchTerm && ` matching "${searchTerm}"`}
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Workers Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Worker</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Skills & Specialization</TableCell>
                  <TableCell>Payment</TableCell>
                  <TableCell>Performance</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Current Load</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <AnimatePresence>
                  {filteredWorkers.map((worker, index) => (
                    <motion.tr
                      key={worker.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Badge
                            overlap="circular"
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                            badgeContent={
                              <Box
                                sx={{
                                  width: 12,
                                  height: 12,
                                  borderRadius: '50%',
                                  bgcolor: worker.status === 'available' ? 'success.main' : 
                                           worker.status === 'busy' ? 'warning.main' :
                                           worker.status === 'on_break' ? 'info.main' : 'error.main',
                                  border: '2px solid white'
                                }}
                              />
                            }
                          >
                            <Avatar sx={{ bgcolor: 'secondary.main', width: 50, height: 50 }}>
                              {worker.User.name.charAt(0)}
                            </Avatar>
                          </Badge>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {worker.User.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {worker.experience} years exp • Joined {new Date(worker.joinDate).getFullYear()}
                            </Typography>
                            <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
                              <StarIcon sx={{ fontSize: 14, color: 'warning.main' }} />
                              <Typography variant="caption">
                                {worker.performanceMetrics?.averageRating || 0}/5
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Box>
                          <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                            <EmailIcon fontSize="small" color="action" />
                            <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                              {worker.User.email}
                            </Typography>
                          </Box>
                          <Box display="flex" alignItems="center" gap={1}>
                            <PhoneIcon fontSize="small" color="action" />
                            <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                              {worker.User.phone}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="medium" gutterBottom>
                            {worker.specialization}
                          </Typography>
                          <Box display="flex" flexWrap="wrap" gap={0.5} maxWidth={200}>
                            {worker.skills?.slice(0, 2).map((skill, idx) => (
                              <Chip
                                key={idx}
                                label={skill}
                                size="small"
                                variant="outlined"
                                sx={{ fontSize: '0.75rem' }}
                              />
                            ))}
                            {worker.skills?.length > 2 && (
                              <Chip
                                label={`+${worker.skills.length - 2}`}
                                size="small"
                                variant="outlined"
                                color="primary"
                              />
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Box>
                          <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                            <MoneyIcon fontSize="small" color="action" />
                            <Typography variant="body2" fontWeight="medium">
                              {getPaymentDisplay(worker)}
                            </Typography>
                          </Box>
                          <Chip
                            label={worker.paymentType?.replace('_', ' ') || 'hourly'}
                            size="small"
                            variant="outlined"
                            color="primary"
                            sx={{ textTransform: 'capitalize' }}
                          />
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Box>
                          <Box display="flex" alignItems="center" gap={1} mb={1}>
                            <TrendingUpIcon fontSize="small" color="success" />
                            <Typography variant="caption">
                              {worker.performanceMetrics?.completedOrders || 0} orders
                            </Typography>
                          </Box>
                          <Box mb={1}>
                            <Typography variant="caption" color="text.secondary">
                              On-time delivery
                            </Typography>
                            <LinearProgress
                              variant="determinate"
                              value={worker.performanceMetrics?.onTimeDelivery || 0}
                              color={getPerformanceColor(worker.performanceMetrics?.onTimeDelivery || 0)}
                              sx={{ height: 4, borderRadius: 2 }}
                            />
                            <Typography variant="caption" color="text.secondary">
                              {worker.performanceMetrics?.onTimeDelivery || 0}%
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Chip 
                          label={worker.status?.replace('_', ' ') || 'available'}
                          color={getStatusColor(worker.status)}
                          size="small"
                          sx={{ 
                            textTransform: 'capitalize',
                            cursor: 'pointer',
                            '&:hover': {
                              opacity: 0.8,
                              transform: 'scale(1.05)'
                            }
                          }}
                          onClick={(e) => handleStatusMenuOpen(e, worker)}
                        />
                      </TableCell>
                      
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <AssignmentIcon fontSize="small" color="action" />
                          <Typography variant="body2">
                            {worker.currentOrders || 0} active
                          </Typography>
                          {worker.currentOrders > 4 && (
                            <Chip
                              label="High Load"
                              size="small"
                              color="warning"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Box display="flex" gap={1}>
                          <Tooltip title="Edit Worker">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDialog(worker)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title="View Performance">
                            <IconButton
                              size="small"
                              color="info"
                            >
                              <TimelineIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title="Delete Worker">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDelete(worker.id)}
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
          
          {filteredWorkers.length === 0 && !loading && (
            <Box py={8} textAlign="center">
              <Typography variant="h6" color="text.secondary">
                {searchTerm || statusFilter !== 'all' || specializationFilter !== 'all' || paymentTypeFilter !== 'all' 
                  ? 'No workers found matching your filters' 
                  : 'No workers found'
                }
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {searchTerm || statusFilter !== 'all' || specializationFilter !== 'all' || paymentTypeFilter !== 'all'
                  ? 'Try adjusting your search criteria or filters'
                  : 'Add your first worker to get started'
                }
              </Typography>
              {(searchTerm || statusFilter !== 'all' || specializationFilter !== 'all' || paymentTypeFilter !== 'all') && (
                <Button onClick={clearAllFilters} sx={{ mt: 2 }}>
                  Clear All Filters
                </Button>
              )}
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
          {statusOptions.map((option) => {
            const IconComponent = option.icon;
            return (
              <MenuItem 
                key={option.value}
                onClick={() => handleQuickStatusUpdate(option.value)}
                disabled={option.value === selectedWorkerForStatus?.status}
                sx={{
                  borderRadius: 1,
                  mx: 1,
                  my: 0.5,
                  '&:hover': {
                    bgcolor: `${option.color === 'default' ? 'grey' : option.color}.50`
                  }
                }}
              >
                <ListItemIcon>
                  <IconComponent fontSize="small" />
                </ListItemIcon>
                <ListItemText>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Typography variant="body2">{option.label}</Typography>
                    {option.value === selectedWorkerForStatus?.status && (
                      <Typography variant="caption" color="text.secondary">
                        Current
                      </Typography>
                    )}
                  </Box>
                </ListItemText>
              </MenuItem>
            );
          })}
        </Box>
      </Menu>

      {/* Add/Edit Worker Dialog - Integrated form */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <PersonIcon />
            {editingWorker ? 'Edit Worker' : 'Add New Worker'}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box py={2}>
            {/* Basic Information */}
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Basic Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
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
                      label="Emergency Contact"
                      value={formData.emergencyContact}
                      onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                    />
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
                </Grid>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Payment Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      select
                      label="Payment Type"
                      value={formData.paymentType}
                      onChange={(e) => handleInputChange('paymentType', e.target.value)}
                    >
                      <MenuItem value="hourly">Hourly Rate</MenuItem>
                      <MenuItem value="monthly">Monthly Salary</MenuItem>
                      <MenuItem value="per_piece">Per Piece Rate</MenuItem>
                    </TextField>
                  </Grid>
                  
                  {formData.paymentType === 'hourly' && (
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Hourly Rate (₹)"
                        type="number"
                        value={formData.hourlyRate}
                        onChange={(e) => handleInputChange('hourlyRate', e.target.value)}
                      />
                    </Grid>
                  )}
                  
                  {formData.paymentType === 'monthly' && (
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Monthly Salary (₹)"
                        type="number"
                        value={formData.monthlyFee}
                        onChange={(e) => handleInputChange('monthlyFee', e.target.value)}
                      />
                    </Grid>
                  )}
                  
                  {formData.paymentType === 'per_piece' && (
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Rate Per Piece (₹)"
                        type="number"
                        value={formData.pieceRate}
                        onChange={(e) => handleInputChange('pieceRate', e.target.value)}
                      />
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>

            {/* Professional Information */}
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Professional Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel >Skills</InputLabel>
                      <Select
                        multiple
                        value={formData.skills}
                        onChange={(e) => handleInputChange('skills', e.target.value)}
                        
                        input={<OutlinedInput label="Skills" />}
                        renderValue={(selected) => (
                          <Box  sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {selected.map((value) => (
                              <Chip key={value}  label={value} size="large" />
                            ))}
                          </Box>
                        )}
                        MenuProps={{
                          PaperProps: {
                            sx: {
                              '& .MuiMenu-list': {
                                minHeight: 200, // Decent size for the dropdown menu
                              },
                            },
                          },
                        }}
                      >
                        {skillOptions.map((skill) => (
                          <MenuItem key={skill} value={skill}>
                            {skill}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      select
                      label="Specialization"
                      value={formData.specialization}
                      onChange={(e) => handleInputChange('specialization', e.target.value)}
                      SelectProps={{
                        MenuProps: {
                          PaperProps: {
                            sx: {
                              '& .MuiMenu-list': {
                                minHeight: 200, // Decent size for the dropdown menu
                              },
                            },
                          },
                        },
                      }}
                    >
                      {specializationOptions.map((spec) => (
                        <MenuItem key={spec} value={spec}>
                          {spec}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Experience (Years)"
                      type="number"
                      value={formData.experience}
                      onChange={(e) => handleInputChange('experience', e.target.value)}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Join Date"
                      type="date"
                      value={formData.joinDate}
                      onChange={(e) => handleInputChange('joinDate', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Working Hours and Status */}
            <Card variant="outlined">
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Working Hours
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Start Time"
                      type="time"
                      value={formData.workingHours.start}
                      onChange={(e) => handleInputChange('workingHours.start', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="End Time"
                      type="time"
                      value={formData.workingHours.end}
                      onChange={(e) => handleInputChange('workingHours.end', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Days Per Week"
                      type="number"
                      inputProps={{ min: 1, max: 7 }}
                      value={formData.workingHours.daysPerWeek}
                      onChange={(e) => handleInputChange('workingHours.daysPerWeek', e.target.value)}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                      Status & Settings
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      select
                      label="Current Status"
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                    >
                      {statusOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.isActive}
                          onChange={(e) => handleInputChange('isActive', e.target.checked)}
                        />
                      }
                      label="Active Worker"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

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
            {loading ? 'Saving...' : editingWorker ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Workers;
