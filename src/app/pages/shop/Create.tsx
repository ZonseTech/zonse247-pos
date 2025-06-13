import React, { useState } from 'react';
import * as Yup from 'yup';
import { Formik } from 'formik';
import { Mail, MapPin, Building2, CreditCard, Check } from 'lucide-react'

interface ShopRegistrationData extends ShopRegistration { }

const ShopRegistration: React.FC = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [registrationComplete, setRegistrationComplete] = useState(false);
    const [credentials, setCredentials] = useState<{ clientId: string; authToken: string } | null>(null);

    const validationSchema = Yup.object({
        shopName: Yup.string().required('Shop name is required').max(100),
        adminName: Yup.string().required('Admin name is required').max(50),
        adminEmail: Yup.string().email('Invalid email').required('Email is required'),
        phone: Yup.string().required('Phone is required').matches(/^[0-9+\-\s()]+$/),
        address: Yup.object({
            line1: Yup.string().required('Address line 1 is required').max(200),
            line2: Yup.string().max(200),
        }),
        city: Yup.string().required('City is required').max(50),
        country: Yup.string().required('Country is required').max(50),
        currency: Yup.string().required('Currency is required').length(3),
        vatNumber: Yup.string().matches(/^[0-9A-Za-z\-]+$/, 'Invalid VAT format'),
        taxRate: Yup.number().min(0).max(100).required('Tax rate is required'),
        chargeTax: Yup.boolean()
    });

    const initialValues: ShopRegistrationData = {
        shopName: '',
        adminName: '',
        adminEmail: '',
        phone: '',
        address: {
            line1: '',
            line2: '',
        },
        city: '',
        country: '',
        currency: 'MKW',
        vatNumber: '',
        taxRate: 0,
        chargeTax: false
    };

    const handleSubmit = async (values: ShopRegistrationData) => {
        setIsSubmitting(true);
        try {
            const response = await fetch('/api/shops/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values)
            });

            if (response.ok) {
                const result = await response.json();
                setCredentials({
                    clientId: result.clientId,
                    authToken: result.authToken
                });
                setRegistrationComplete(true);
                console.log('Registration successful, credentials sent via email');
            }
        } catch (error) {
            console.error('Registration failed:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (registrationComplete) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Check className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Registration Complete!</h2>
                    <p className="text-gray-600 mb-6">
                        Your shop has been successfully registered. Installation credentials have been sent to your email.
                    </p>

                    {credentials && (
                        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                            <h3 className="font-semibold text-gray-800 mb-2">Installation Credentials:</h3>
                            <div className="space-y-2 text-sm">
                                <div>
                                    <span className="font-medium">Client ID:</span>
                                    <code className="ml-2 bg-white px-2 py-1 rounded">{credentials.clientId}</code>
                                </div>
                                <div>
                                    <span className="font-medium">Auth Token:</span>
                                    <code className="ml-2 bg-white px-2 py-1 rounded text-xs">{credentials.authToken}</code>
                                </div>
                            </div>
                        </div>
                    )}

                    <p className="text-sm text-gray-500">
                        Use these credentials to install the POS application on your workstations.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-2xl w-full">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
                    <h1 className="text-3xl font-bold text-white">Register Your Shop</h1>
                    <p className="text-blue-100 mt-2">Set up your POS system in just a few steps</p>
                </div>

                <div className="p-8">
                    <Formik
                        initialValues={initialValues}
                        validationSchema={validationSchema}
                        onSubmit={handleSubmit}
                    >
                        {({ values, errors, touched, handleChange, handleBlur, handleSubmit }) => (
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                                        <Building2 className="w-5 h-5 mr-2 text-blue-600" />
                                        Shop Information
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Shop Name *
                                            </label>
                                            <input
                                                type="text"
                                                name="shopName"
                                                value={values.shopName}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Cool Pharmacy"
                                            />
                                            {errors.shopName && touched.shopName && (
                                                <p className="text-red-500 text-xs mt-1">{errors.shopName}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Admin Name *
                                            </label>
                                            <input
                                                type="text"
                                                name="adminName"
                                                value={values.adminName}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="John Doe"
                                            />
                                            {errors.adminName && touched.adminName && (
                                                <p className="text-red-500 text-xs mt-1">{errors.adminName}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Information */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                                        <Mail className="w-5 h-5 mr-2 text-blue-600" />
                                        Contact Information
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Email Address *
                                            </label>
                                            <input
                                                type="email"
                                                name="adminEmail"
                                                value={values.adminEmail}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="admin@coolpharmacy.com"
                                            />
                                            {errors.adminEmail && touched.adminEmail && (
                                                <p className="text-red-500 text-xs mt-1">{errors.adminEmail}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Phone Number *
                                            </label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={values.phone}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="+1 (555) 123-4567"
                                            />
                                            {errors.phone && touched.phone && (
                                                <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                                        <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                                        Address Information
                                    </h3>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Address Line 1 *
                                            </label>
                                            <input
                                                type="text"
                                                name="addressLine1"
                                                value={values.address.line1}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="123 Main Street, Building #5"
                                            />
                                            {errors.address.line1 && touched.address.line1 && (
                                                <p className="text-red-500 text-xs mt-1">{errors.address.line1}</p>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Address Line 2
                                                </label>
                                                <input
                                                    type="text"
                                                    name="addressLine2"
                                                    value={values.address.line2}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder="Suite 101"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    City *
                                                </label>
                                                <input
                                                    type="text"
                                                    name="city"
                                                    value={values.city}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder="New York"
                                                />
                                                {errors.city && touched.city && (
                                                    <p className="text-red-500 text-xs mt-1">{errors.city}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Country *
                                                </label>
                                                <input
                                                    type="text"
                                                    name="country"
                                                    value={values.country}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder="United States"
                                                />
                                                {errors.country && touched.country && (
                                                    <p className="text-red-500 text-xs mt-1">{errors.country}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Business Settings */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                                        <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
                                        Business Settings
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Currency *
                                            </label>
                                            <select
                                                name="currency"
                                                value={values.currency}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value="USD">USD - US Dollar</option>
                                                <option value="EUR">EUR - Euro</option>
                                                <option value="GBP">GBP - British Pound</option>
                                                <option value="MWK">MWK - Malawian Kwacha</option>
                                                <option value="ZAR">ZAR - South African Rand</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                VAT Number
                                            </label>
                                            <input
                                                type="text"
                                                name="vatNumber"
                                                value={values.vatNumber}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="VAT123456789"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Tax Rate (%) *
                                            </label>
                                            <input
                                                type="number"
                                                name="taxRate"
                                                value={values.taxRate}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                min="0"
                                                max="100"
                                                step="0.01"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="18.00"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            name="chargeTax"
                                            checked={values.chargeTax}
                                            onChange={handleChange}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label className="ml-2 text-sm text-gray-700">
                                            Enable tax calculation on transactions
                                        </label>
                                    </div>
                                </div>

                                <div className="pt-6 border-t">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        onClick={() => handleSubmit()}
                                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? (
                                            <div className="flex items-center justify-center">
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                                Registering Shop...
                                            </div>
                                        ) : (
                                            'Register Shop'
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </Formik>
                </div>
            </div>
        </div>
    );
};

export default ShopRegistration;