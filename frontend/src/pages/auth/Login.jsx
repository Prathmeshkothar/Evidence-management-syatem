import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Select, MenuItem } from '@mui/material';

function Login({ updateAuth }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    policeStation: '',
    role: 'user'
  });

  const roles = [
    { value: 'admin', label: 'Admin' },
    { value: 'investigation', label: 'Investigation Officer' },
    { value: 'forensic', label: 'Forensic Expert' }
  ];
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', formData);
      if (response.data.token) {
        updateAuth(response.data);
        localStorage.setItem('auth', JSON.stringify(response.data));
        toast.success('Login successful!');
        navigate('/dashboard');
      } else {
        toast.error('Invalid credentials');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      toast.error(errorMessage);
      console.error('Login error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#2F3B8C] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 bg-[#2F3B8C] rounded-full flex items-center justify-center mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">Digital Evidence Management</h1>
          <p className="text-sm text-gray-600 mt-1">Login to your account</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label htmlFor="policeStation" className="block text-sm font-medium text-gray-700">Police Station</label>
            <input
              type="text"
              id="policeStation"
              name="policeStation"
              value={formData.policeStation}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
            <Select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="mt-1 block w-full"
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#E5E7EB',
                  },
                  '&:hover fieldset': {
                    borderColor: '#6366F1',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#6366F1',
                  },
                },
              }}
            >
              {roles.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
              
            </Select>
          </div>
          <button
            type="submit"
            className="w-full bg-[#2F3B8C] text-white py-2 px-4 rounded-md hover:bg-[#1F2A7C] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Login
          </button>
          <div className="text-center mt-4">
            <span className="text-sm text-gray-600">Don't have an account? </span>
            <button
              type="button"
              onClick={() => navigate('/signup')}
              className="text-[#2F3B8C] hover:text-[#1F2A7C] text-sm font-medium focus:outline-none"
            >
              Sign up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;