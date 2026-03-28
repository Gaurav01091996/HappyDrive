import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ProfileCompletion = () => {
  const navigate = useNavigate();
  const { updateProfileStatus, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [form, setForm] = useState({
    phone: '',
    address: '',
    drivingLicenseNumber: '',
    age: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    setFileError('');
    
    if (!file) {
      setUploadedFile(null);
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      setFileError('Invalid file type. Only JPG, JPEG, and PNG files are allowed.');
      e.target.value = '';
      return;
    }

    // Validate file size (200 KB - 500 KB)
    const minSize = 200 * 1024; // 200 KB
    const maxSize = 500 * 1024; // 500 KB
    const fileSizeKB = file.size / 1024;

    if (file.size < minSize) {
      setFileError(`File size is too small. Minimum size is 200 KB. Current size: ${fileSizeKB.toFixed(2)} KB.`);
      e.target.value = '';
      return;
    }

    if (file.size > maxSize) {
      setFileError(`File size is too large. Maximum size is 500 KB. Current size: ${fileSizeKB.toFixed(2)} KB.`);
      e.target.value = '';
      return;
    }

    setUploadedFile(file);
  };

  const validateForm = () => {
    if (!form.phone.trim()) {
      setError('Phone number is required');
      return false;
    }

    const phoneRegex = /^\+?[1-9]\d{9,14}$/;
    if (!phoneRegex.test(form.phone.trim())) {
      setError('Please enter a valid phone number (e.g., +919876543210)');
      return false;
    }

    if (!form.address.trim()) {
      setError('Address is required');
      return false;
    }

    if (form.address.trim().length < 5) {
      setError('Address must be at least 5 characters long');
      return false;
    }

    if (!form.drivingLicenseNumber.trim()) {
      setError('Driving License Number is required');
      return false;
    }

    if (form.drivingLicenseNumber.trim().length < 5) {
      setError('Driving License Number must be at least 5 characters long');
      return false;
    }

    if (!form.age) {
      setError('Age is required');
      return false;
    }

    const age = parseInt(form.age);
    if (isNaN(age)) {
      setError('Age must be a valid number');
      return false;
    }

    if (age < 18) {
      setError('You must be at least 18 years old to rent a vehicle');
      return false;
    }

    if (age > 100) {
      setError('Please enter a valid age');
      return false;
    }

    if (!uploadedFile) {
      setFileError('Driving License upload is required');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('hd_token');
      const formData = new FormData();
      formData.append('phone', form.phone);
      formData.append('address', form.address);
      formData.append('driving_license_number', form.drivingLicenseNumber);
      formData.append('age', form.age);
      formData.append('driving_license_file', uploadedFile);

      const response = await fetch('/api/v1/profile/complete', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      // Read response body only once
      let responseText = '';
      try {
        responseText = await response.text();
      } catch (e) {
        responseText = '';
      }

      if (!response.ok) {
        let errorMessage = 'Failed to complete profile. Please try again.';
        
        // Try to parse as JSON if we have text content
        if (responseText) {
          try {
            const errorData = JSON.parse(responseText);
            errorMessage = errorData.detail || errorData.message || errorMessage;
          } catch (e) {
            // Response was not JSON, use a generic message
            errorMessage = responseText || errorMessage;
          }
        }
        
        throw new Error(errorMessage);
      }

      // Success - Update auth context and navigate
      updateProfileStatus(true);
      navigate('/cars', { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to complete profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all duration-200';

  return (
    <div className="min-h-screen bg-black pt-20 pb-20 flex items-center justify-center px-4">
      <div className="w-full max-w-2xl">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 md:p-12">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Complete Your Profile
            </h1>
            <p className="text-gray-400 text-base md:text-lg">
              To get started, we need some additional information and your driving license details. This helps us ensure a safe rental experience for everyone.
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-600/20 border border-red-600/50 rounded-lg flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-300 font-medium text-sm">Error</p>
                <p className="text-red-200 text-sm mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Phone Number <span className="text-red-400">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleInputChange}
                placeholder="+91 9876543210"
                className={inputClass}
                required
              />
              <p className="text-xs text-gray-500 mt-1">Format: +91 followed by 10 digits</p>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Full Address <span className="text-red-400">*</span>
              </label>
              <textarea
                name="address"
                value={form.address}
                onChange={handleInputChange}
                placeholder="123 Main Street, City, State 12345"
                rows="3"
                className={`${inputClass} resize-none`}
                required
              />
              <p className="text-xs text-gray-500 mt-1">Minimum 5 characters</p>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Driving License Number */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Driving License Number <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="drivingLicenseNumber"
                  value={form.drivingLicenseNumber}
                  onChange={handleInputChange}
                  placeholder="DL0001234561234"
                  className={inputClass}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Minimum 5 characters</p>
              </div>

              {/* Age */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Age <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  name="age"
                  value={form.age}
                  onChange={handleInputChange}
                  placeholder="28"
                  min="18"
                  max="100"
                  className={inputClass}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Must be 18 or older</p>
              </div>
            </div>

            {/* Driving License Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Upload Driving License <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="hidden"
                  id="license-upload"
                  required
                />
                <label
                  htmlFor="license-upload"
                  className="flex flex-col items-center justify-center w-full px-4 py-8 border-2 border-dashed border-white/20 rounded-lg cursor-pointer hover:border-red-600/50 hover:bg-red-600/5 transition-all duration-200 bg-white/5"
                >
                  <Upload className="w-10 h-10 text-gray-400 mb-2" />
                  <p className="text-white font-medium text-center">
                    {uploadedFile ? 'File Selected' : 'Click to upload'}
                  </p>
                  <p className="text-gray-400 text-sm text-center mt-1">
                    {uploadedFile
                      ? uploadedFile.name
                      : 'JPG, JPEG, or PNG (200 KB - 500 KB)'}
                  </p>
                </label>
              </div>

              {fileError && (
                <div className="mt-3 p-3 bg-red-600/20 border border-red-600/50 rounded-lg flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-red-200 text-sm">{fileError}</p>
                </div>
              )}

              {uploadedFile && !fileError && (
                <div className="mt-3 p-3 bg-green-600/20 border border-green-600/50 rounded-lg flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  <p className="text-green-200 text-sm">
                    File ready for upload: {uploadedFile.name}
                  </p>
                </div>
              )}
            </div>

            {/* Info Box */}
            <div className="bg-blue-600/20 border border-blue-600/50 rounded-lg p-4">
              <p className="text-blue-200 text-sm">
                ℹ️ All information you provide is securely stored and used only for verification purposes.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:bg-red-600/50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg shadow-red-600/30 mt-8"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Completing Profile...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>Complete Profile</span>
                </>
              )}
            </button>
          </form>

          {/* Note */}
          <p className="text-center text-gray-500 text-xs mt-6">
            By completing your profile, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfileCompletion;
