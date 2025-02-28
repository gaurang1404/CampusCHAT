import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { X, Check, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Toaster, toast } from 'sonner';

const apiUrl = import.meta.env.VITE_API_URL;

const AdminRegistrationForm = () => {
    // Navigation hook
    const inputRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        inputRef.current?.focus(); // Focus on the input field when the component mounts
    }, []);

    // Form state
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        institutionName: '',
        institutionDomain: ''
    });

    // Form validation state
    const [errors, setErrors] = useState({});

    // Form submission states
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [submitError, setSubmitError] = useState(null);

    // Animation variants
    const formVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                when: "beforeChildren",
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
    };

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });

        // Clear errors for this field when user starts typing
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: null
            });
        }
    };

    // Validate form
    const validateForm = () => {
        const newErrors = {};

        // Required fields validation
        ['firstName', 'lastName', 'email', 'password', 'confirmPassword', 'institutionName', 'institutionDomain'].forEach(field => {
            if (!formData[field]) {
                newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')} is required`;
            }
        });

        // Email format validation
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (formData.email && !emailRegex.test(formData.email)) {
            newErrors.email = 'Please provide a valid email address';
        }

        // Domain validation
        if (formData.email && formData.institutionDomain && !formData.email.endsWith(`@${formData.institutionDomain}`)) {
            newErrors.email = 'Email must belong to the institution domain';
        }

        // Password validation
        if (formData.password && formData.password.length < 8) {
            newErrors.password = 'Password should be at least 8 characters';
        }

        // Confirm password
        if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Show Sonner toast notification
    const showToast = (message, type = 'success') => {
        if (type === 'error') {
            toast.error(message, {
                icon: <AlertCircle className="h-5 w-5 text-red-500" />
            });
        } else {
            toast.success(message, {
                icon: <Check className="h-5 w-5 text-green-500" />
            });
        }
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Reset submission states
        setSubmitSuccess(false);
        setSubmitError(null);

        // Validate form
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            // Prepare data for API (exclude confirmPassword)
            const apiData = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                password: formData.password,
                institutionName: formData.institutionName,
                institutionDomain: formData.institutionDomain
            };

            // Make API request
            const response = await axios.post(`${apiUrl}/api/admin/register`, apiData);

            if (response.data.code === 201) {
                setSubmitSuccess(true);

                // Show success toast with Sonner
                showToast('Admin registered successfully!');

                // Reset form
                setFormData({
                    firstName: '',
                    lastName: '',
                    email: '',
                    password: '',
                    confirmPassword: '',
                    institutionName: '',
                    institutionDomain: ''
                });

                // Navigate to admin dashboard
                setTimeout(() => {
                    navigate('/admin-login');
                }, 1500);
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Registration failed. Please try again.';
            setSubmitError(errorMsg);
            showToast(errorMsg, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">

            {/* Back Button */}
            <div className="fixed top-4 left-4">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center justify-center p-2 rounded-full bg-white shadow-md hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#63144c]"
                    aria-label="Go back to home"
                >
                    <ArrowLeft className="h-5 w-5 text-[#63144c]" />
                </button>
            </div>

            <motion.div
                className="w-full max-w-md"
                initial="hidden"
                animate="visible"
                variants={formVariants}
            >
                <motion.div
                    className="bg-white p-8 rounded-lg shadow-lg"
                    variants={itemVariants}
                >
                    <h2 className="text-2xl text-left text-gray-800 mb-6 font-extrabold">Admin Registration</h2>

                    {/* Success message */}
                    {submitSuccess && (
                        <motion.div
                            className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-md flex items-center"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <Check className="mr-2 h-5 w-5" />
                            <p>Admin registered successfully! Redirecting to dashboard...</p>
                        </motion.div>
                    )}

                    {/* Error message */}
                    {submitError && (
                        <motion.div
                            className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md flex items-center"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <AlertCircle className="mr-2 h-5 w-5" />
                            <p>{submitError}</p>
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {/* Personal Information Section */}
                        <motion.div className="mb-6" variants={itemVariants}>
                            <h3 className="text-lg font-medium text-gray-700 mb-4">Personal Information</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="firstName">
                                        First Name
                                    </label>
                                    <input
                                        type="text"
                                        id="firstName"
                                        ref={inputRef}
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 
                    ${errors.firstName ? 'border-red-300 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'}`}
                                    />
                                    {errors.firstName && (
                                        <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="lastName">
                                        Last Name
                                    </label>
                                    <input
                                        type="text"
                                        id="lastName"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 
                    ${errors.lastName ? 'border-red-300 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'}`}
                                    />
                                    {errors.lastName && (
                                        <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                                    )}
                                </div>
                            </div>
                        </motion.div>

                        {/* Institution Information Section */}
                        <motion.div className="mb-6" variants={itemVariants}>
                            <h3 className="text-lg font-medium text-gray-700 mb-4">Institution Information</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="institutionName">
                                        Institution Name
                                    </label>
                                    <input
                                        type="text"
                                        id="institutionName"
                                        name="institutionName"
                                        value={formData.institutionName}
                                        onChange={handleChange}
                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 
                    ${errors.institutionName ? 'border-red-300 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'}`}
                                    />
                                    {errors.institutionName && (
                                        <p className="mt-1 text-sm text-red-600">{errors.institutionName}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="institutionDomain">
                                        Institution Domain
                                    </label>
                                    <div className="flex">
                                        <span className="inline-flex items-center px-3 py-2 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 rounded-l-md">
                                            @
                                        </span>
                                        <input
                                            type="text"
                                            id="institutionDomain"
                                            name="institutionDomain"
                                            placeholder="example.edu"
                                            value={formData.institutionDomain}
                                            onChange={handleChange}
                                            className={`flex-1 px-3 py-2 border rounded-r-md focus:outline-none focus:ring-2 
                      ${errors.institutionDomain ? 'border-red-300 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'}`}
                                        />
                                    </div>
                                    {errors.institutionDomain && (
                                        <p className="mt-1 text-sm text-red-600">{errors.institutionDomain}</p>
                                    )}
                                </div>
                            </div>
                        </motion.div>

                        {/* Account Information Section */}
                        <motion.div className="mb-6" variants={itemVariants}>
                            <h3 className="text-lg font-medium text-gray-700 mb-4">Account Information</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 
                    ${errors.email ? 'border-red-300 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'}`}
                                    />
                                    {errors.email && (
                                        <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                                    )}
                                    {formData.email && formData.institutionDomain && !errors.email && (
                                        <p className="mt-1 text-sm text-gray-500">
                                            {formData.email.endsWith(`@${formData.institutionDomain}`) ?
                                                <span className="text-green-600 flex items-center"><Check className="h-4 w-4 mr-1" /> Email matches institution domain</span> :
                                                <span className="text-amber-600 flex items-center"><AlertCircle className="h-4 w-4 mr-1" /> Email must end with @{formData.institutionDomain}</span>
                                            }
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 
                    ${errors.password ? 'border-red-300 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'}`}
                                    />
                                    {errors.password && (
                                        <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                                    )}
                                    {formData.password && !errors.password && (
                                        <div className="mt-1">
                                            <div className="flex items-center mb-1">
                                                <div className={`h-1 ${formData.password.length >= 8 ? 'bg-green-500' : 'bg-gray-300'} rounded w-1/4 mr-1`}></div>
                                                <div className={`h-1 ${formData.password.length >= 10 ? 'bg-green-500' : 'bg-gray-300'} rounded w-1/4 mr-1`}></div>
                                                <div className={`h-1 ${formData.password.length >= 12 ? 'bg-green-500' : 'bg-gray-300'} rounded w-1/4 mr-1`}></div>
                                                <div className={`h-1 ${formData.password.length >= 14 ? 'bg-green-500' : 'bg-gray-300'} rounded w-1/4`}></div>
                                            </div>
                                            <p className="text-xs text-gray-500">Password strength: {
                                                formData.password.length >= 14 ? 'Strong' :
                                                    formData.password.length >= 12 ? 'Good' :
                                                        formData.password.length >= 8 ? 'Fair' : 'Weak'
                                            }</p>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="confirmPassword">
                                        Confirm Password
                                    </label>
                                    <input
                                        type="password"
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 
                    ${errors.confirmPassword ? 'border-red-300 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'}`}
                                    />
                                    {errors.confirmPassword && (
                                        <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                                    )}
                                    {formData.password && formData.confirmPassword && formData.password === formData.confirmPassword && (
                                        <p className="mt-1 text-sm text-green-600 flex items-center">
                                            <Check className="h-4 w-4 mr-1" /> Passwords match
                                        </p>
                                    )}

                                </div>
                            </div>
                        </motion.div>

                        {/* Submit Button */}
                        <motion.div className="mt-8" variants={itemVariants}>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-white text-sm font-medium 
      ${isSubmitting ? 'bg-[#8a1d65]' : 'bg-[#63144c] hover:bg-[#500f3b]'} 
      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8a1d65] transition-colors duration-200`}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="animate-spin h-5 w-5 mr-2" />
                                        Processing...
                                    </>
                                ) : (
                                    'Register Admin Account'
                                )}
                            </button>
                        </motion.div>

                        {/* Login Link */}
                        <motion.div className="mt-4 text-center" variants={itemVariants}>
                            <p className="text-sm text-gray-600">
                                Already have an account?{' '}
                                <a
                                    href="/admin-login"
                                    className="font-medium text-[#63144c] hover:text-[#8a1d65] transition-colors duration-200"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        navigate('/admin-login');
                                    }}
                                >
                                    Sign in
                                </a>
                            </p>
                        </motion.div>
                    </form>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default AdminRegistrationForm;