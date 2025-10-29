'use client';

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createTemple, uploadTempleImage } from '@/store/slices/templeSlice';
import { fetchChadawas } from '@/store/slices/chadawaSlice';
import { fetchPujas } from '@/store/slices/pujaSlice';
import { AppDispatch, RootState } from '@/store';
import { Form, Input, Button, message, Spin, Checkbox } from 'antd';
import { useDropzone } from 'react-dropzone';

const { TextArea } = Input;

interface TempleFormData {
  name: string;
  description: string;
  location: string;
  slug: string;
  image_url: string;
  imageFile: File | null;
  chadawa_ids: number[];
  recommended_puja_ids: number[];
}

interface CreateTempleFormProps {
  onSuccess?: () => void;
}

const CreateTempleForm: React.FC<CreateTempleFormProps> = ({ onSuccess }) => {
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

  const [formData, setFormData] = useState<TempleFormData>({
    name: '',
    description: '',
    location: '',
    slug: '',
    image_url: '',
    imageFile: null,
    chadawa_ids: [],
    recommended_puja_ids: [],
  });

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

  const handleInputChange = (field: keyof TempleFormData, value: any) => {
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
    if (!formData.slug || formData.slug === generateSlug(formData.name)) {
      handleInputChange('slug', generateSlug(value));
      form.setFieldsValue({ slug: generateSlug(value) });
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, imageFile: null, image_url: '' }));
  };

  const handleSubmit = async () => {
    try {
      await form.validateFields();
      
      if (!formData.image_url) {
        message.error('Please upload a temple image');
        return;
      }

      setIsSubmitting(true);

      const templeData = {
        name: formData.name,
        description: formData.description,
        image_url: formData.image_url,
        location: formData.location,
        slug: formData.slug,
        chadawa_ids: formData.chadawa_ids,
        recommended_puja_ids: formData.recommended_puja_ids,
      };

      const result = await dispatch(createTemple(templeData));

      if (createTemple.fulfilled.match(result)) {
        message.success('Temple created successfully!');
        form.resetFields();
        setFormData({
          name: '',
          description: '',
          location: '',
          slug: '',
          image_url: '',
          imageFile: null,
          chadawa_ids: [],
          recommended_puja_ids: [],
        });
        if (onSuccess) {
          onSuccess();
        }
      } else {
        message.error(result.payload as string || 'Failed to create temple');
      }
    } catch (error: any) {
      console.error('Error submitting form:', error);
      message.error('Please fill all required fields');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="space-y-6"
      >
        {/* Temple Image Upload */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Temple Image</h3>
          
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
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
                    className="max-h-48 rounded-lg"
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
            ) : (
              <>
                <div className="text-4xl mb-2">🖼️</div>
                <p className="text-gray-600">
                  {isDragActive ? 'Drop the image here' : 'Drag & drop temple image here, or click to select'}
                </p>
                <p className="text-sm text-gray-500 mt-1">Maximum file size: 10MB</p>
              </>
            )}
          </div>
        </div>

        {/* Temple Details */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Temple Information</h3>
          
          <Form.Item
            label="Temple Name"
            name="name"
            rules={[{ required: true, message: 'Please enter temple name' }]}
          >
            <Input
              placeholder="e.g., Kashi Vishwanath Temple"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full"
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
              className="w-full"
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
              className="w-full"
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
              className="w-full"
            />
          </Form.Item>
        </div>

        {/* Chadawa Selection */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Chadawas (Optional)</h3>
          
          {chadawasLoading ? (
            <div className="flex justify-center items-center py-8">
              <Spin size="large" />
              <span className="ml-3 text-gray-600">Loading chadawas...</span>
            </div>
          ) : !Array.isArray(chadawas) || chadawas.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <div className="text-gray-400 text-4xl mb-2">🛍️</div>
              <p className="text-gray-600">No chadawas available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                    className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-orange-300 hover:bg-gray-50'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                    
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        {chadawa.image_url ? (
                          <img
                            src={`https://api.33kotidham.in/${chadawa.image_url}`}
                            alt={chadawa.name}
                            className="w-16 h-16 rounded-lg object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const fallback = document.createElement('div');
                              fallback.className = 'w-16 h-16 rounded-lg bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center text-2xl';
                              fallback.textContent = '🛍️';
                              e.currentTarget.parentElement?.appendChild(fallback);
                            }}
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center text-2xl">
                            🛍️
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 text-sm mb-1 truncate">
                          {chadawa.name}
                        </h4>
                        <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                          {chadawa.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-green-600">
                            ₹{chadawa.price}
                          </span>
                          {chadawa.requires_note && (
                            <span className="text-xs text-orange-600 bg-orange-100 px-2 py-0.5 rounded">
                              Note required
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {formData.chadawa_ids.length > 0 && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm font-medium text-green-800">
                ✓ {formData.chadawa_ids.length} chadawa{formData.chadawa_ids.length > 1 ? 's' : ''} selected
              </p>
            </div>
          )}
        </div>

        {/* Recommended Puja Selection */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Recommended Pujas (Optional)</h3>
          
          {pujasLoading ? (
            <div className="flex justify-center items-center py-8">
              <Spin size="large" />
              <span className="ml-3 text-gray-600">Loading pujas...</span>
            </div>
          ) : !Array.isArray(pujas) || pujas.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <div className="text-gray-400 text-4xl mb-2">🛕</div>
              <p className="text-gray-600">No pujas available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                    className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-orange-300 hover:bg-gray-50'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                    
                    <div className="flex flex-col gap-3">
                      <div className="flex-shrink-0">
                        {puja.temple_image_url ? (
                          <img
                            src={`https://api.33kotidham.in/${puja.temple_image_url}`}
                            alt={puja.name}
                            className="w-full h-32 rounded-lg object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const fallback = document.createElement('div');
                              fallback.className = 'w-full h-32 rounded-lg bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center text-4xl';
                              fallback.textContent = '🛕';
                              e.currentTarget.parentElement?.appendChild(fallback);
                            }}
                          />
                        ) : (
                          <div className="w-full h-32 rounded-lg bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center text-4xl">
                            🛕
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">
                          {puja.name}
                        </h4>
                        {puja.sub_heading && (
                          <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                            {puja.sub_heading}
                          </p>
                        )}
                        <div className="flex items-center gap-2 flex-wrap">
                          {puja.date && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                              📅 {new Date(puja.date).toLocaleDateString()}
                            </span>
                          )}
                          {puja.category && (
                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                              🏷️ {Array.isArray(puja.category) ? puja.category[0] : typeof puja.category === 'string' ? (puja.category as string).split(',')[0] : String(puja.category)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {formData.recommended_puja_ids.length > 0 && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm font-medium text-green-800">
                ✓ {formData.recommended_puja_ids.length} puja{formData.recommended_puja_ids.length > 1 ? 's' : ''} selected
              </p>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button
            type="default"
            size="large"
            onClick={() => {
              form.resetFields();
              setFormData({
                name: '',
                description: '',
                location: '',
                slug: '',
                image_url: '',
                imageFile: null,
                chadawa_ids: [],
                recommended_puja_ids: [],
              });
            }}
          >
            Reset
          </Button>
          <Button
            type="primary"
            size="large"
            htmlType="submit"
            loading={isSubmitting}
            className="bg-orange-500 hover:bg-orange-600"
          >
            {isSubmitting ? 'Creating...' : 'Create Temple'}
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default CreateTempleForm;
