import React, { useState, useRef, forwardRef , useEffect} from 'react';
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
    Print as PrintIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useReactToPrint } from 'react-to-print';
import InvoiceBase from './Invoice';
import { createRoot } from 'react-dom/client';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from '../../theme'; // adjust the path if needed

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
    const [statusMenuAnchor, setStatusMenuAnchor] = useState(null);
    const [selectedOrderForMenu, setSelectedOrderForMenu] = useState(null);
    const [measurementInputs, setMeasurementInputs] = useState({}); // State for measurement input fields

    // --- Start of Print Logic ---
    // const [invoiceData, setInvoiceData] = useState(null);
    // const componentRef = useRef();

    // Wrap Invoice in forwardRef to support react-to-print
    // const Invoice = forwardRef((props, ref) => (
    //     <InvoiceBase ref={ref} {...props} />
    // ));

    // // This function will be called to clean up after printing
    // const handleAfterPrint = () => {
    //     setInvoiceData(null);
    // };

    // const handlePrint = useReactToPrint({
    //     content: () => componentRef.current,
    //     onAfterPrint: handleAfterPrint,
    // });

    // The button click will now fetch data, set state, and print after data is set
    const fetchInvoiceData = async (orderId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:3001/api/orders/${orderId}/invoice`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                // setInvoiceData(response.data.invoice);
                // setTimeout(() => {
                //     handlePrint();
                // }, 100); // Delay to ensure ref is updated
            } else {
                setError(response.data.message || 'Could not fetch invoice data.');
            }
        } catch (error) {
            console.error('Error fetching invoice data:', error);
            setError('Failed to load invoice data for printing.');
        }
    };
    // --- End of Print Logic ---


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
            price: 0,
            measurements: [], // Measurements are now per-item as tags
        }],
        selectedWorker: null,
        priority: 'medium',
        deliveryDate: '',
        notes: '',
        advancePayment: 0,
    });

    const steps = ['Customer Selection', 'Order Items', 'Worker Assignment', 'Review & Submit'];

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
        const fetchInitialData = async () => {
            setLoading(true);
            setError('');
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setError('Authentication token not found.');
                    return;
                }
                const headers = { headers: { Authorization: `Bearer ${token}` } };

                // Fetch all data concurrently
                const [ordersRes, customersRes, workersRes] = await Promise.all([
                    axios.get('http://localhost:3001/api/orders', headers),
                    axios.get('http://localhost:3001/api/customers', headers),
                    axios.get('http://localhost:3001/api/workers', headers)
                ]);

                if (ordersRes.data.success) {
                    setOrders(ordersRes.data.orders);
                } else {
                    throw new Error('Failed to fetch orders.');
                }

                if (customersRes.data.success) {
                    setCustomers(customersRes.data.customers);
                } else {
                    throw new Error('Failed to fetch customers.');
                }
                
                if (workersRes.data.success) {
                    setWorkers(workersRes.data.workers);
                } else {
                    throw new Error('Failed to fetch workers.');
                }

            } catch (error) {
                console.error('Error fetching initial data:', error);
                setError(`Failed to load page data: ${error.message}`);
                setOrders([]); // Clear data on error
                setCustomers([]);
                setWorkers([]);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
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
    // Only open dialog if data is ready
    if (
        loading ||
        !Array.isArray(customers) ||
        !Array.isArray(workers)
    ) {
        console.warn("Data not ready yet", { loading, customers, workers });
        return;
    }
    if (order !== null) {
        setEditingOrder(order);
        setActiveStep(0);
        // Find the full customer and worker objects safely
        const fullCustomer = Array.isArray(customers) && order.Customer
            ? customers.find(c => c.id === order.Customer.id) || null
            : null;
        const fullWorker = Array.isArray(workers) && order.Worker
            ? workers.find(w => w.id === order.Worker.id) || null
            : null;
        // Ensure items is an array
        const itemsWithMeasurements =
            Array.isArray(order.items)
                ? order.items.map(item => ({
                    ...item,
                    measurements: Array.isArray(item.measurements) ? item.measurements : []
                }))
                : [];
        // For backward compatibility, convert old measurement object to tags for the first item
        if (
            Array.isArray(order.measurements) &&
            order.measurements.length > 0 &&
            itemsWithMeasurements.length > 0 &&
            typeof order.measurements[0] === 'object' &&
            order.measurements[0] !== null
        ) {
            const legacyMeasurements = order.measurements[0];
            // Only include actual measurement values, skip metadata fields
            const legacyTags = Object.entries(legacyMeasurements)
                .filter(([key, value]) => {
                  const lowerKey = key.toLowerCase();
                  return value !== null && value !== '' && !['id','orderid','createdat','updatedat','custom measurements'].includes(lowerKey);
                })
                .map(([key, value]) =>
                  `${key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}: ${value}`
                );
            // Prevent adding duplicate tags
            const existingTags = new Set(
                Array.isArray(itemsWithMeasurements[0].measurements)
                    ? itemsWithMeasurements[0].measurements
                    : []
            );
            const uniqueLegacyTags = legacyTags.filter(tag => !existingTags.has(tag));
            itemsWithMeasurements[0].measurements.push(...uniqueLegacyTags);
        }
        setOrderData({
            selectedCustomer: fullCustomer,
            newCustomer: { name: '', email: '', phone: '', address: '' },
            isNewCustomer: false,
            items:
                itemsWithMeasurements.length > 0
                    ? itemsWithMeasurements
                    : [
                        {
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
                            price: 0,
                            measurements: [],
                        },
                    ],
            selectedWorker: fullWorker,
            priority: order.priority || 'medium',
            deliveryDate: order.deliveryDate
                ? order.deliveryDate.split('T')[0]
                : '',
            notes: order.notes || '',
            advancePayment: order.advancePayment || 0,
        });
    } else {
        setEditingOrder(null);
        setActiveStep(0);
        setOrderData({
            selectedCustomer: null,
            newCustomer: { name: '', email: '', phone: '', address: '' },
            isNewCustomer: false,
            items: [
                {
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
                    price: 0,
                    measurements: [],
                },
            ],
            selectedWorker: null,
            priority: 'medium',
            deliveryDate: '',
            notes: '',
            advancePayment: 0,
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
        setMeasurementInputs({}); // Clear measurement inputs on close
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
            case 0: // Customer Selection
                if (orderData.isNewCustomer) {
                    return orderData.newCustomer.name && orderData.newCustomer.email && orderData.newCustomer.phone;
                }
                return orderData.selectedCustomer !== null;

            case 1: // Order Items
                return orderData.items.every(item => item.itemType && item.price > 0);

            case 2: // Worker Assignment
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
                price: 0,
                measurements: [], // Add measurements array to new items
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
        const newItems = orderData.items.map((item, i) => {
            if (i === index) {
                if (field.includes('.')) {
                    const [key, subkey] = field.split('.');
                    return { ...item, [key]: { ...item[key], [subkey]: value } };
                }
                return { ...item, [field]: value };
            }
            return item;
        });
        setOrderData(prev => ({ ...prev, items: newItems }));
    };

    // --- Measurement Tag Functions ---
    const handleMeasurementInputChange = (index, value) => {
        setMeasurementInputs(prev => ({ ...prev, [index]: value }));
    };

    const handleAddMeasurement = (itemIndex) => {
        const tag = measurementInputs[itemIndex]?.trim();
        if (!tag) return;

        const newItems = [...orderData.items];
        newItems[itemIndex].measurements.push(tag);
        setOrderData(prev => ({ ...prev, items: newItems }));

        // Clear the input field for that item
        handleMeasurementInputChange(itemIndex, '');
    };

    const handleRemoveMeasurement = (itemIndex, tagIndex) => {
        const newItems = [...orderData.items];
        newItems[itemIndex].measurements.splice(tagIndex, 1);
        setOrderData(prev => ({ ...prev, items: newItems }));
    };
    // --- End Measurement Tag Functions ---

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

            // Consolidate all measurement tags into a single string for backend compatibility
            const customMeasurementsString = orderData.items
                .flatMap(item => item.measurements.length > 0 ? [`${item.itemType || 'Item'} measurements: ${item.measurements.join(', ')}`] : [])
                .join('; ');

            const hasMeasurements = customMeasurementsString.length > 0;
            const measurementsPayload = hasMeasurements ? { customMeasurements: customMeasurementsString } : null;

            const submitData = {
                selectedCustomer: orderData.selectedCustomer,
                newCustomer: orderData.newCustomer,
                isNewCustomer: orderData.isNewCustomer,
                items: orderData.items.map(({ measurements, ...item }) => item), // Exclude measurements from items array for main submission
                selectedWorker: orderData.selectedWorker,
                priority: orderData.priority,
                deliveryDate: orderData.deliveryDate,
                notes: orderData.notes,
                advancePayment: orderData.advancePayment,
                totalAmount: calculateTotal(),
                balanceAmount: calculateTotal() - (orderData.advancePayment || 0),
                measurements: measurementsPayload // This will be handled separately
            };

            // Validation checks...
            if (submitData.isNewCustomer && (!submitData.newCustomer.name || !submitData.newCustomer.email || !submitData.newCustomer.phone)) {
                setError('Please fill in all required customer fields.');
                setLoading(false); return;
            } else if (!submitData.isNewCustomer && !submitData.selectedCustomer) {
                setError('Please select an existing customer.');
                setLoading(false); return;
            }
            if (submitData.items.length === 0 || submitData.items.some(item => !item.itemType || !item.price)) {
                setError('Please ensure all order items have a type and a price.');
                setLoading(false); return;
            }

            let response;
            if (editingOrder) {
                response = await axios.put(`http://localhost:3001/api/orders/${editingOrder.id}`, submitData, { headers: { Authorization: `Bearer ${token}` } });
            } else {
                response = await axios.post('http://localhost:3001/api/orders/create-with-customer', submitData, { headers: { Authorization: `Bearer ${token}` } });
            }

            if (response.data.success) {
                const orderId = response.data.order.id;
                // After creating/updating the order, if measurements exist, submit them separately
                if (hasMeasurements) {
                    await axios.post(
                        `http://localhost:3001/api/orders/${orderId}/measurements`,
                        measurementsPayload,
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

    // SuitMate/src/components/Orders/Orders.jsx

    // ... (keep the rest of the component the same)

    const renderStepContent = (step) => {
        // This style object makes the dropdown menu wide
        const menuProps = {
            PaperProps: {
                sx: {
                    width: 350,
                },
            },
        };

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

            case 1: // Order Items and Measurements
                return (
                    <Box>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                            <Typography variant="h6">Order Items & Measurements</Typography>
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
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
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
                                    {/* Item details */}
                                    <Grid item xs={12} md={4}>
                                        <TextField fullWidth select label="Item Type" value={item.itemType} onChange={(e) => updateOrderItem(index, 'itemType', e.target.value)} required SelectProps={{ MenuProps: menuProps }} sx={{ minWidth: 200 }}>
                                            {itemTypes.map((type) => (<MenuItem key={type} value={type}>{type}</MenuItem>))}
                                        </TextField>
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                        <TextField fullWidth select label="Fabric" value={item.fabric} onChange={(e) => updateOrderItem(index, 'fabric', e.target.value)} SelectProps={{ MenuProps: menuProps }} sx={{ minWidth: 200 }}>
                                            {fabricOptions.map((fabric) => (<MenuItem key={fabric} value={fabric}>{fabric}</MenuItem>))}
                                        </TextField>
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                        <TextField fullWidth label="Color" value={item.color} onChange={(e) => updateOrderItem(index, 'color', e.target.value)} />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField fullWidth label="Style" value={item.specifications.style} onChange={(e) => updateOrderItem(index, 'specifications.style', e.target.value)} />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField fullWidth label="Price (₹)" type="number" value={item.price} onChange={(e) => updateOrderItem(index, 'price', e.target.value)} required />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField fullWidth label="Custom Notes" multiline rows={2} value={item.specifications.customNotes} onChange={(e) => updateOrderItem(index, 'specifications.customNotes', e.target.value)} />
                                    </Grid>
                                </Grid>

                                {/* New Measurement Tag Section */}
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="subtitle2" gutterBottom>Measurements</Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                                    {item.measurements.map((tag, tagIndex) => (
                                        <Chip
                                            key={tagIndex}
                                            label={tag}
                                            onDelete={() => handleRemoveMeasurement(index, tagIndex)}
                                            variant="outlined"
                                        />
                                    ))}
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        variant="outlined"
                                        placeholder="Add measurement tag (e.g., Chest: 42) and press Enter"
                                        value={measurementInputs[index] || ''}
                                        onChange={(e) => handleMeasurementInputChange(index, e.target.value)}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleAddMeasurement(index);
                                            }
                                        }}
                                    />
                                    <Tooltip title="Add Measurement">
                                        <IconButton onClick={() => handleAddMeasurement(index)} color="primary" edge="end">
                                            <AddCircleIcon />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            </Paper>
                        ))}

                        <Paper sx={{ p: 2, bgcolor: 'primary.50' }}>
                            <Typography variant="h6" color="primary">
                                Total Amount: ₹{calculateTotal().toLocaleString()}
                            </Typography>
                        </Paper>
                    </Box>
                );

            case 2: // Worker Assignment
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
                                        <TextField
                                            {...params}
                                            label="Select Worker"
                                            fullWidth
                                            required
                                            sx={{ minWidth: 300 }} // This is the fix for the worker dropdown
                                        />
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
                                    SelectProps={{ MenuProps: menuProps }}
                                    sx={{ minWidth: 200 }}
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

            case 3: // Review
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
                                            Order Items & Measurements
                                        </Typography>
                                        <List dense>
                                            {orderData.items.map((item, index) => (
                                                <React.Fragment key={index}>
                                                <ListItem alignItems="flex-start">
                                                    <ListItemText
                                                        primary={`${item.itemType} - ${item.fabric} ${item.color}`}
                                                        secondary={
                                                        <>
                                                            <Typography component="span" variant="body2" color="text.primary">
                                                                {item.specifications.customNotes}
                                                            </Typography>
                                                            {item.measurements.length > 0 && (
                                                                <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                                    {item.measurements.map((tag, tagIndex) => (
                                                                        <Chip key={tagIndex} label={tag} size="small" variant="outlined" />
                                                                    ))}
                                                                </Box>
                                                            )}
                                                        </>
                                                        }
                                                    />
                                                    <ListItemSecondaryAction>
                                                        <Typography variant="body2" fontWeight="bold">
                                                            ₹{parseFloat(item.price || 0).toLocaleString()}
                                                        </Typography>
                                                    </ListItemSecondaryAction>
                                                </ListItem>
                                                 {index < orderData.items.length - 1 && <Divider component="li" />}
                                                 </React.Fragment>
                                            ))}
                                        </List>
                                        <Divider />
                                        <Box display="flex" justifyContent="space-between" mt={2}>
                                            <Typography variant="h6">Total Amount:</Typography>
                                            <Typography variant="h6" color="primary">₹{calculateTotal().toLocaleString()}</Typography>
                                        </Box>
                                        <Box display="flex" justifyContent="space-between">
                                            <Typography variant="body2">Advance Payment:</Typography>
                                            <Typography variant="body2">₹{parseFloat(orderData.advancePayment || 0).toLocaleString()}</Typography>
                                        </Box>
                                        <Box display="flex" justifyContent="space-between">
                                            <Typography variant="body2" fontWeight="bold">Balance Amount:</Typography>
                                            <Typography variant="body2" fontWeight="bold">₹{(calculateTotal() - (orderData.advancePayment || 0)).toLocaleString()}</Typography>
                                        </Box>
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

    // ... (keep the rest of the component the same)

    //aa rhea


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
                printWindow.document.write('<link href="/src/index.css" rel="stylesheet"><div id="print-root"></div>');
                printWindow.document.close();

                const printRoot = printWindow.document.getElementById('print-root');
                const root = createRoot(printRoot);

                root.render(
                    <React.StrictMode>
                        <ThemeProvider theme={theme}>
                            <CssBaseline />
                            <InvoiceBase invoiceData={invoiceData} />
                        </ThemeProvider>
                    </React.StrictMode>
                );

                // Wait for rendering then print
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
    //bss

    return (
        <Box>
            {/* This Box is for the printable component. It will not be visible on the screen. */}
            {/* <Box sx={{ display: 'none' }}>
                <Invoice ref={componentRef} invoiceData={invoiceData} />
            </Box> */}

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
                        disabled={loading}
                        sx={{
                            background: 'linear-gradient(135deg, #003049 0%, #003049 100%)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #669BBC 0%, #669BBC 100%)',
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
                                                    <Tooltip title="Print Invoice">
                                                        <IconButton size="small" onClick={() => handlePrintInvoice(order.id)} disabled={loading}>
    <PrintIcon fontSize="small" />
</IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Edit Order">
    <IconButton
        size="small"
        onClick={() => handleOpenDialog(order)}
        disabled={loading} // <-- ADD THIS LINE
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