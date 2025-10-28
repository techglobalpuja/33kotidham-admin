'use client';

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Modal, Form, Input, Button, message, Spin } from 'antd';
import { useDropzone } from 'react-dropzone';
import { updateTemple, uploadTempleImage } from '@/store/slices/templeSlice';
import { fetchChadawas } from '@/store/slices/chadawaSlice';
import { fetchPujas } from '@/store/slices/pujaSlice';
import { AppDispatch, RootState } from '@/store';
import { Temple } from '@/types';

const { TextArea } = Input;

interface UpdateTempleModalProps {
  templeId: number | null;
  visible: boolean;
  templeData: Temple | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const UpdateTempleModal: React.FC<UpdateTempleModalProps> = ({ 
  templeId, 
  visible, 
  templeData,
  onCancel, 
  onSuccess
}) => {
  console.log("UpdateTempleModal rendered with:", { templeId, visible, templeData });
  
  const dispatch = useDispatch<AppDispatch>();
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const { chadawas, isLoading: chadawasLoading } = useSelector((state: RootState) => state.chadawa);
  const { pujas, isLoading: pujasLoading } = useSelector((state: RootState) => state.puja);

  useEffect(() => {
    dispatch(fetchChadawas());
    dispatch(fetchPujas());
  }, [dispatch]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    slug: '',
    image_url: '',
    imageFile: null as File | null,
    chadawa_ids: [] as number[],
    recommended_puja_ids: [] as number[],
  });

  // Update form data when templeData changes
  useEffect(() => {
    if (templeData) {
      const chadawaIds = Array.isArray(templeData.chadawas) 
        ? templeData.chadawas.map((c: any) => c.id || c)
        : [];
      const pujaIds = Array.isArray(templeData.recommended_pujas)
        ? templeData.recommended_pujas.map((p: any) => typeof p.id === 'string' ? parseInt(p.id) : (p.id || p))
        : [];
      const data = {
        name: templeData.name || '',
        description: templeData.description || '',
        location: templeData.location || '',
        slug: templeData.slug || '',
        image_url: templeData.image_url || '',
        imageFile: null as File | null,
        chadawa_ids: chadawaIds,
        recommended_puja_ids: pujaIds,
      };
      setFormData(data);
      form.setFieldsValue(data);
    }
  }, [templeData, form]);

