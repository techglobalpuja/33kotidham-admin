'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { createPuja, uploadPujaImages } from '@/store/slices/pujaSlice';
import { fetchPlans } from '@/store/slices/planSlice';
import { fetchChadawas } from '@/store/slices/chadawaSlice';
import { AppDispatch, RootState } from '@/store';
import { Form, Input, Button, Checkbox, Select, Typography } from 'antd';
import { useDropzone } from 'react-dropzone';

const { Text } = Typography;
const { Option } = Select;

interface Benefit {
  title: string;
  description: string;
}

interface PujaFormData {
  pujaName: string;
  subHeading: string;
  about: string;
  pujaImages: File[];
  templeImage: File | null;
  templeAddress: string;
  templeDescription: string;
  benefits: Benefit[];
  selectedPlanIds: number[]; // ✅ CHANGED: number[] instead of string[]
  selectedChadawaIds: number[]; // ✅ NEW: chadawa IDs
  date: string; // ✅ CHANGED: just date
  time: string; // ✅ CHANGED: just time
  prasadPrice: number;
  prasadStatus: boolean;
  dakshinaPrices: string;
  dakshinaPricesUSD: string;
  dakshinaStatus: boolean;
  manokamnaPrices: string;
  manokamnaPricesUSD: string;
  manokamnaStatus: boolean;
  category: string[]; // ✅ Multi-select categories
  isActive: boolean;
  isFeatured: boolean;
}

interface CreatePujaFormProps {
  onSuccess?: () => void;
}

