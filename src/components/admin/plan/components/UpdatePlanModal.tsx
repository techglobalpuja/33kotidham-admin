'use client';

import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Modal, Form, Input, Button, Typography } from 'antd';
import { useDropzone } from 'react-dropzone';
import { updatePlan, uploadPlanImage } from '@/store/slices/planSlice';
import { AppDispatch } from '@/store';

const { Text } = Typography;

interface PlanFormData {
  name?: string | null;
  description?: string | null;
  image?: File | null;
  actual_price?: string | null;
  discounted_price?: string | null;
  existingImageUrl?: string | null;
}

interface UpdatePlanModalProps {
  planId?: number | null;
  visible?: boolean;
  planData?: any;
  onCancel?: () => void;
  onSuccess?: () => void;
}

const UpdatePlanModal: React.FC<UpdatePlanModalProps> = ({ 
  planId, 
  visible, 
  planData,
  onCancel, 
  onSuccess
}) => {
  console.log("UpdatePlanModal rendered with:", { planId, visible, planData });
  
  const safePlanId = planId ?? 0;
  const isVisible = Boolean(visible ?? false);
  const safeOnCancel = onCancel ?? (() => {});
  const safeOnSuccess = onSuccess ?? (() => {});
  
  const dispatch = useDispatch<AppDispatch>();
  const [imageChanged, setImageChanged] = useState(false);
  const [form] = Form.useForm();
  const [formData, setFormData] = useState<PlanFormData>({
    name: '',
    description: '',
    image: null,
    actual_price: '',
    discounted_price: '',
    existingImageUrl: '',
  });

  // Effect to populate form when planData is received
  useEffect(() => {
    if (planData && typeof planData === 'object' && isVisible) {
      try {
        console.log('UpdatePlanModal - Setting form data from props:', planData);
        
        const newFormData = {
          name: (planData.name ?? '').toString().trim(),
          description: (planData.description ?? '').toString().trim(),
          image: null,
          actual_price: (planData.actual_price ?? '').toString().trim(),
          discounted_price: (planData.discounted_price ?? '').toString().trim(),
          existingImageUrl: (planData.image_url ?? '').toString().trim(),
        };

        setFormData(newFormData);
        setImageChanged(false);
        
        form.setFieldsValue({
          name: newFormData.name,
          description: newFormData.description,
          actual_price: newFormData.actual_price,
          discounted_price: newFormData.discounted_price,
        });
        
        console.log('UpdatePlanModal - Form data set successfully');
      } catch (error) {
        console.error('Error setting form data from planData:', error);
      }
    }
  }, [planData, isVisible, form]);

  // Dropzone for Plan Image
  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'image/*': [] },
    multiple: false,
    maxSize: 10 * 1024 * 1024, // 10MB
    onDrop: (acceptedFiles, rejectedFiles) => {
      try {
        if (rejectedFiles.length > 0) {
          rejectedFiles.forEach(({ file, errors }) => {
            errors.forEach(error => {
              if (error.code === 'file-too-large') {
                console.error(`File ${file.name} is too large. Maximum size is 10MB.`);
              } else if (error.code === 'file-invalid-type') {
                console.error(`File ${file.name} has invalid type. Only images are allowed.`);
              }
            });
          });
        }
        
        if (Array.isArray(acceptedFiles) && acceptedFiles.length > 0 && acceptedFiles[0]) {
          const file = acceptedFiles[0];
          handleInputChange('image', file);
          setImageChanged(true);
        }
      } catch (error) {
        console.error('Error handling image drop:', error);
      }
    },
  });

  const handleInputChange = (field: keyof PlanFormData, value: any) => {
    try {
      setFormData((prev) => {
        if (!prev || typeof prev !== 'object') {
          console.error('Previous form data is invalid:', prev);
          return prev;
        }
        
        let safeValue;
        switch (field) {
          case 'image':
            safeValue = value instanceof File ? value : null;
            break;
          default:
            safeValue = (value ?? '').toString().trim();
        }
        
        return {
          ...prev,
          [field]: safeValue,
        };
      });
    } catch (error) {
      console.error(`Error updating field ${field}:`, error);
    }
  };

  // Function to create object URL for image preview
  const createImagePreviewUrl = (file: File): string => {
    return URL.createObjectURL(file);
  };

  // Function to revoke object URL to prevent memory leaks
  const revokeImagePreviewUrl = (url: string): void => {
    URL.revokeObjectURL(url);
  };

  const handleSubmit = async () => {
    console.log("UpdatePlanModal - handleSubmit called");
    console.log("Image changed:", imageChanged);
    
    try {
      if (!safePlanId) {
        console.error('Plan ID is required');
        return;
      }
      
      if (!formData || typeof formData !== 'object') {
        console.error('Form data is invalid:', formData);
        return;
      }
      
      let imageUrl = formData.existingImageUrl || '';
      
      // Only upload image if it was changed
      if (imageChanged && formData.image instanceof File) {
        console.log("Uploading new image:", formData.image);
        const uploadResult = await dispatch(uploadPlanImage(formData.image));
        
        if (uploadPlanImage.fulfilled.match(uploadResult)) {
          imageUrl = uploadResult.payload;
          console.log('Image uploaded successfully:', imageUrl);
        } else {
          console.error('Image upload failed:', uploadResult.payload);
          return;
        }
      }
      
      const requestData = {
        name: (formData.name ?? '').toString().trim(),
        description: (formData.description ?? '').toString().trim(),
        image_url: imageUrl,
        actual_price: (formData.actual_price ?? '').toString().trim(),
        discounted_price: (formData.discounted_price ?? '').toString().trim(),
      };
      
      console.log("Calling updatePlan with:", requestData);
      const updateResult = await dispatch(updatePlan({ id: safePlanId, planData: requestData }));
      console.log("Update result:", updateResult);
      
      if (updatePlan.fulfilled.match(updateResult)) {
        safeOnSuccess();
        safeOnCancel();
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error);
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <span className="text-2xl">📋</span>
          <span className="  text-xl">Update Plan</span>
        </div>
      }
      open={visible}
      onCancel={safeOnCancel}
      footer={null}
      width={800}
      style={{ top: 20 }}
      className="admin-plan-modal"
    >
      <Form form={form} onFinish={handleSubmit} layout="vertical" className="space-y-6">
        <div className="max-h-[70vh] overflow-y-auto pr-2">
          {/* Plan Details */}
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200 mb-6">
            <h3 className="text-lg font-semibold text-purple-800 mb-4   flex items-center gap-2">
              <span className="text-2xl">📋</span>
              Plan Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Form.Item
                name="name"
                label={<span className="block text-sm font-medium text-gray-700 mb-2">Plan Name</span>}
                required={true}
              >
                <Input
                  value={(formData.name ?? '').toString()}
                  onChange={(e) => handleInputChange('name', e?.target?.value ?? '')}
                  placeholder="Enter plan name"
                  className="w-full px-4 py-3 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black placeholder-gray-400"
                />
              </Form.Item>

              <Form.Item
                name="actual_price"
                label={<span className="block text-sm font-medium text-gray-700 mb-2">Actual Price (₹)</span>}
                required={true}
              >
                <Input
                  type="number"
                  value={(formData.actual_price ?? '').toString()}
                  onChange={(e) => handleInputChange('actual_price', e?.target?.value ?? '')}
                  placeholder="Enter actual price"
                  className="w-full px-4 py-3 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black placeholder-gray-400"
                />
              </Form.Item>

              <Form.Item
                name="discounted_price"
                label={<span className="block text-sm font-medium text-gray-700 mb-2">Discounted Price (₹)</span>}
              >
                <Input
                  type="number"
                  value={(formData.discounted_price ?? '').toString()}
                  onChange={(e) => handleInputChange('discounted_price', e?.target?.value ?? '')}
                  placeholder="Enter discounted price (optional)"
                  className="w-full px-4 py-3 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black placeholder-gray-400"
                />
              </Form.Item>
            </div>

            <Form.Item
              name="description"
              label={<span className="block text-sm font-medium text-gray-700 mb-2">Description</span>}
              required={true}
            >
              <Input.TextArea
                value={(formData.description ?? '').toString()}
                onChange={(e) => handleInputChange('description', e?.target?.value ?? '')}
                rows={4}
                placeholder="Enter detailed description about the plan"
                className="w-full px-4 py-3 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black placeholder-gray-400"
              />
            </Form.Item>

            <Form.Item
              name="image"
              label={<span className="block text-sm font-medium text-gray-700 mb-2">Plan Image</span>}
            >
              <div
                {...getRootProps()}
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200 border-purple-300 bg-purple-50 hover:bg-purple-100"
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg
                    className="w-8 h-8 mb-2 text-purple-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <p className="mb-1 text-sm font-medium text-purple-600">
                    {formData.image ? `Selected: ${formData.image.name}` : 'Click or drag to upload new image'}
                  </p>
                  <p className="text-xs text-purple-500">PNG, JPG, JPEG up to 10MB</p>
                  {imageChanged && (
                    <p className="text-xs text-green-600 font-medium mt-1">Image will be updated when saved</p>
                  )}
                </div>
              </div>
              
              {/* Display selected new image preview */}
              {formData.image && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">New Image to Upload:</h4>
                  <div className="relative bg-white p-3 rounded-lg border border-purple-200">
                    {(() => {
                      let previewUrl = '';
                      try {
                        previewUrl = createImagePreviewUrl(formData.image);
                      } catch (e) {
                        // If we can't create a preview, we'll show the file icon
                      }
                      
                      return (
                        <>
                          {previewUrl ? (
                            <div className="relative w-full h-48 mb-2 rounded overflow-hidden">
                              <img 
                                src={previewUrl} 
                                alt="Preview" 
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  revokeImagePreviewUrl(previewUrl);
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            </div>
                          ) : (
                            <div className="flex items-center justify-center w-full h-48 mb-2 bg-purple-50 rounded">
                              <svg className="w-8 h-8 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-600 truncate flex-1">{formData.image.name}</span>
                            <button
                              type="button"
                              onClick={() => {
                                if (previewUrl) {
                                  revokeImagePreviewUrl(previewUrl);
                                }
                                handleInputChange('image', null);
                                setImageChanged(false);
                              }}
                              className="text-red-500 hover:text-red-700 text-xs"
                            >
                              ✕
                            </button>
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            {(formData.image.size / 1024 / 1024).toFixed(2)} MB
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}
              
              {/* Show existing image info */}
              {planData && planData.image_url && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="text-sm font-medium text-blue-700 mb-2">Current Image:</h4>
                  <div className="flex items-center gap-2">
                    <img 
                      src={`https://api.33kotidham.in/${planData.image_url}`} 
                      alt="Current plan" 
                      className="w-20 h-20 object-cover rounded border border-blue-200"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <p className="text-xs text-blue-600">
                      {imageChanged ? 'This will be replaced with new image when saved' : 'Upload new image to replace this'}
                    </p>
                  </div>
                </div>
              )}
            </Form.Item>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="default"
            onClick={safeOnCancel}
            className="px-6 py-2"
          >
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-6 py-2 border-none"
          >
            Update Plan
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default UpdatePlanModal;
