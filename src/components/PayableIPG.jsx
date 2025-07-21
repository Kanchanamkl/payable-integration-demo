import React, { useState, useEffect } from 'react';
import { CreditCard, User, MapPin, Package, AlertCircle } from 'lucide-react';

const PayableIPGIntegration = () => {
  const [formData, setFormData] = useState({
    // Payment Details
    invoiceId: '',
    orderDescription: '',
    amount: '',
    currencyCode: 'LKR',
    paymentType: '1', // 1 = ONE_TIME_PAYMENT, 2 = RECURRING_PAYMENT
    
    // Merchant Details (these would typically come from your backend)
    merchantKey: '',
    notifyUrl: '',
    returnUrl: '',
    logoUrl: '',
    
    // Customer Details
    customerFirstName: '',
    customerLastName: '',
    customerMobilePhone: '',
    customerEmail: '',
    customerPhone: '',
    
    // Billing Details
    billingAddressStreet: '',
    billingAddressStreet2: '',
    billingCompanyName: '',
    billingAddressCity: '',
    billingAddressStateProvince: '',
    billingAddressCountry: 'LKA',
    billingAddressPostcodeZip: '',
    
    // Shipping Details
    shippingContactFirstName: '',
    shippingContactLastName: '',
    shippingContactMobilePhone: '',
    shippingContactPhone: '',
    shippingContactEmail: '',
    shippingCompanyName: '',
    shippingAddressStreet: '',
    shippingAddressStreet2: '',
    shippingAddressCity: '',
    shippingAddressStateProvince: '',
    shippingAddressCountry: 'LKA',
    shippingAddressPostcodeZip: '',
    
    // Recurring Payment Details (only if paymentType = 2)
    startDate: '',
    endDate: '',
    recurringAmount: '',
    interval: 'MONTHLY',
    isRetry: '1',
    retryAttempts: '1',
    doFirstPayment: '1',
    
    // Custom Fields
    custom1: '',
    custom2: ''
  });

  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [environment, setEnvironment] = useState('sandbox'); // sandbox or live

  // Load PAYable SDK script
  useEffect(() => {
    const scriptUrl = environment === 'sandbox' 
      ? 'https://sandboxipgsdk.payable.lk/sdk/v4/payable-checkout.js'
      : 'https://ipgsdk.payable.lk/sdk/v4/payable-checkout.js';

    // Remove existing script if any
    const existingScript = document.getElementById('payable-sdk');
    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement('script');
    script.id = 'payable-sdk';
    script.src = scriptUrl;
    script.async = true;
    script.onload = () => setIsScriptLoaded(true);
    script.onerror = () => setError('Failed to load PAYable SDK');
    
    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.getElementById('payable-sdk');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [environment]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Generate checkValue (this should be done on your backend for security)
  const generateCheckValue = (merchantKey, invoiceId, amount, currencyCode, merchantToken) => {
    // Note: This is a placeholder. In production, this should be generated on your backend
    // Format: UPPERCASE(SHA512[<merchantKey>|<invoiceId>|<amount>|<currencyCode>|UPPERCASE(SHA512[<merchantToken>])])
    return 'PLACEHOLDER_CHECK_VALUE'; // Replace with actual implementation
  };

  const validateForm = () => {
    const requiredFields = [
      'merchantKey', 'invoiceId', 'amount', 'orderDescription',
      'customerFirstName', 'customerLastName', 'customerMobilePhone', 'customerEmail',
      'billingAddressStreet', 'billingAddressCity', 'billingAddressCountry',
      'notifyUrl', 'returnUrl'
    ];

    for (const field of requiredFields) {
      if (!formData[field] || formData[field].trim() === '') {
        setError(`${field} is required`);
        return false;
      }
    }

    // Additional validation for recurring payments
    if (formData.paymentType === '2') {
      const recurringFields = ['startDate', 'endDate', 'recurringAmount', 'interval'];
      for (const field of recurringFields) {
        if (!formData[field] || formData[field].trim() === '') {
          setError(`${field} is required for recurring payments`);
          return false;
        }
      }
    }

    return true;
  };

  const handlePayment = async () => {
    setError('');
    setIsLoading(true);

    try {
      if (!isScriptLoaded) {
        throw new Error('PAYable SDK not loaded yet');
      }

      if (!validateForm()) {
        setIsLoading(false);
        return;
      }

      // Prepare payment data
      const paymentData = {
        ...formData,
        checkValue: generateCheckValue(
          formData.merchantKey,
          formData.invoiceId,
          formData.amount,
          formData.currencyCode,
          'F7D2F2DE639DED1F35E913A9DE95BD5A' // This should come from your backend
        )
      };

      // Remove empty fields to reduce payload
      Object.keys(paymentData).forEach(key => {
        if (paymentData[key] === '') {
          delete paymentData[key];
        }
      });

      console.log('Payment Data:', paymentData);

      // Call PAYable payment function
      if (window.payablePayment) {
        const result = await window.payablePayment(paymentData);
        console.log('Payment Result:', result);
      } else {
        throw new Error('payablePayment function not available');
      }

    } catch (err) {
      console.error('Payment Error:', err);
      setError(err.message || 'Payment failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">PAYable Payment Gateway</h1>
        <p className="text-gray-600">Secure payment integration for your business</p>
        
        {/* Environment Toggle */}
        <div className="mt-4 flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Environment:</label>
          <select 
            value={environment}
            onChange={(e) => setEnvironment(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
          >
            <option value="sandbox">Sandbox</option>
            <option value="live">Live</option>
          </select>
          <div className="flex items-center">
            <div className={`w-2 h-2 rounded-full ${isScriptLoaded ? 'bg-green-500' : 'bg-red-500'} mr-2`}></div>
            <span className="text-sm text-gray-600">
              SDK {isScriptLoaded ? 'Loaded' : 'Loading...'}
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 flex items-center">
          <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      <div className="space-y-8">
        {/* Merchant Configuration */}
        <div className="bg-blue-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Merchant Configuration
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Merchant Key *</label>
              <input
                type="text"
                name="merchantKey"
                value={formData.merchantKey}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="D75XXXXXXXXX"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notify URL *</label>
              <input
                type="url"
                name="notifyUrl"
                value={formData.notifyUrl}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="https://yoursite.com/payment/notify"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Return URL *</label>
              <input
                type="url"
                name="returnUrl"
                value={formData.returnUrl}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="https://yoursite.com/payment/return"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
              <input
                type="url"
                name="logoUrl"
                value={formData.logoUrl}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="https://yoursite.com/logo.png"
              />
            </div>
          </div>
        </div>

        {/* Payment Details */}
        <div className="bg-green-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Payment Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Invoice ID *</label>
              <input
                type="text"
                name="invoiceId"
                value={formData.invoiceId}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="INV0002301"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
              <input
                type="number"
                step="0.01"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="999.12"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Currency Code *</label>
              <select
                name="currencyCode"
                value={formData.currencyCode}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="LKR">LKR</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Type *</label>
              <select
                name="paymentType"
                value={formData.paymentType}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="1">One-time Payment</option>
                <option value="2">Recurring Payment</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Order Description *</label>
              <textarea
                name="orderDescription"
                value={formData.orderDescription}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                rows="2"
                placeholder="Payment for abc Fashion"
              />
            </div>
          </div>

          {/* Recurring Payment Fields */}
          {formData.paymentType === '2' && (
            <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
              <h3 className="text-lg font-medium mb-3">Recurring Payment Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="FOREVER for no end date"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Recurring Amount *</label>
                  <input
                    type="number"
                    step="0.01"
                    name="recurringAmount"
                    value={formData.recurringAmount}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="2.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Interval *</label>
                  <select
                    name="interval"
                    value={formData.interval}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="MONTHLY">Monthly</option>
                    <option value="ANNUALLY">Annually</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Customer Details */}
        <div className="bg-purple-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <User className="w-5 h-5 mr-2" />
            Customer Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
              <input
                type="text"
                name="customerFirstName"
                value={formData.customerFirstName}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="John"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
              <input
                type="text"
                name="customerLastName"
                value={formData.customerLastName}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Phone *</label>
              <input
                type="tel"
                name="customerMobilePhone"
                value={formData.customerMobilePhone}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="94XXXXXXXXX"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                name="customerEmail"
                value={formData.customerEmail}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="john@example.com"
              />
            </div>
          </div>
        </div>

        {/* Billing Address */}
        <div className="bg-orange-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            Billing Address
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
              <input
                type="text"
                name="billingAddressStreet"
                value={formData.billingAddressStreet}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="154 Main Road"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Street Address 2</label>
              <input
                type="text"
                name="billingAddressStreet2"
                value={formData.billingAddressStreet2}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Apartment, suite, etc."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
              <input
                type="text"
                name="billingAddressCity"
                value={formData.billingAddressCity}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Colombo"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Province</label>
              <input
                type="text"
                name="billingAddressStateProvince"
                value={formData.billingAddressStateProvince}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Western Province"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
              <input
                type="text"
                name="billingAddressPostcodeZip"
                value={formData.billingAddressPostcodeZip}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="10100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
              <select
                name="billingAddressCountry"
                value={formData.billingAddressCountry}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="LKA">Sri Lanka</option>
              </select>
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="bg-teal-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Package className="w-5 h-5 mr-2" />
            Shipping Address
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input
                type="text"
                name="shippingContactFirstName"
                value={formData.shippingContactFirstName}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Jane"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input
                type="text"
                name="shippingContactLastName"
                value={formData.shippingContactLastName}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Phone</label>
              <input
                type="tel"
                name="shippingContactMobilePhone"
                value={formData.shippingContactMobilePhone}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="94XXXXXXXXX"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="shippingContactEmail"
                value={formData.shippingContactEmail}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="jane@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
              <input
                type="text"
                name="shippingAddressStreet"
                value={formData.shippingAddressStreet}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Main Street"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                name="shippingAddressCity"
                value={formData.shippingAddressCity}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Colombo"
              />
            </div>
          </div>
        </div>

        {/* Payment Button */}
        <div className="text-center pt-6">
          <button
            onClick={handlePayment}
            disabled={!isScriptLoaded || isLoading}
            className={`px-8 py-4 text-white text-lg font-semibold rounded-lg shadow-md transition-colors ${
              !isScriptLoaded || isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
            }`}
          >
            {isLoading ? 'Processing...' : 'PAY Now'}
          </button>
          {!isScriptLoaded && (
            <p className="text-sm text-gray-500 mt-2">Loading payment gateway...</p>
          )}
        </div>
      </div>

      {/* Documentation Note */}
      <div className="mt-12 p-6 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Important Notes:</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• The checkValue generation is shown as a placeholder - implement this on your backend for security</li>
          <li>• Merchant Key and Token should be obtained from PAYable</li>
          <li>• The notifyUrl must be publicly accessible for payment notifications</li>
          <li>• Test with sandbox environment before going live</li>
          <li>• Implement proper error handling and validation on your backend</li>
        </ul>
      </div>
    </div>
  );
};

export default PayableIPGIntegration;