const CreatePujaForm: React.FC<CreatePujaFormProps> = ({ onSuccess }) => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [form] = Form.useForm();
  
  const { plans, isLoading: plansLoading } = useSelector((state: RootState) => state.plan);
  const { chadawas, isLoading: chadawasLoading } = useSelector((state: RootState) => state.chadawa);

  useEffect(() => {
    dispatch(fetchPlans());
    dispatch(fetchChadawas()); // ✅ NEW: fetch chadawas
  }, [dispatch]);

  const [formData, setFormData] = useState<PujaFormData>({
    pujaName: '',
    subHeading: '',
    about: '',
    pujaImages: [],
    templeImage: null,
    templeAddress: '',
    templeDescription: '',
    benefits: [
      { title: '', description: '' },
      { title: '', description: '' },
      { title: '', description: '' },
      { title: '', description: '' },
    ],
    selectedPlanIds: [], // ✅ CHANGED: number[] empty array
    selectedChadawaIds: [], // ✅ NEW: empty chadawa IDs array
    date: '', // ✅ CHANGED: just date
    time: '', // ✅ CHANGED: just time
    prasadPrice: 0,
    prasadStatus: false,
    dakshinaPrices: '',
    dakshinaPricesUSD: '',
    dakshinaStatus: false,
    manokamnaPrices: '',
    manokamnaPricesUSD: '',
    manokamnaStatus: false,
    category: ['general'], // ✅ Default multi-select
    isActive: true,
    isFeatured: false,
  });

  // Dropzone for Puja Images
  const { getRootProps: getPujaRootProps, getInputProps: getPujaInputProps } = useDropzone({
    accept: { 'image/*': [] },
    multiple: true,
    maxFiles: 6,
    maxSize: 10 * 1024 * 1024,
    onDrop: (acceptedFiles, rejectedFiles) => {
      if (rejectedFiles.length > 0) {
        rejectedFiles.forEach(({ file, errors }) => {
          errors.forEach(error => {
            if (error.code === 'file-too-large') {
              console.error(`File ${file.name} is too large. Maximum size is 10MB.`);
            } else if (error.code === 'file-invalid-type') {
              console.error(`File ${file.name} has invalid type. Only images are allowed.`);
            } else if (error.code === 'too-many-files') {
              console.error('Too many files. Maximum 6 images allowed.');
            }
          });
        });
      }
      
      if (acceptedFiles.length > 0) {
        const currentImages = formData.pujaImages || [];
        const totalImages = currentImages.length + acceptedFiles.length;
        
        if (totalImages > 6) {
          const allowedCount = 6 - currentImages.length;
          const filesToAdd = acceptedFiles.slice(0, allowedCount);
          console.warn(`Only ${allowedCount} more images can be added. Total limit is 6.`);
          handleInputChange('pujaImages', [...currentImages, ...filesToAdd]);
        } else {
          handleInputChange('pujaImages', [...currentImages, ...acceptedFiles]);
        }
      }
    },
  });

  // Dropzone for Temple Image
  const { getRootProps: getTempleRootProps, getInputProps: getTempleInputProps } = useDropzone({
    accept: { 'image/*': [] },
    multiple: false,
    maxSize: 10 * 1024 * 1024,
    onDrop: (acceptedFiles, rejectedFiles) => {
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
      
      if (acceptedFiles.length > 0 && acceptedFiles[0]) {
        const file = acceptedFiles[0];
        handleInputChange('templeImage', file);
      }
    },
  });

  const handleInputChange = (field: keyof PujaFormData, value: any) => {
    // ✅ SPECIAL HANDLING: Convert plan IDs to numbers
    if (field === 'selectedPlanIds') {
      const numericValues = value.map((id: string) => parseInt(id, 10)).filter((id: any) => !isNaN(id));
      setFormData((prev) => ({ ...prev, [field]: numericValues }));
    } else if (field === 'selectedChadawaIds') { // ✅ NEW: handle chadawa IDs
      const numericValues = value.map((id: string) => parseInt(id, 10)).filter((id: any) => !isNaN(id));
      setFormData((prev) => ({ ...prev, [field]: numericValues }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value ?? (Array.isArray(value) ? [] : ''),
      }));
    }
  };

  const handleBenefitChange = (index: number, field: keyof Benefit, value: string) => {
    const newBenefits = [...(formData.benefits ?? [])];
    newBenefits[index] = { ...newBenefits[index], [field]: value ?? '' };
    setFormData((prev) => ({ ...prev, benefits: newBenefits }));
  };

  const createImagePreviewUrl = (file: File): string => {
    return URL.createObjectURL(file);
  };

  const revokeImagePreviewUrl = (url: string): void => {
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    const previewUrls: string[] = [];
    return () => {
      if (formData.pujaImages && Array.isArray(formData.pujaImages)) {
        formData.pujaImages.forEach(file => {
          if (file instanceof File) {
            try {
              const url = createImagePreviewUrl(file);
              previewUrls.push(url);
              revokeImagePreviewUrl(url);
            } catch (e) {}
          }
        });
      }
    };
  }, [formData.pujaImages]);

  const handleSubmit = async () => {
    try {
      if (!formData.pujaName?.trim()) {
        console.error('Puja name is required');
        return;
      }
      
      if (!formData.subHeading?.trim()) {
        console.error('Sub heading is required');
        return;
      }
      
      if (formData.pujaImages && formData.pujaImages.length > 6) {
        console.error('Maximum 6 images allowed');
        return;
      }
      
      if (formData.pujaImages && formData.pujaImages.length > 0) {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        const maxSize = 10 * 1024 * 1024;
        
        for (const image of formData.pujaImages) {
          if (!allowedTypes.includes(image.type)) {
            console.error(`Invalid file type: ${image.type}. Only JPEG, PNG, and WebP are allowed.`);
            return;
          }
          
          if (image.size > maxSize) {
            console.error(`File ${image.name} is too large. Maximum size is 10MB.`);
            return;
          }
        }
      }

      const benefitsToAdd = (formData.benefits ?? [])
        .filter(benefit => benefit.title.trim() !== '' && benefit.description.trim() !== '')
        .map(benefit => ({
          benefit_title: benefit.title.trim(),
          benefit_description: benefit.description.trim()
        }));

      // ✅ UPDATED: plan_ids as NUMBER array, categories as string array, chadawa_ids as number array
      const requestData = {
        name: (formData.pujaName ?? '').trim(),
        sub_heading: (formData.subHeading ?? '').trim(),
        description: (formData.about ?? '').trim(),
        date: formData.date || null, // ✅ CHANGED: just date
        time: formData.time || null, // ✅ CHANGED: just time
        temple_image_url: formData.templeImage?.name ?? '',
        temple_address: (formData.templeAddress ?? '').trim(),
        temple_description: (formData.templeDescription ?? '').trim(),
        benefits: benefitsToAdd, 
        prasad_price: formData.prasadPrice ?? 0,
        is_prasad_active: formData.prasadStatus ?? false,
        dakshina_prices_inr: formData.dakshinaPrices ?? '',
        dakshina_prices_usd: formData.dakshinaPricesUSD ?? '',
        is_dakshina_active: formData.dakshinaStatus ?? false,
        manokamna_prices_inr: formData.manokamnaPrices ?? '',
        manokamna_prices_usd: formData.manokamnaPricesUSD ?? '',
        is_manokamna_active: formData.manokamnaStatus ?? false,
        category: formData.category ?? ['general'], // ✅ string[] 
        plan_ids: formData.selectedPlanIds ?? [], // ✅ number[] - [1, 2, 3]
        chadawa_ids: formData.selectedChadawaIds ?? [], // ✅ NEW: chadawa IDs
      } as any;
      
      console.log('Creating puja with data:', requestData);
      const createResult = await dispatch(createPuja(requestData)) as any;
      
      if (createPuja.fulfilled.match(createResult)) {
        const createdPuja = createResult.payload;
        console.log('Puja created successfully:', createdPuja);
        
        if (formData.pujaImages && formData.pujaImages.length > 0) {
          console.log(`Uploading ${formData.pujaImages.length} images for puja ID: ${createdPuja.id}`);
          const uploadResult = await dispatch(uploadPujaImages({
            pujaId: createdPuja.id,
            images: formData.pujaImages
          })) as any;
          
          if (uploadPujaImages.fulfilled.match(uploadResult)) {
            console.log('Images uploaded successfully');
          } else {
            console.error('Image upload failed:', uploadResult.payload);
          }
        }
        
        onSuccess?.();
      } else {
        console.error('Puja creation failed:', createResult.payload);
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
    }
  };

  return (
    <Form form={form} onFinish={handleSubmit} layout="vertical" className="space-y-8">
      {/* Section 1: Puja Details */}
      <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200">
        <h3 className="text-lg font-semibold text-orange-800 mb-4 font-['Philosopher'] flex items-center gap-2">
          <span className="text-2xl">🛕</span>
          1. Puja Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Form.Item
            name="pujaName"
            label={<span className="block text-sm font-medium text-gray-700 mb-2">Puja Name</span>}
            required={true}
          >
            <Input
              value={formData.pujaName ?? ''}
              onChange={(e) => handleInputChange('pujaName', e.target.value ?? '')}
              placeholder="Enter puja name"
              className="w-full px-4 py-3 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-black placeholder-gray-400"
            />
          </Form.Item>

          <Form.Item
            name="subHeading"
            label={<span className="block text-sm font-medium text-gray-700 mb-2">Sub Heading</span>}
            required={true}
          >
            <Input
              value={formData.subHeading ?? ''}
              onChange={(e) => handleInputChange('subHeading', e.target.value ?? '')}
              placeholder="Enter puja sub heading"
              className="w-full px-4 py-3 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-black placeholder-gray-400"
            />
          </Form.Item>
        </div>

        <Form.Item
          name="about"
          label={<span className="block text-sm font-medium text-gray-700 mb-2">About Puja</span>}
        >
          <Input.TextArea
            value={formData.about ?? ''}
            onChange={(e) => handleInputChange('about', e.target.value ?? '')}
            rows={4}
            placeholder="Enter detailed description about the puja"
            className="w-full px-4 py-3 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-black placeholder-gray-400"
          />
        </Form.Item>

        <Form.Item
          name="pujaImages"
          label={<span className="block text-sm font-medium text-gray-700 mb-2">Puja Images (Max 6)</span>}
        >
          <div
            {...getPujaRootProps()}
            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200 border-orange-300 bg-orange-50 hover:bg-orange-100"
          >
            <input {...getPujaInputProps()} />
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg
                className="w-8 h-8 mb-2 text-orange-400"
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
              <p className="mb-1 text-sm font-medium text-orange-600">
                {formData.pujaImages.length > 0 
                  ? `Selected ${formData.pujaImages.length} of 6 images` 
                  : 'Click or drag to upload images (up to 6)'}
              </p>
              <p className="text-xs text-orange-500">PNG, JPG, JPEG up to 10MB each</p>
            </div>
          </div>
          
          {formData.pujaImages.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Images:</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {formData.pujaImages.map((file, index) => {
                  let previewUrl = '';
                  try {
                    previewUrl = createImagePreviewUrl(file);
                  } catch (e) {}
                  
                  return (
                    <div key={index} className="relative bg-white p-3 rounded-lg border border-orange-200">
                      {previewUrl ? (
                        <div className="relative w-full h-24 mb-2 rounded overflow-hidden">
                          <img 
                            src={previewUrl} 
                            alt={`Preview ${index + 1}`} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              revokeImagePreviewUrl(previewUrl);
                              e.currentTarget.style.display = 'none';
                              if (e.currentTarget.nextElementSibling) {
                                (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                              }
                            }}
                          />
                          <div 
                            className="absolute inset-0 bg-gray-900 bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100 cursor-pointer"
                            onClick={() => {
                              revokeImagePreviewUrl(previewUrl);
                              const updatedImages = formData.pujaImages.filter((_, i) => i !== index);
                              handleInputChange('pujaImages', updatedImages);
                            }}
                          >
                            <span className="text-white text-lg font-bold">✕</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center w-full h-24 mb-2 bg-orange-50 rounded">
                          <svg className="w-8 h-8 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-600 truncate flex-1">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => {
                            if (previewUrl) revokeImagePreviewUrl(previewUrl);
                            const updatedImages = formData.pujaImages.filter((_, i) => i !== index);
                            handleInputChange('pujaImages', updatedImages);
                          }}
                          className="text-red-500 hover:text-red-700 text-xs"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </Form.Item>

        {/* ✅ CHANGED: Date and Time Fields */}
        <Form.Item
          name="date"
          label={<span className="block text-sm font-medium text-gray-700 mb-2">Puja Date</span>}
        >
          <Input
            type="date"
            value={formData.date ?? ''}
            onChange={(e) => handleInputChange('date', e.target.value ?? '')}
            className="w-full px-4 py-3 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-black"
          />
        </Form.Item>

        <Form.Item
          name="time"
          label={<span className="block text-sm font-medium text-gray-700 mb-2">Puja Time</span>}
        >
          <Input
            type="time"
            value={formData.time ?? ''}
            onChange={(e) => handleInputChange('time', e.target.value ?? '')}
            className="w-full px-4 py-3 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-black"
          />
        </Form.Item>
      </div>

      {/* Section 2: Temple Details */}
      <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 p-6 rounded-xl border border-indigo-200">
        <h3 className="text-lg font-semibold text-indigo-800 mb-4 font-['Philosopher'] flex items-center gap-2">
          <span className="text-2xl">🏦</span>
          2. Temple Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Form.Item
            name="templeImage"
            label={<span className="block text-sm font-medium text-gray-700 mb-2">Temple Image</span>}
          >
            <div
              {...getTempleRootProps()}
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-indigo-50 hover:bg-indigo-100 transition-colors duration-200 border-indigo-300"
            >
              <input {...getTempleInputProps()} />
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg
                  className="w-8 h-8 mb-2 text-indigo-400"
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
                <p className="mb-1 text-sm text-indigo-600 font-medium">
                  {formData.templeImage ? `Selected: ${formData.templeImage.name}` : 'Click or drag to upload Temple Image'}
                </p>
                <p className="text-xs text-indigo-500">PNG, JPG, JPEG up to 10MB</p>
              </div>
            </div>
            
            {formData.templeImage && (
              <div className="mt-4">
                <div className="bg-white p-3 rounded-lg border border-indigo-200">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-600 truncate flex-1">{formData.templeImage.name}</span>
                    <button
                      type="button"
                      onClick={() => handleInputChange('templeImage', null)}
                      className="text-red-500 hover:text-red-700 text-sm font-medium"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            )}
          </Form.Item>

          <Form.Item
            name="templeAddress"
            label={<span className="block text-sm font-medium text-gray-700 mb-2">Temple Address</span>}
          >
            <Input
              value={formData.templeAddress ?? ''}
              onChange={(e) => handleInputChange('templeAddress', e.target.value ?? '')}
              placeholder="Enter complete temple address"
              className="w-full px-4 py-3 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-black placeholder-gray-400"
            />
          </Form.Item>
        </div>

        <Form.Item
          name="templeDescription"
          label={<span className="block text-sm font-medium text-gray-700 mb-2">Temple Description</span>}
        >
          <Input.TextArea
            value={formData.templeDescription ?? ''}
            onChange={(e) => handleInputChange('templeDescription', e.target.value ?? '')}
            rows={4}
            placeholder="Enter temple description, history, and significance"
            className="w-full px-4 py-3 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-black placeholder-gray-400"
          />
        </Form.Item>
      </div>

      {/* Section 3: Puja Benefits */}
      <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
        <h3 className="text-lg font-semibold text-green-800 mb-4 font-['Philosopher'] flex items-center gap-2">
          <span className="text-2xl">✨</span>
          3. Puja Benefits
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(formData.benefits ?? []).map((benefit, index) => (
            <div key={index} className="bg-white p-4 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-700 mb-3">Benefit {index + 1}</h4>
              <Form.Item
                name={['benefits', index, 'title']}
                label={<span className="block text-sm font-medium text-gray-700 mb-2">Title</span>}
              >
                <Input
                  value={benefit?.title ?? ''}
                  onChange={(e) => handleBenefitChange(index, 'title', e.target.value ?? '')}
                  placeholder={`Enter benefit ${index + 1} title`}
                  className="w-full px-4 py-3 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black placeholder-gray-400"
                />
              </Form.Item>

              <Form.Item
                name={['benefits', index, 'description']}
                label={<span className="block text-sm font-medium text-gray-700 mb-2">Description</span>}
              >
                <Input.TextArea
                  value={benefit?.description ?? ''}
                  onChange={(e) => handleBenefitChange(index, 'description', e.target.value ?? '')}
                  rows={3}
                  placeholder={`Enter benefit ${index + 1} description`}
                  className="w-full px-3 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black placeholder-gray-400 text-sm"
                />
              </Form.Item>
            </div>
          ))}
        </div>
      </div>

      {/* Section 4: Plan Details - UPDATED FOR NUMBERS */}
      <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
        <h3 className="text-lg font-semibold text-purple-800 mb-4 font-['Philosopher'] flex items-center gap-2">
          <span className="text-2xl">📋</span>
          4. Plan Details
        </h3>

        <Form.Item
          name="selectedPlanIds"
          label={<span className="block text-sm font-medium text-gray-700 mb-2">Select Plans (Multiple Selection)</span>}
        >
          <Select
            mode="multiple"
            value={formData.selectedPlanIds ?? []}
            onChange={(value) => handleInputChange('selectedPlanIds', value ?? [])}
            placeholder="Select plans"
            loading={plansLoading}
            className="w-full"
            dropdownClassName="border border-purple-200 rounded-lg"
            style={{
              background: 'white',
              borderRadius: '0.5rem',
              border: '1px solid #E9D5FF',
            }}
            maxTagCount={3}
          >
            {plans && plans.length > 0 ? (
              plans.map((plan) => (
                <Option key={plan.id} value={plan.id}>
                  {plan.name} - ₹{plan.actual_price}
                </Option>
              ))
            ) : (
              <Option disabled value={0}>No plans available</Option>
            )}
          </Select>
          <Text className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple plans</Text>
        </Form.Item>
      </div>

      {/* ✅ NEW: Section for Chadawa Selection */}
      <div className="bg-gradient-to-r from-teal-50 to-teal-100 p-6 rounded-xl border border-teal-200">
        <h3 className="text-lg font-semibold text-teal-800 mb-4 font-['Philosopher'] flex items-center gap-2">
          <span className="text-2xl">📿</span>
          Chadawa Selection
        </h3>

        <Form.Item
          name="selectedChadawaIds"
          label={<span className="block text-sm font-medium text-gray-700 mb-2">Select Chadawas (Multiple Selection)</span>}
        >
          <Select
            mode="multiple"
            value={formData.selectedChadawaIds ?? []}
            onChange={(value) => handleInputChange('selectedChadawaIds', value ?? [])}
            placeholder="Select chadawas"
            loading={chadawasLoading}
            className="w-full"
            dropdownClassName="border border-teal-200 rounded-lg"
            style={{
              background: 'white',
              borderRadius: '0.5rem',
              border: '1px solid #CCFBF1',
            }}
            maxTagCount={3}
          >
            {chadawas && chadawas.length > 0 ? (
              chadawas.map((chadawa) => (
                <Option key={chadawa.id} value={chadawa.id}>
                  {chadawa.name}
                </Option>
              ))
            ) : (
              <Option disabled value={0}>No chadawas available</Option>
            )}
          </Select>
          <Text className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple chadawas</Text>
        </Form.Item>
      </div>

      {/* Section 5: Prasad */}
      <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-6 rounded-xl border border-yellow-200">
        <h3 className="text-lg font-semibold text-yellow-800 mb-4 font-['Philosopher'] flex items-center gap-2">
          <span className="text-2xl">🍯</span>
          5. Prasad
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <Form.Item
            name="prasadPrice"
            label={<span className="block text-sm font-medium text-gray-700 mb-2">Prasad Price (₹)</span>}
          >
            <Input
              type="number"
              value={(formData.prasadPrice ?? 0).toString()}
              onChange={(e) => handleInputChange('prasadPrice', parseInt(e.target.value ?? '0') || 0)}
              placeholder="Enter prasad price"
              className="w-full px-4 py-3 border border-yellow-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-black placeholder-gray-400"
            />
          </Form.Item>

          <Form.Item name="prasadStatus" valuePropName="checked">
            <Checkbox
              checked={formData.prasadStatus ?? false}
              onChange={(e) => handleInputChange('prasadStatus', e.target.checked ?? false)}
              className="flex items-center gap-2 text-sm font-medium text-gray-700"
            >
              Active Prasad Service
            </Checkbox>
          </Form.Item>
        </div>
      </div>

      {/* Section 6: Dakshina */}
      <div className="bg-gradient-to-r from-red-50 to-red-100 p-6 rounded-xl border border-red-200">
        <h3 className="text-lg font-semibold text-red-800 mb-4 font-['Philosopher'] flex items-center gap-2">
          <span className="text-2xl">💰</span>
          6. Dakshina
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          <Form.Item
            name="dakshinaPrices"
            label={<span className="block text-sm font-medium text-gray-700 mb-2">Dakshina Prices (₹)</span>}
          >
            <Input
              value={formData.dakshinaPrices ?? ''}
              onChange={(e) => handleInputChange('dakshinaPrices', e.target.value ?? '')}
              placeholder="e.g., 101,201,310,500"
              className="w-full px-4 py-3 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-black placeholder-gray-400"
            />
            <Text className="text-xs text-gray-500 mt-1">Enter comma-separated values for multiple price options</Text>
          </Form.Item>

          <Form.Item
            name="dakshinaPricesUSD"
            label={<span className="block text-sm font-medium text-gray-700 mb-2">Dakshina Prices (USD)</span>}
          >
            <Input
              value={formData.dakshinaPricesUSD ?? ''}
              onChange={(e) => handleInputChange('dakshinaPricesUSD', e.target.value ?? '')}
              placeholder="e.g., 1.5,2.5,4.0,6.0"
              className="w-full px-4 py-3 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-black placeholder-gray-400"
            />
            <Text className="text-xs text-gray-500 mt-1">Optional: Manual USD pricing (comma-separated)</Text>
          </Form.Item>

          <Form.Item name="dakshinaStatus" valuePropName="checked">
            <Checkbox
              checked={formData.dakshinaStatus ?? false}
              onChange={(e) => handleInputChange('dakshinaStatus', e.target.checked ?? false)}
              className="flex items-center gap-2 text-sm font-medium text-gray-700"
            >
              Active Dakshina
            </Checkbox>
          </Form.Item>
        </div>

        <div className="mt-4 p-3 bg-white rounded-lg border border-red-200">
          <Text className="text-sm text-gray-600">
            <span className="font-medium">Note: </span>
            <span className="text-red-600">No automatic conversion - you can manually set both INR and USD prices</span>
          </Text>
        </div>
      </div>

      {/* Section 7: Manokamna Parchi */}
      <div className="bg-gradient-to-r from-pink-50 to-pink-100 p-6 rounded-xl border border-pink-200">
        <h3 className="text-lg font-semibold text-pink-800 mb-4 font-['Philosopher'] flex items-center gap-2">
          <span className="text-2xl">📜</span>
          7. Manokamna Parchi
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          <Form.Item
            name="manokamnaPrices"
            label={<span className="block text-sm font-medium text-gray-700 mb-2">Manokamna Prices (₹)</span>}
          >
            <Input
              value={formData.manokamnaPrices ?? ''}
              onChange={(e) => handleInputChange('manokamnaPrices', e.target.value ?? '')}
              placeholder="e.g., 51,101,151,251"
              className="w-full px-4 py-3 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-black placeholder-gray-400"
            />
            <Text className="text-xs text-gray-500 mt-1">Enter comma-separated values for multiple price options</Text>
          </Form.Item>

          <Form.Item
            name="manokamnaPricesUSD"
            label={<span className="block text-sm font-medium text-gray-700 mb-2">Manokamna Prices (USD)</span>}
          >
            <Input
              value={formData.manokamnaPricesUSD ?? ''}
              onChange={(e) => handleInputChange('manokamnaPricesUSD', e.target.value ?? '')}
              placeholder="e.g., 0.75,1.25,2.0,3.0"
              className="w-full px-4 py-3 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-black placeholder-gray-400"
            />
            <Text className="text-xs text-gray-500 mt-1">Optional: Manual USD pricing (comma-separated)</Text>
          </Form.Item>

          <Form.Item name="manokamnaStatus" valuePropName="checked">
            <Checkbox
              checked={formData.manokamnaStatus ?? false}
              onChange={(e) => handleInputChange('manokamnaStatus', e.target.checked ?? false)}
              className="flex items-center gap-2 text-sm font-medium text-gray-700"
            >
              Active Manokamna
            </Checkbox>
          </Form.Item>
        </div>

        <div className="mt-4 p-3 bg-white rounded-lg border border-pink-200">
          <Text className="text-sm text-gray-600">
            <span className="font-medium">Note: </span>
            <span className="text-pink-600">
              Manokamna Parchi allows devotees to write their wishes and prayers. No automatic conversion - you can
              manually set both INR and USD prices
            </span>
          </Text>
        </div>
      </div>

      {/* Section 8: General Settings */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 font-['Philosopher'] flex items-center gap-2">
          <span className="text-2xl">⚙️</span>
          General Settings
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Form.Item
            name="category"
            label={<span className="block text-sm font-medium text-gray-700 mb-2">Categories (Multiple Selection)</span>}
          >
            <Select
              mode="multiple"
              value={formData.category ?? ['general']}
              onChange={(value) => handleInputChange('category', value ?? ['general'])}
              placeholder="Select categories"
              className="w-full"
              dropdownClassName="border border-gray-200 rounded-lg"
              style={{
                background: 'white',
                borderRadius: '0.5rem',
                border: '1px solid #E5E7EB',
              }}
              maxTagCount={3}
              maxTagTextLength={10}
            >
              <Option value="general">General</Option>
              <Option value="prosperity">Prosperity</Option>
              <Option value="health">Health</Option>
              <Option value="education">Education</Option>
              <Option value="marriage">Marriage</Option>
              <Option value="spiritual">Spiritual</Option>
            </Select>
            <Text className="text-xs text-gray-500 mt-1">
              Hold Ctrl/Cmd to select multiple categories
            </Text>
          </Form.Item>

          <div className="flex items-center gap-6 mt-8">
            <Form.Item name="isActive" valuePropName="checked">
              <Checkbox
                checked={formData.isActive ?? true}
                onChange={(e) => handleInputChange('isActive', e.target.checked ?? true)}
                className="flex items-center gap-2 text-sm font-medium text-gray-700"
              >
                Active
              </Checkbox>
            </Form.Item>

            <Form.Item name="isFeatured" valuePropName="checked">
              <Checkbox
                checked={formData.isFeatured ?? false}
                onChange={(e) => handleInputChange('isFeatured', e.target.checked ?? false)}
                className="flex items-center gap-2 text-sm font-medium text-gray-700"
              >
                Featured
              </Checkbox>
            </Form.Item>
          </div>
        </div>
      </div>

      {/* Update reset function to include new fields */}
      <Form.Item name="submit">
        <div className="flex gap-4">
          <Button
            type="primary"
            htmlType="submit"
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-3 rounded-lg font-medium border-none"
          >
            Create Puja
          </Button>
          <Button
            type="default"
            onClick={() => {
              setFormData({
                pujaName: '',
                subHeading: '',
                about: '',
                pujaImages: [],
                templeImage: null,
                templeAddress: '',
                templeDescription: '',
                benefits: [
                  { title: '', description: '' },
                  { title: '', description: '' },
                  { title: '', description: '' },
                  { title: '', description: '' },
                ],
                selectedPlanIds: [], // ✅ Reset to number[]
                selectedChadawaIds: [], // ✅ NEW: reset chadawa IDs
                date: '', // ✅ CHANGED: reset date
                time: '', // ✅ CHANGED: reset time
                prasadPrice: 0,
                prasadStatus: false,
                dakshinaPrices: '',
                dakshinaPricesUSD: '',
                dakshinaStatus: false,
                manokamnaPrices: '',
                manokamnaPricesUSD: '',
                manokamnaStatus: false,
                category: ['general'],
                isActive: true,
                isFeatured: false,
              });
              form.resetFields();
            }}
            className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-3 rounded-lg font-medium border-none"
          >
            Reset
          </Button>
        </div>
      </Form.Item>
    </Form>
  );
};

export default CreatePujaForm;