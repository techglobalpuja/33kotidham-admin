'use client';

import React, { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import EditText from '@/components/ui/EditText';

interface PujaData {
  id: string;
  name: string;
  subHeading: string;
  about: string;
  date: string;
  time: string;
  status: 'Active' | 'Inactive';
  featured: boolean;
}

const PujaUpdate: React.FC<{ pujaId: string }> = ({ pujaId }) => {
  const [formData, setFormData] = useState<PujaData>({
    id: '',
    name: '',
    subHeading: '',
    about: '',
    date: '',
    time: '',
    status: 'Active',
    featured: false
  });

  // Simulate fetching puja data by ID
  useEffect(() => {
    // In a real app, this would be an API call
    const mockPujaData: PujaData = {
      id: pujaId,
      name: 'Ganesh Puja',
      subHeading: 'Remover of obstacles',
      about: 'Ganesh Puja is performed to seek blessings of Lord Ganesha for success and prosperity.',
      date: '2024-01-15',
      time: '09:00 AM',
      status: 'Active',
      featured: true
    };
    
    setFormData(mockPujaData);
  }, [pujaId]);

  const handleInputChange = (field: keyof PujaData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Update submitted:', formData);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Update Puja</h3>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <EditText
              label="Puja Name"
              placeholder="Enter puja name"
              value={formData.name}
              onChange={(value) => handleInputChange('name', value)}
              fullWidth
            />
          </div>
          <div>
            <EditText
              label="Sub Heading"
              placeholder="Enter sub heading"
              value={formData.subHeading}
              onChange={(value) => handleInputChange('subHeading', value)}
              fullWidth
            />
          </div>
          <div className="md:col-span-2">
            <div className="block text-sm font-medium text-[#111111] mb-1 sm:mb-2">
              About
            </div>
            <textarea
              placeholder="Enter description"
              value={formData.about}
              onChange={(e) => handleInputChange('about', e.target.value)}
              className="w-full transition-all duration-200 ease-in-out border border-[#5c4228] rounded-[30px] bg-[#fff3ee] text-[#111111] placeholder:text-[#6d6d6d] focus:outline-none focus:ring-2 focus:ring-[#f37335] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base px-4 py-3 sm:py-4"
              rows={4}
            />
          </div>
          <div>
            <EditText
              label="Date"
              placeholder="Enter date"
              value={formData.date}
              onChange={(value) => handleInputChange('date', value)}
              fullWidth
            />
          </div>
          <div>
            <EditText
              label="Time"
              placeholder="Enter time"
              value={formData.time}
              onChange={(value) => handleInputChange('time', value)}
              fullWidth
            />
          </div>
          <div>
            <div className="block text-sm font-medium text-[#111111] mb-1 sm:mb-2">
              Status
            </div>
            <div className="flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-[#f37335]"
                  checked={formData.status === 'Active'}
                  onChange={() => handleInputChange('status', 'Active')}
                />
                <span className="ml-2">Active</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-[#f37335]"
                  checked={formData.status === 'Inactive'}
                  onChange={() => handleInputChange('status', 'Inactive')}
                />
                <span className="ml-2">Inactive</span>
              </label>
            </div>
          </div>
          <div>
            <div className="block text-sm font-medium text-[#111111] mb-1 sm:mb-2">
              Featured
            </div>
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                className="form-checkbox text-[#f37335]"
                checked={formData.featured}
                onChange={(e) => handleInputChange('featured', e.target.checked)}
              />
              <span className="ml-2">Mark as featured puja</span>
            </label>
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <Button variant="outline" type="button">Cancel</Button>
          <Button variant="primary" type="submit">Update Puja</Button>
        </div>
      </form>
    </div>
  );
};

export default PujaUpdate;