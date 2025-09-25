'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import EditText from '@/components/ui/EditText';

interface Benefit {
  title: string;
  description: string;
}

interface PujaFormData {
  pujaName: string;
  subHeading: string;
  about: string;
  date: string;
  time: string;
  pujaImages: string[];
  templeImage: string;
  templeAddress: string;
  templeDescription: string;
  benefits: Benefit[];
  selectedPlanIds: string[];
  prasadPrice: number;
  prasadStatus: boolean;
  dakshinaPrices: string;
  dakshinaPricesUSD: string;
  dakshinaStatus: boolean;
  manokamanaPrices: string;
  manokamanaPricesUSD: string;
  manokamnaStatus: boolean;
  category: string;
  isActive: boolean;
  isFeatured: boolean;
}

const PujaForm: React.FC = () => {
  const [formData, setFormData] = useState<PujaFormData>({
    pujaName: '',
    subHeading: '',
    about: '',
    date: '',
    time: '',
    pujaImages: [],
    templeImage: '',
    templeAddress: '',
    templeDescription: '',
    benefits: [
      { title: '', description: '' },
      { title: '', description: '' },
      { title: '', description: '' },
      { title: '', description: '' }
    ],
    selectedPlanIds: [],
    prasadPrice: 0,
    prasadStatus: false,
    dakshinaPrices: '',
    dakshinaPricesUSD: '',
    dakshinaStatus: false,
    manokamanaPrices: '',
    manokamanaPricesUSD: '',
    manokamnaStatus: false,
    category: 'general',
    isActive: true,
    isFeatured: false
  });

  const handleInputChange = (field: keyof PujaFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBenefitChange = (index: number, field: keyof Benefit, value: string) => {
    const newBenefits = [...formData.benefits];
    newBenefits[index] = { ...newBenefits[index], [field]: value };
    setFormData(prev => ({ ...prev, benefits: newBenefits }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Section 1: Puja Details */}
      <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200">
        <h3 className="text-lg font-semibold text-orange-800 mb-4 font-['Philosopher'] flex items-center gap-2">
          <span className="text-2xl">🛕</span>
          1. Puja Details
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <EditText
            label="Puja Name"
            placeholder="Enter puja name"
            value={formData.pujaName}
            onChange={(value) => handleInputChange('pujaName', value)}
            required
          />
          
          <EditText
            label="Sub Heading"
            placeholder="Enter puja sub heading"
            value={formData.subHeading}
            onChange={(value) => handleInputChange('subHeading', value)}
            required
          />
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">About Puja</label>
          <textarea
            value={formData.about}
            onChange={(e) => handleInputChange('about', e.target.value)}
            rows={4}
            className="w-full px-4 py-3 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="Enter detailed description about the puja"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              className="w-full px-4 py-3 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
            <input
              type="time"
              value={formData.time}
              onChange={(e) => handleInputChange('time', e.target.value)}
              className="w-full px-4 py-3 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        {/* Puja Images Upload */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Puja Images (Max 6)</label>
          <div className="space-y-4">
            <div className="relative">
              <input
                type="file"
                id="pujaImagesUpload"
                accept="image/*"
                multiple
                className="hidden"
              />
              <label
                htmlFor="pujaImagesUpload"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200 border-orange-300 bg-orange-50 hover:bg-orange-100"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg className="w-8 h-8 mb-2 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="mb-1 text-sm font-medium text-orange-600">
                    Click to upload images
                  </p>
                  <p className="text-xs text-orange-500">PNG, JPG, JPEG up to 10MB</p>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Temple Details */}
      <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 p-6 rounded-xl border border-indigo-200">
        <h3 className="text-lg font-semibold text-indigo-800 mb-4 font-['Philosopher'] flex items-center gap-2">
          <span className="text-2xl">🏦</span>
          2. Temple Details
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Temple Image</label>
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="file"
                  id="templeImageUpload"
                  accept="image/*"
                  className="hidden"
                />
                <label
                  htmlFor="templeImageUpload"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-indigo-300 rounded-lg cursor-pointer bg-indigo-50 hover:bg-indigo-100 transition-colors duration-200"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-8 h-8 mb-2 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="mb-1 text-sm text-indigo-600 font-medium">
                      <span>Upload Temple Image</span>
                    </p>
                    <p className="text-xs text-indigo-500">PNG, JPG, JPEG up to 10MB</p>
                  </div>
                </label>
              </div>
            </div>
          </div>
          
          <EditText
            label="Temple Address"
            placeholder="Enter complete temple address"
            value={formData.templeAddress}
            onChange={(value) => handleInputChange('templeAddress', value)}
            required
          />
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Temple Description</label>
          <textarea
            value={formData.templeDescription}
            onChange={(e) => handleInputChange('templeDescription', e.target.value)}
            rows={4}
            className="w-full px-4 py-3 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Enter temple description, history, and significance"
            required
          />
        </div>
      </div>

      {/* Section 3: Puja Benefits */}
      <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
        <h3 className="text-lg font-semibold text-green-800 mb-4 font-['Philosopher'] flex items-center gap-2">
          <span className="text-2xl">✨</span>
          3. Puja Benefits
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {formData.benefits.map((benefit, index) => (
            <div key={index} className="bg-white p-4 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-700 mb-3">Benefit {index + 1}</h4>
              <div className="space-y-3">
                <EditText
                  label="Title"
                  placeholder={`Enter benefit ${index + 1} title`}
                  value={benefit.title}
                  onChange={(value) => handleBenefitChange(index, 'title', value)}
                  required
                />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={benefit.description}
                    onChange={(e) => handleBenefitChange(index, 'description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                    placeholder={`Enter benefit ${index + 1} description`}
                    required
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 4: Plan Details */}
      <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
        <h3 className="text-lg font-semibold text-purple-800 mb-4 font-['Philosopher'] flex items-center gap-2">
          <span className="text-2xl">📋</span>
          4. Plan Details
        </h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Plans (Multiple Selection)</label>
          <div className="relative">
            <select
              multiple
              value={formData.selectedPlanIds}
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions, option => option.value);
                handleInputChange('selectedPlanIds', selected);
              }}
              className="w-full px-4 py-3 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-left"
              size={4}
            >
              <option value="1">Basic Puja Package - ₹5,000</option>
              <option value="2">Premium VIP Experience - ₹15,000</option>
              <option value="3">Standard Family Package - ₹8,000</option>
              <option value="4">Exclusive VIP Darshan - ₹25,000</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple plans</p>
          </div>
        </div>
      </div>

      {/* Section 5: Prasad */}
      <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-6 rounded-xl border border-yellow-200">
        <h3 className="text-lg font-semibold text-yellow-800 mb-4 font-['Philosopher'] flex items-center gap-2">
          <span className="text-2xl">🍯</span>
          5. Prasad
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Prasad Price (₹)</label>
            <input
              type="number"
              placeholder="Enter prasad price"
              value={formData.prasadPrice.toString()}
              onChange={(e) => handleInputChange('prasadPrice', parseInt(e.target.value) || 0)}
              className="w-full px-4 py-3 border border-yellow-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center gap-4 mt-8">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.prasadStatus}
                onChange={(e) => handleInputChange('prasadStatus', e.target.checked)}
                className="w-5 h-5 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
              />
              <span className="text-sm font-medium text-gray-700">Active Prasad Service</span>
            </label>
          </div>
        </div>
      </div>

      {/* Section 6: Dakshina */}
      <div className="bg-gradient-to-r from-red-50 to-red-100 p-6 rounded-xl border border-red-200">
        <h3 className="text-lg font-semibold text-red-800 mb-4 font-['Philosopher'] flex items-center gap-2">
          <span className="text-2xl">💰</span>
          6. Dakshina
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Dakshina Prices (₹)</label>
            <input
              type="text"
              placeholder="e.g., 101,201,310,500"
              value={formData.dakshinaPrices}
              onChange={(e) => handleInputChange('dakshinaPrices', e.target.value)}
              className="w-full px-4 py-3 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">Enter comma-separated values for multiple price options</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Dakshina Prices (USD)</label>
            <input
              type="text"
              placeholder="e.g., 1.5,2.5,4.0,6.0"
              value={formData.dakshinaPricesUSD}
              onChange={(e) => handleInputChange('dakshinaPricesUSD', e.target.value)}
              className="w-full px-4 py-3 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">Optional: Manual USD pricing (comma-separated)</p>
          </div>
          
          <div className="flex items-center gap-4 mt-8">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.dakshinaStatus}
                onChange={(e) => handleInputChange('dakshinaStatus', e.target.checked)}
                className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
              />
              <span className="text-sm font-medium text-gray-700">Active Dakshina</span>
            </label>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-white rounded-lg border border-red-200">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Note: </span>
            <span className="text-red-600">No automatic conversion - you can manually set both INR and USD prices</span>
          </p>
        </div>
      </div>

      {/* Section 7: Manokamna Parchi */}
      <div className="bg-gradient-to-r from-pink-50 to-pink-100 p-6 rounded-xl border border-pink-200">
        <h3 className="text-lg font-semibold text-pink-800 mb-4 font-['Philosopher'] flex items-center gap-2">
          <span className="text-2xl">📜</span>
          7. Manokamna Parchi
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Manokamna Prices (₹)</label>
            <input
              type="text"
              placeholder="e.g., 51,101,151,251"
              value={formData.manokamanaPrices}
              onChange={(e) => handleInputChange('manokamanaPrices', e.target.value)}
              className="w-full px-4 py-3 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">Enter comma-separated values for multiple price options</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Manokamna Prices (USD)</label>
            <input
              type="text"
              placeholder="e.g., 0.75,1.25,2.0,3.0"
              value={formData.manokamanaPricesUSD}
              onChange={(e) => handleInputChange('manokamanaPricesUSD', e.target.value)}
              className="w-full px-4 py-3 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">Optional: Manual USD pricing (comma-separated)</p>
          </div>
          
          <div className="flex items-center gap-4 mt-8">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.manokamnaStatus}
                onChange={(e) => handleInputChange('manokamnaStatus', e.target.checked)}
                className="w-5 h-5 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
              />
              <span className="text-sm font-medium text-gray-700">Active Manokamna</span>
            </label>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-white rounded-lg border border-pink-200">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Note: </span>
            <span className="text-pink-600">Manokamna Parchi allows devotees to write their wishes and prayers. No automatic conversion - you can manually set both INR and USD prices</span>
          </p>
        </div>
      </div>

      {/* General Settings & Form Actions */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 font-['Philosopher'] flex items-center gap-2">
          <span className="text-2xl">⚙️</span>
          General Settings
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="general">General</option>
              <option value="prosperity">Prosperity</option>
              <option value="health">Health</option>
              <option value="education">Education</option>
              <option value="marriage">Marriage</option>
              <option value="spiritual">Spiritual</option>
            </select>
          </div>
          
          <div className="flex items-center gap-6 mt-8">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => handleInputChange('isActive', e.target.checked)}
                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <span className="text-sm font-medium text-gray-700">Active</span>
            </label>
            
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => handleInputChange('isFeatured', e.target.checked)}
                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <span className="text-sm font-medium text-gray-700">Featured</span>
            </label>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-3 rounded-lg font-medium">
          Create Puja
        </Button>
        <Button
          type="button"
          onClick={() => {
            setFormData({
              pujaName: '',
              subHeading: '',
              about: '',
              date: '',
              time: '',
              pujaImages: [],
              templeImage: '',
              templeAddress: '',
              templeDescription: '',
              benefits: [
                { title: '', description: '' },
                { title: '', description: '' },
                { title: '', description: '' },
                { title: '', description: '' }
              ],
              selectedPlanIds: [],
              prasadPrice: 0,
              prasadStatus: false,
              dakshinaPrices: '',
              dakshinaPricesUSD: '',
              dakshinaStatus: false,
              manokamanaPrices: '',
              manokamanaPricesUSD: '',
              manokamnaStatus: false,
              category: 'general',
              isActive: true,
              isFeatured: false
            });
          }}
          className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-3 rounded-lg font-medium"
        >
          Reset
        </Button>
      </div>
    </form>
  );
};

export default PujaForm;