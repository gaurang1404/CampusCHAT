import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Check, AlertCircle, Loader2, LogIn, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Toaster, toast } from 'sonner';

const apiUrl = import.meta.env.VITE_API_URL;

const AdminLoginForm = () => {
    // Navigation hook
    const navigate = useNavigate();

    // Form state
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    // Remember me state
    const [rememberMe, setRememberMe] = useState(false);

    // Form validation state
    const [errors, setErrors] = useState({});

    // Form submission states
    const [isSubmitting, setIsSubmitting] = useState(false);
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

    // Toggle remember me
    const handleRememberMeChange = () => {
        setRememberMe(!rememberMe);
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

    // Validate form
    const validateForm = () => {
        const newErrors = {};

        // Required fields validation
        ['email', 'password'].forEach(field => {
            if (!formData[field]) {
                newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')} is required`;
            }
        });

        // Email format validation
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (formData.email && !emailRegex.test(formData.email)) {
            newErrors.email = 'Please provide a valid email address';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Reset submission error
        setSubmitError(null);

        // Validate form
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            // Make API request
            const response = await axios.post(`${apiUrl}/admin/loginAdmin`, {
                email: formData.email,
                password: formData.password,
                rememberMe: rememberMe
            });

            if (response.data.code === 200) {
                // Show success toast
                showToast('Login successful! Redirecting to dashboard...');

                // Store token in localStorage or sessionStorage based on remember me
                const storage = rememberMe ? localStorage : sessionStorage;
                storage.setItem('adminToken', response.data.token);
                storage.setItem('adminUser', JSON.stringify(response.data.adminUser));

                // Navigate to admin dashboard
                setTimeout(() => {
                    navigate('/admin-dashboard');
                }, 1000);
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Login failed. Please check your credentials.';
            setSubmitError(errorMsg);
            showToast(errorMsg, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle password reset
    const handleForgotPassword = () => {
        navigate('/admin-forgot-password');
    };

    // Handle back to home
    const handleBackToHome = () => {
        navigate('/');
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">

            {/* Back button */}
            <div className="fixed top-4 left-4">
                <button
                    onClick={() => navigate('/admin-register')}
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
                    <h2 className="text-2xl text-left text-gray-800 mb-6 font-extrabold">Admin Login</h2>

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
                        {/* Email field */}
                        <motion.div className="mb-6" variants={itemVariants}>
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
                        </motion.div>

                        {/* Password field */}
                        <motion.div className="mb-4" variants={itemVariants}>
                            <div className="flex justify-between items-baseline">
                                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
                                    Password
                                </label>
                                <button
                                    type="button"
                                    onClick={handleForgotPassword}
                                    className="text-xs text-[#63144c] hover:text-[#8a1d65] transition-colors duration-200 font-medium"
                                >
                                    Forgot password?
                                </button>
                            </div>
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
                        </motion.div>

                        {/* Remember me checkbox */}
                        <motion.div className="mb-6 flex items-center" variants={itemVariants}>
                            <input
                                type="checkbox"
                                id="rememberMe"
                                checked={rememberMe}
                                onChange={handleRememberMeChange}
                                className="h-4 w-4 text-[#63144c] focus:ring-[#8a1d65] border-gray-300 rounded"
                            />
                            <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                                Remember me
                            </label>
                        </motion.div>

                        {/* Submit Button */}
                        <motion.div className="mt-6" variants={itemVariants}>
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
                                        Logging in...
                                    </>
                                ) : (
                                    <>
                                        <LogIn className="h-5 w-5 mr-2" />
                                        Sign In
                                    </>
                                )}
                            </button>
                        </motion.div>

                        {/* Register Link */}
                        <motion.div className="mt-6 text-center" variants={itemVariants}>
                            <p className="text-sm text-gray-600">
                                Don't have an account?{' '}
                                <a
                                    href="/admin-register"
                                    className="font-medium text-[#63144c] hover:text-[#8a1d65] transition-colors duration-200"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        navigate('/admin-register');
                                    }}
                                >
                                    Register
                                </a>
                            </p>
                        </motion.div>
                    </form>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default AdminLoginForm;