  // Dropzone for Temple Image
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/jpg': []
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024,
    onDrop: async (acceptedFiles, rejectedFiles) => {
      if (rejectedFiles.length > 0) {
        rejectedFiles.forEach(({ file, errors }) => {
          errors.forEach(error => {
            if (error.code === 'file-too-large') {
              message.error(`File ${file.name} is too large. Maximum size is 10MB.`);
            } else if (error.code === 'file-invalid-type') {
              message.error(`File ${file.name} has invalid type. Only JPEG, PNG are allowed.`);
            }
          });
        });
      }
      
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setFormData(prev => ({ ...prev, imageFile: file }));
        
        // Upload image immediately
        setUploadingImage(true);
        try {
          const result = await dispatch(uploadTempleImage(file));
          if (uploadTempleImage.fulfilled.match(result)) {
            const uploadedUrl = result.payload.file_url;
            setFormData(prev => ({ ...prev, image_url: uploadedUrl }));
            message.success('Image uploaded successfully!');
          } else {
            message.error('Failed to upload image');
          }
        } catch (error) {
          message.error('Error uploading image');
        } finally {
          setUploadingImage(false);
        }
      }
    },
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Auto-generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleNameChange = (value: string) => {
    handleInputChange('name', value);
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, imageFile: null }));
  };

  const handleSubmit = async () => {
    try {
      await form.validateFields();
      
      if (!templeId) {
        message.error('Invalid temple ID');
        return;
      }

      if (!formData.image_url) {
        message.error('Please upload a temple image');
        return;
      }

      setIsSubmitting(true);

      const updateData = {
        id: templeId,
        name: formData.name,
        description: formData.description,
        image_url: formData.image_url,
        location: formData.location,
        slug: formData.slug,
        chadawa_ids: formData.chadawa_ids,
        recommended_puja_ids: formData.recommended_puja_ids,
      };

      const result = await dispatch(updateTemple(updateData));

      if (updateTemple.fulfilled.match(result)) {
        message.success('Temple updated successfully!');
        if (onSuccess) {
          onSuccess();
        }
      } else {
        message.error(result.payload as string || 'Failed to update temple');
      }
    } catch (error: any) {
      console.error('Error submitting form:', error);
      message.error('Please fill all required fields');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <Modal
      title="Update Temple"
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={800}
      centered
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="space-y-4 mt-4"
      >
        {/* Temple Image Upload */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-3">Temple Image</h4>
          
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-orange-500 bg-orange-50'
                : 'border-gray-300 hover:border-orange-400'
            }`}
          >
            <input {...getInputProps()} />
            {uploadingImage ? (
              <div className="flex flex-col items-center">
                <Spin size="large" />
                <p className="mt-2 text-sm text-gray-600">Uploading image...</p>
              </div>
            ) : formData.imageFile ? (
              <div className="flex flex-col items-center">
                <div className="relative">
                  <img
                    src={URL.createObjectURL(formData.imageFile)}
                    alt="Temple preview"
                    className="max-h-40 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage();
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <p className="mt-2 text-sm text-gray-600">{formData.imageFile.name}</p>
              </div>
            ) : formData.image_url ? (
              <div className="flex flex-col items-center">
                <img
                  src={`https://api.33kotidham.in/${formData.image_url}`}
                  alt="Current temple"
                  className="max-h-40 rounded-lg"
                />
                <p className="mt-2 text-sm text-gray-600">Click to change image</p>
              </div>
            ) : (
              <>
                <div className="text-3xl mb-2">🖼️</div>
                <p className="text-gray-600">
                  {isDragActive ? 'Drop the image here' : 'Click to upload temple image'}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Temple Details */}
        <Form.Item
          label="Temple Name"
          name="name"
          rules={[{ required: true, message: 'Please enter temple name' }]}
        >
          <Input
            placeholder="e.g., Kashi Vishwanath Temple"
            value={formData.name}
            onChange={(e) => handleNameChange(e.target.value)}
          />
        </Form.Item>

        <Form.Item
          label="Location"
          name="location"
          rules={[{ required: true, message: 'Please enter location' }]}
        >
          <Input
            placeholder="e.g., Varanasi, Uttar Pradesh"
            value={formData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
          />
        </Form.Item>

        <Form.Item
          label="Slug"
          name="slug"
          rules={[
            { required: true, message: 'Please enter slug' },
            { pattern: /^[a-z0-9-]+$/, message: 'Slug can only contain lowercase letters, numbers, and hyphens' }
          ]}
        >
          <Input
            placeholder="e.g., kashi-vishwanath-temple"
            value={formData.slug}
            onChange={(e) => handleInputChange('slug', e.target.value)}
          />
        </Form.Item>

        <Form.Item
          label="Description"
          name="description"
          rules={[{ required: true, message: 'Please enter temple description' }]}
        >
          <TextArea
            rows={4}
            placeholder="Enter temple description and history..."
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
          />
        </Form.Item>

        {/* Chadawa Selection */}
        <div className="bg-gray-50 p-4 rounded-lg mt-4">
          <h4 className="font-semibold text-gray-900 mb-3">Select Chadawas (Optional)</h4>
          
          {chadawasLoading ? (
            <div className="flex justify-center items-center py-4">
              <Spin size="small" />
              <span className="ml-2 text-sm text-gray-600">Loading chadawas...</span>
            </div>
          ) : !Array.isArray(chadawas) || chadawas.length === 0 ? (
            <div className="text-center py-4 bg-white rounded">
              <div className="text-gray-400 text-2xl mb-1">🛍️</div>
              <p className="text-sm text-gray-600">No chadawas available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto">
              {chadawas.map((chadawa) => {
                const isSelected = formData.chadawa_ids.includes(chadawa.id);
                return (
                  <div
                    key={chadawa.id}
                    onClick={() => {
                      const newIds = isSelected
                        ? formData.chadawa_ids.filter(id => id !== chadawa.id)
                        : [...formData.chadawa_ids, chadawa.id];
                      handleInputChange('chadawa_ids', newIds);
                    }}
                    className={`relative p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 bg-white hover:border-orange-300'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                    
                    <div className="flex items-start gap-2">
                      <div className="flex-shrink-0">
                        {chadawa.image_url ? (
                          <img
                            src={`https://api.33kotidham.in/${chadawa.image_url}`}
                            alt={chadawa.name}
                            className="w-12 h-12 rounded object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-12 h-12 rounded bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center text-lg">
                            🛍️
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h5 className="font-medium text-gray-900 text-xs mb-0.5 truncate">
                          {chadawa.name}
                        </h5>
                        <p className="text-xs text-gray-600 line-clamp-1 mb-1">
                          {chadawa.description}
                        </p>
                        <span className="text-xs font-bold text-green-600">
                          ₹{chadawa.price}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {formData.chadawa_ids.length > 0 && (
            <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded">
              <p className="text-xs font-medium text-green-800">
                ✓ {formData.chadawa_ids.length} chadawa{formData.chadawa_ids.length > 1 ? 's' : ''} selected
              </p>
            </div>
          )}
        </div>

        {/* Recommended Puja Selection */}
        <div className="bg-gray-50 p-4 rounded-lg mt-4">
          <h4 className="font-semibold text-gray-900 mb-3">Select Recommended Pujas (Optional)</h4>
          
          {pujasLoading ? (
            <div className="flex justify-center items-center py-4">
              <Spin size="small" />
              <span className="ml-2 text-sm text-gray-600">Loading pujas...</span>
            </div>
          ) : !Array.isArray(pujas) || pujas.length === 0 ? (
            <div className="text-center py-4 bg-white rounded">
              <div className="text-gray-400 text-2xl mb-1">🛕</div>
              <p className="text-sm text-gray-600">No pujas available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto">
              {pujas.map((puja) => {
                const pujaId = typeof puja.id === 'string' ? parseInt(puja.id) : puja.id;
                const isSelected = formData.recommended_puja_ids.includes(pujaId);
                return (
                  <div
                    key={puja.id}
                    onClick={() => {
                      const newIds = isSelected
                        ? formData.recommended_puja_ids.filter(id => id !== pujaId)
                        : [...formData.recommended_puja_ids, pujaId];
                      handleInputChange('recommended_puja_ids', newIds);
                    }}
                    className={`relative p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 bg-white hover:border-orange-300'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                    
                    <div className="flex items-start gap-2">
                      <div className="flex-shrink-0">
                        {puja.temple_image_url ? (
                          <img
                            src={`https://api.33kotidham.in/${puja.temple_image_url}`}
                            alt={puja.name}
                            className="w-16 h-16 rounded object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-16 h-16 rounded bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center text-2xl">
                            🛕
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h5 className="font-medium text-gray-900 text-xs mb-0.5 line-clamp-2">
                          {puja.name}
                        </h5>
                        {puja.sub_heading && (
                          <p className="text-xs text-gray-600 line-clamp-1 mb-1">
                            {puja.sub_heading}
                          </p>
                        )}
                        {puja.date && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                            📅 {new Date(puja.date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {formData.recommended_puja_ids.length > 0 && (
            <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded">
              <p className="text-xs font-medium text-green-800">
                ✓ {formData.recommended_puja_ids.length} puja{formData.recommended_puja_ids.length > 1 ? 's' : ''} selected
              </p>
            </div>
          )}
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="default"
            size="large"
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button
            type="primary"
            size="large"
            htmlType="submit"
            loading={isSubmitting}
            className="bg-orange-500 hover:bg-orange-600"
          >
            {isSubmitting ? 'Updating...' : 'Update Temple'}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default UpdateTempleModal;
