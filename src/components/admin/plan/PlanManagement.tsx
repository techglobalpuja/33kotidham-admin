'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { fetchPlans, createPlan, updatePlan, deletePlan, uploadPlanImage, setSelectedPlan } from '@/store/slices/planSlice';
import Button from '@/components/ui/Button';
import EditText from '@/components/ui/EditText';
import { Plan } from '@/store/slices/planSlice';

const PlanManagement: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { plans, isLoading, error, selectedPlan } = useSelector((state: RootState) => state.plan);
  const [activeSubTab, setActiveSubTab] = useState<'all' | 'add' | 'edit' | 'view'>('all');
  const [name, setName] = useState('');
  const [actualPrice, setActualPrice] = useState('');
  const [discountedPrice, setDiscountedPrice] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch plans on component mount
  useEffect(() => {
    dispatch(fetchPlans());
  }, [dispatch]);

  // Populate form when editing
  useEffect(() => {
    if (activeSubTab === 'edit' && selectedPlan) {
      setName(selectedPlan.name);
      setActualPrice(selectedPlan.actual_price);
      setDiscountedPrice(selectedPlan.discounted_price);
      setDescription(selectedPlan.description);
      setExistingImageUrl(selectedPlan.image_url || null);
      setImagePreview(selectedPlan.image_url || null);
    } else if (activeSubTab === 'add') {
      // Reset form for add mode
      resetForm();
    }
  }, [activeSubTab, selectedPlan]);

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImage(file);
    
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(existingImageUrl);
    }
  };

  // Reset form
  const resetForm = () => {
    setName('');
    setActualPrice('');
    setDiscountedPrice('');
    setDescription('');
    setImage(null);
    setImagePreview(null);
    setExistingImageUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle form submission for create or update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let imageUrl = existingImageUrl || '';
    
    // Upload image if selected
    if (image) {
      try {
        const resultAction = await dispatch(uploadPlanImage(image));
        if (uploadPlanImage.fulfilled.match(resultAction)) {
          imageUrl = resultAction.payload;
        }
      } catch (error) {
        console.error('Image upload failed:', error);
      }
    }
    
    const planData = {
      name,
      description,
      image_url: imageUrl,
      actual_price: actualPrice,
      discounted_price: discountedPrice,
    };
    
    if (activeSubTab === 'add') {
      // Create new plan
      const resultAction = await dispatch(createPlan(planData));
      if (createPlan.fulfilled.match(resultAction)) {
        resetForm();
        setActiveSubTab('all');
      }
    } else if (activeSubTab === 'edit' && selectedPlan) {
      // Update existing plan
      const resultAction = await dispatch(updatePlan({ id: selectedPlan.id, planData }));
      if (updatePlan.fulfilled.match(resultAction)) {
        resetForm();
        setActiveSubTab('all');
      }
    }
  };

  // Handle plan view
  const handleView = (plan: Plan) => {
    dispatch(setSelectedPlan(plan));
    setActiveSubTab('view');
  };

  // Handle plan edit
  const handleEdit = (plan: Plan) => {
    dispatch(setSelectedPlan(plan));
    setActiveSubTab('edit');
  };

  // Handle plan delete
  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this plan?')) {
      await dispatch(deletePlan(id));
    }
  };

  // Handle image removal
  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);
    setExistingImageUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Plan Management</h2>
        <div className="flex space-x-3">
          <Button
            variant={activeSubTab === 'all' ? 'primary' : 'outline'}
            onClick={() => setActiveSubTab('all')}
          >
            All Plans
          </Button>
          <Button
            variant={activeSubTab === 'add' ? 'primary' : 'outline'}
            onClick={() => {
              dispatch(setSelectedPlan(null));
              setActiveSubTab('add');
            }}
          >
            Add New Plan
          </Button>
        </div>
      </div>

      {isLoading && <div>Loading...</div>}
      {error && <div className="text-red-500">Error: {error}</div>}

      {activeSubTab === 'all' ? (
        <>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex space-x-2">
              <EditText
                placeholder="Search plans..."
                className="w-48"
              />
              <Button variant="outline" size="sm">
                Filter
              </Button>
            </div>
          </div>

          {/* Plan List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plan Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Discounted Price
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {plans && plans.map((plan) => (
                  <tr key={plan.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{plan.name}</div>
                      <div className="text-sm text-gray-500">{plan.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">₹{plan.actual_price}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">₹{plan.discounted_price}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        parseFloat(plan.discounted_price) > 0 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {parseFloat(plan.discounted_price) > 0 ? 'Discounted' : 'Regular'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mr-2"
                        onClick={() => handleView(plan)}
                      >
                        View
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mr-2"
                        onClick={() => handleEdit(plan)}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="danger" 
                        size="sm"
                        onClick={() => handleDelete(plan.id)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : activeSubTab === 'view' && selectedPlan ? (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Plan Details</h3>
            <Button 
              variant="outline" 
              onClick={() => setActiveSubTab('all')}
            >
              Back to List
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-2">Plan Information</h4>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium text-black">{selectedPlan.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Description</p>
                  <p className="font-medium text-black">{selectedPlan.description}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Actual Price</p>
                  <p className="font-medium text-black">₹{selectedPlan.actual_price}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Discounted Price</p>
                  <p className="font-medium text-black">₹{selectedPlan.discounted_price}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Created At</p>
                  <p className="font-medium text-black">{new Date(selectedPlan.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-2">Plan Image</h4>
              {selectedPlan.image_url ? (
                <img 
                  src={`https://api.33kotidham.com/${selectedPlan.image_url}`} 
                  alt={selectedPlan.name} 
                  className="w-full max-w-xs h-auto rounded-lg border border-gray-300"
                />
              ) : (
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full max-w-xs h-48 flex items-center justify-center">
                  <span className="text-gray-500">No Image</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <Button 
              variant="outline" 
              onClick={() => handleEdit(selectedPlan)}
            >
              Edit Plan
            </Button>
            <Button 
              variant="danger"
              onClick={() => handleDelete(selectedPlan.id)}
            >
              Delete Plan
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            {activeSubTab === 'add' ? 'Add New Plan' : 'Edit Plan'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <EditText
                  label="Plan Name"
                  placeholder="Enter plan name"
                  value={name}
                  onChange={setName}
                  fullWidth
                  required
                />
              </div>
              <div>
                <EditText
                  label="Actual Price"
                  placeholder="Enter actual price"
                  type="number"
                  value={actualPrice}
                  onChange={setActualPrice}
                  fullWidth
                  required
                />
              </div>
              <div>
                <EditText
                  label="Discounted Price"
                  placeholder="Enter discounted price (optional)"
                  type="number"
                  value={discountedPrice}
                  onChange={setDiscountedPrice}
                  fullWidth
                />
              </div>
              <div>
                <div className="block text-sm font-medium text-[#111111] mb-1 sm:mb-2">
                  Image
                </div>
                <div className="flex items-center space-x-4">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden"
                    id="plan-image"
                  />
                  <label
                    htmlFor="plan-image"
                    className="cursor-pointer px-4 py-2 bg-[#fff3ee] text-[#111111] rounded-[30px] border border-[#5c4228] hover:bg-[#f37335] hover:text-white transition-colors"
                  >
                    Choose Image
                  </label>
                  {imagePreview && (
                    <div className="relative">
                      <img 
                        src={`https://api.33kotidham.com/${imagePreview}`} 
                        alt="Preview" 
                        className="w-16 h-16 object-cover rounded-lg border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="md:col-span-2">
                <div className="block text-sm font-medium text-[#111111] mb-1 sm:mb-2">
                  Description
                </div>
                <textarea
                  placeholder="Enter plan description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full transition-all duration-200 ease-in-out border border-[#5c4228] rounded-[30px] bg-[#fff3ee] text-[#111111] placeholder:text-[#6d6d6d] focus:outline-none focus:ring-2 focus:ring-[#f37335] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base px-4 py-3 sm:py-4"
                  rows={4}
                  required
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setActiveSubTab('all')}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="primary"
                disabled={isLoading}
              >
                {isLoading ? (activeSubTab === 'add' ? 'Saving...' : 'Updating...') : (activeSubTab === 'add' ? 'Save Plan' : 'Update Plan')}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default PlanManagement;