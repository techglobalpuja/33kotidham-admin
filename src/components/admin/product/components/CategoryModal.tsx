'use client';

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Modal, message } from 'antd';
import { AppDispatch, RootState } from '@/store';
import { createProductCategory } from '@/store/slices/productCategorySlice';
import EditText from '@/components/ui/EditText';

interface CategoryModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (categoryId: number) => void;
}

const CategoryModal: React.FC<CategoryModalProps> = ({ visible, onClose, onSuccess }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading } = useSelector((state: RootState) => state.productCategory);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_active: true,
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.name.trim()) {
      message.error('Category name is required');
      return;
    }

    try {
      const result = await dispatch(createProductCategory(formData)).unwrap();
      message.success('Category created successfully');
      onSuccess(result.id);
      handleClose();
    } catch (error: any) {
      message.error(error || 'Failed to create category');
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      is_active: true,
    });
    onClose();
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <span className="text-xl">➕</span>
          <span className="text-lg font-semibold">Add New Category</span>
        </div>
      }
      open={visible}
      onCancel={handleClose}
      onOk={handleSubmit}
      okText="Create Category"
      cancelText="Cancel"
      confirmLoading={isLoading}
      width={500}
    >
      <div className="space-y-4 mt-4">
        <div>
          <EditText
            label="Category Name"
            placeholder="Enter category name"
            value={formData.name}
            onChange={(value) => handleInputChange('name', value)}
            fullWidth
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#111111] mb-1 sm:mb-2">
            Description
          </label>
          <textarea
            placeholder="Enter category description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className="w-full transition-all duration-200 ease-in-out border border-[#5c4228] rounded-[30px] bg-[#fff3ee] text-[#111111] placeholder:text-[#6d6d6d] focus:outline-none focus:ring-2 focus:ring-[#f37335] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base px-4 py-3 sm:py-4"
            rows={3}
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="is_active"
            checked={formData.is_active}
            onChange={(e) => handleInputChange('is_active', e.target.checked)}
            className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
          />
          <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
            Active
          </label>
        </div>
      </div>
    </Modal>
  );
};

export default CategoryModal;
