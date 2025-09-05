import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import {
    Box, Typography, Card, CardContent, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Button, IconButton, Dialog,
    DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Grid,
    Avatar, Chip, Alert, Autocomplete, FormControl, Step, Stepper,
    StepLabel, Paper, List, ListItem, ListItemText, ListItemSecondaryAction,
    Tooltip, Menu, Divider, ThemeProvider, CssBaseline, useTheme
} from '@mui/material';
import {
    Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Work as WorkIcon,
    ShoppingBag as OrderIcon, Save as SaveIcon, Cancel as CancelIcon,
    AddCircle as AddCircleIcon, RemoveCircle as RemoveCircleIcon,
    Search as SearchIcon, FilterList as FilterIcon, Print as PrintIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import Invoice from './Invoice'; // Your invoice component
import theme from '../../theme'; // Import your custom theme

const Orders = () => {
    // Component State
    const [orders, setOrders] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // --- **NEW ROBUST PRINT LOGIC** ---
    const handlePrintInvoice = async (orderId) => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:3001/api/orders/${orderId}/invoice`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                const invoiceData = response.data.invoice;
                const printWindow = window.open('', '_blank', 'height=700,width=900');

                if (printWindow) {
                    printWindow.document.write('<div id="print-root"></div>');
                    printWindow.document.close();

                    const printRoot = printWindow.document.getElementById('print-root');
                    const root = createRoot(printRoot);

                    // Render the Invoice component into the new window
                    // We wrap it in ThemeProvider and CssBaseline to ensure styles are applied
                    root.render(
                        <React.StrictMode>
                            <ThemeProvider theme={theme}>
                                <CssBaseline />
                                <Invoice invoiceData={invoiceData} />
                            </ThemeProvider>
                        </React.StrictMode>
                    );

                    // Wait for content to render, then print
                    setTimeout(() => {
                        printWindow.print();
                        printWindow.close();
                    }, 500);
                } else {
                    setError('Could not open print window. Please disable pop-up blockers.');
                }
            } else {
                setError('Failed to fetch invoice data.');
            }
        } catch (err) {
            setError('An error occurred while preparing the invoice.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    // --- **END OF NEW PRINT LOGIC** ---

    // The rest of your component's state and logic
    const [openDialog, setOpenDialog] = useState(false);
    const [editingOrder, setEditingOrder] = useState(null);
    const [activeStep, setActiveStep] = useState(0);
    const [statusMenuAnchor, setStatusMenuAnchor] = useState(null);
    const [selectedOrderForMenu, setSelectedOrderForMenu] = useState(null);

    const initialOrderState = {
        selectedCustomer: null, newCustomer: { name: '', email: '', phone: '', address: '' }, isNewCustomer: false,
        items: [{ itemType: '', fabric: '', color: '', specifications: { style: '', collar: '', sleeves: '', pockets: '', customNotes: '' }, price: 0 }],
        selectedWorker: null, priority: 'medium', deliveryDate: '', notes: '', advancePayment: 0,
        measurements: { chest: '', waist: '', hips: '', shoulder: '', sleeveLength: '', collarSize: '', inseam: '', thigh: '', customMeasurements: '' }
    };

    const [orderData, setOrderData] = useState(initialOrderState);

    const steps = ['Customer', 'Order Items', 'Measurements', 'Assignment', 'Review & Submit'];
    const itemTypes = ['Shirt', 'Pant', 'Suit', 'Blazer', 'Waistcoat', 'Kurta', 'Sherwani', 'Alterations'];
    const fabricOptions = ['Cotton', 'Linen', 'Wool', 'Silk', 'Polyester', 'Viscose', 'Cotton Blend', 'Wool Blend'];
    const statusOptions = [
        { value: 'received', label: 'Received', color: 'info' }, { value: 'in-progress', label: 'In Progress', color: 'warning' },
        { value: 'ready', label: 'Ready', color: 'success' }, { value: 'delivered', label: 'Delivered', color: 'default' },
        { value: 'cancelled', label: 'Cancelled', color: 'error' }
    ];

    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const [ordersRes, customersRes, workersRes] = await Promise.all([
                    axios.get('http://localhost:3001/api/orders', { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get('http://localhost:3001/api/customers', { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get('http://localhost:3001/api/workers', { headers: { Authorization: `Bearer ${token}` } })
                ]);
                if (ordersRes.data.success) setOrders(ordersRes.data.orders);
                if (customersRes.data.success) setCustomers(customersRes.data.customers);
                if (workersRes.data.success) setWorkers(workersRes.data.workers);
            } catch (err) {
                setError('Failed to load initial data.');
            } finally {
                setLoading(false);
            }
        };
        fetchAllData();
    }, []);

    const handleOpenDialog = (order = null) => {
        if (order) {
            setEditingOrder(order);
            setOrderData({
                selectedCustomer: order.Customer,
                newCustomer: initialOrderState.newCustomer,
                isNewCustomer: false,
                items: order.items || [initialOrderState.items[0]],
                selectedWorker: order.Worker,
                priority: order.priority || 'medium',
                deliveryDate: order.deliveryDate ? order.deliveryDate.split('T')[0] : '',
                notes: order.notes || '',
                advancePayment: order.advancePayment || 0,
                measurements: order.measurements?.[0] || initialOrderState.measurements,
            });
        } else {
            setEditingOrder(null);
            setOrderData(initialOrderState);
        }
        setActiveStep(0);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => { setOpenDialog(false); setEditingOrder(null); setOrderData(initialOrderState); };
    const handleStatusMenuOpen = (event, order) => { event.stopPropagation(); setStatusMenuAnchor(event.currentTarget); setSelectedOrderForMenu(order); };
    const handleStatusMenuClose = () => setStatusMenuAnchor(null);
    const handleQuickStatusUpdate = async (newStatus) => {
        if (!selectedOrderForMenu) return;
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:3001/api/orders/${selectedOrderForMenu.id}/status`, { status: newStatus }, { headers: { Authorization: `Bearer ${token}` } });
            setSuccess('Order status updated!');
            const updatedOrders = orders.map(o => o.id === selectedOrderForMenu.id ? { ...o, status: newStatus } : o);
            setOrders(updatedOrders);
        } catch (err) {
            setError('Failed to update status.');
        } finally {
            handleStatusMenuClose();
        }
    };
    const handleNext = () => setActiveStep(prev => prev + 1);
    const handleBack = () => setActiveStep(prev => prev - 1);
    const addOrderItem = () => { setOrderData(prev => ({ ...prev, items: [...prev.items, { itemType: '', fabric: '', color: '', specifications: {}, price: 0 }] })); };
    const removeOrderItem = (index) => { setOrderData(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) })); };
    const updateOrderItem = (index, field, value) => {
        const updatedItems = JSON.parse(JSON.stringify(orderData.items)); // Deep copy
        const keys = field.split('.');
        if (keys.length > 1) {
            if (!updatedItems[index][keys[0]]) updatedItems[index][keys[0]] = {};
            updatedItems[index][keys[0]][keys[1]] = value;
        } else {
            updatedItems[index][field] = value;
        }
        setOrderData(prev => ({ ...prev, items: updatedItems }));
    };
    const handleMeasurementChange = (field, value) => { setOrderData(prev => ({ ...prev, measurements: { ...prev.measurements, [field]: value } })); };
    const calculateTotal = () => orderData.items.reduce((total, item) => total + (parseFloat(item.price) || 0), 0);
    const handleSubmitOrder = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const totalAmount = calculateTotal();
            const submitData = { ...orderData, totalAmount, balanceAmount: totalAmount - (orderData.advancePayment || 0) };
            const apiUrl = editingOrder ? `http://localhost:3001/api/orders/${editingOrder.id}` : 'http://localhost:3001/api/orders/create-with-customer';
            const method = editingOrder ? 'put' : 'post';
            const response = await axios[method](apiUrl, submitData, { headers: { Authorization: `Bearer ${token}` } });
            if (response.data.success) {
                setSuccess(editingOrder ? 'Order updated!' : 'Order created!');
                handleCloseDialog();
                await fetchOrders();
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Operation failed');
        } finally {
            setLoading(false);
        }
    };
    const handleDeleteOrder = async (orderId) => {
        if (!window.confirm('Are you sure you want to delete this order?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:3001/api/orders/${orderId}`, { headers: { Authorization: `Bearer ${token}` } });
            setSuccess('Order deleted!');
            setOrders(orders.filter(o => o.id !== orderId));
        } catch (err) {
            setError('Failed to delete order.');
        }
    };

    const getStatusColor = (status) => (statusOptions.find(opt => opt.value === status)?.color || 'default');
    const filteredOrders = orders.filter(order =>
        (order.Customer?.User?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (statusFilter === 'all' || order.status === statusFilter)
    );
    
    const renderStepContent = (step) => {
        // Your full multi-step form logic goes here
        return <Box p={2}><Typography>Your multi-step form for step {step + 1} appears here.</Typography></Box>;
    };

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" fontWeight="bold">Orders Management</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>Create Order</Button>
            </Box>

            <AnimatePresence>
                {(success || error) && (
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                        <Alert severity={success ? 'success' : 'error'} onClose={() => { setSuccess(''); setError(''); }} sx={{ mb: 2 }}>
                            {success || error}
                        </Alert>
                    </motion.div>
                )}
            </AnimatePresence>

            <Card sx={{ mb: 3, p: 2 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={6}>
                        <TextField fullWidth placeholder="Search by customer name or order #" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} InputProps={{ startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} /> }} />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <TextField fullWidth select label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                            <MenuItem value="all">All Statuses</MenuItem>
                            {statusOptions.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
                        </TextField>
                    </Grid>
                </Grid>
            </Card>

            <Card>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Order #</TableCell>
                                <TableCell>Customer</TableCell>
                                <TableCell>Worker</TableCell>
                                <TableCell>Amount</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Delivery Date</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredOrders.map(order => (
                                <TableRow key={order.id} hover>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight="bold">{order.orderNumber}</Typography>
                                        <Typography variant="caption" color="text.secondary">{new Date(order.createdAt).toLocaleDateString()}</Typography>
                                    </TableCell>
                                    <TableCell>{order.Customer?.User?.name || 'N/A'}</TableCell>
                                    <TableCell>{order.Worker?.User?.name || 'Unassigned'}</TableCell>
                                    <TableCell>₹{order.totalAmount?.toLocaleString()}</TableCell>
                                    <TableCell>
                                        <Chip label={order.status} color={getStatusColor(order.status)} size="small" onClick={(e) => handleStatusMenuOpen(e, order)} sx={{ cursor: 'pointer' }}/>
                                    </TableCell>
                                    <TableCell>{new Date(order.deliveryDate).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <Tooltip title="Print Invoice">
                                            <span>
                                                <IconButton size="small" onClick={() => handlePrintInvoice(order.id)} disabled={loading}>
                                                    <PrintIcon fontSize="small" />
                                                </IconButton>
                                            </span>
                                        </Tooltip>
                                        <Tooltip title="Edit Order">
                                            <IconButton size="small" onClick={() => handleOpenDialog(order)}>
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Delete Order">
                                            <IconButton size="small" color="error" onClick={() => handleDeleteOrder(order.id)}>
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Card>

            <Menu anchorEl={statusMenuAnchor} open={Boolean(statusMenuAnchor)} onClose={handleStatusMenuClose}>
                {statusOptions.map(opt => (
                    <MenuItem key={opt.value} onClick={() => handleQuickStatusUpdate(opt.value)} disabled={opt.value === selectedOrderForMenu?.status}>
                        {opt.label}
                    </MenuItem>
                ))}
            </Menu>

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="lg" fullWidth>
                <DialogTitle>{editingOrder ? 'Edit Order' : 'Create New Order'}</DialogTitle>
                <DialogContent>
                    <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
                        {steps.map(label => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
                    </Stepper>
                    {renderStepContent(activeStep)}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    {activeStep > 0 && <Button onClick={handleBack}>Back</Button>}
                    <Button onClick={activeStep === steps.length - 1 ? handleSubmitOrder : handleNext} variant="contained" disabled={loading}>
                        {activeStep === steps.length - 1 ? (editingOrder ? 'Update Order' : 'Create Order') : 'Next'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Orders;