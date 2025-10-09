'use client';

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Modal, Form, Input, Button, Checkbox, Select, Typography, Row, Col } from 'antd';
import { useDropzone } from 'react-dropzone';
import { RootState } from '@/store';
import { fetchPujaById, updatePuja, uploadPujaImages } from '@/store/slices/pujaSlice';
import { AppDispatch } from '@/store';

const { Text } = Typography;
const { Option } = Select;

interface Benefit {
  title?: string | null;
  description?: string | null;
}

interface PujaFormData {
  pujaName?: string | null;
  subHeading?: string | null;
  about?: string | null;
  pujaImages?: File[] | null;
  templeImage?: string | null;
  templeAddress?: string | null;
  templeDescription?: string | null;
  benefits?: Benefit[] | null;
  selectedPlanIds?: string[] | null;
  prasadPrice?: number | null;
  prasadStatus?: boolean | null;
  dakshinaPrices?: string | null;
  dakshinaPricesUSD?: string | null;
  dakshinaStatus?: boolean | null;
  manokamnaPrices?: string | null;
  manokamnaPricesUSD?: string | null;
  manokamnaStatus?: boolean | null;
  category?: string | null;
  isActive?: boolean | null;
  isFeatured?: boolean | null;
}

interface UpdatePujaModalProps {
  pujaId?: string | null;
  visible?: boolean;
  pujaData?: any; // Data passed from parent
  onCancel?: () => void;
  onSuccess?: () => void;
}

const UpdatePujaModal: React.FC<UpdatePujaModalProps> = ({ 
  pujaId, 
  visible, 
  pujaData,
  onCancel, 
  onSuccess
}) => {
  console.log("UpdatePujaModal rendered with:", { pujaId, visible, pujaData });
  
  // Early validation and safety checks
  const safePujaId = (pujaId ?? '').toString().trim();
  const isVisible = Boolean(visible ?? false);
  const safeOnCancel = onCancel ?? (() => {});
  const safeOnSuccess = onSuccess ?? (() => {});
  
  const dispatch = useDispatch<AppDispatch>();
  // Track if images have been changed
  const [imagesChanged, setImagesChanged] = useState(false);
  const [form] = Form.useForm();
  const [formData, setFormData] = useState<PujaFormData>({
    pujaName: '',
    subHeading: '',
    about: '',
    pujaImages: [],
    templeImage: '',
    templeAddress: '',
    templeDescription: '',
    benefits: [
      { title: '', description: '' },
      { title: '', description: '' },
      { title: '', description: '' },
      { title: '', description: '' },
    ],
    selectedPlanIds: [],
    prasadPrice: 0,
    prasadStatus: false,
    dakshinaPrices: '',
    dakshinaPricesUSD: '',
    dakshinaStatus: false,
    manokamnaPrices: '',
    manokamnaPricesUSD: '',
    manokamnaStatus: false,
    category: 'general',
    isActive: true,
    isFeatured: false,
  });

  // Effect to populate form when pujaData is received
  useEffect(() => {
    if (pujaData && typeof pujaData === 'object' && isVisible) {
      try {
        console.log('UpdatePujaModal - Setting form data from props:', pujaData);
        
        // Safe data extraction with comprehensive null handling
        const safeBenefits = Array.isArray(pujaData.benefits) 
          ? pujaData.benefits.map((benefit: any) => ({
              title: (benefit?.title ?? '').toString().trim(),
              description: (benefit?.description ?? '').toString().trim()
            }))
          : [
              { title: '', description: '' },
              { title: '', description: '' },
              { title: '', description: '' },
              { title: '', description: '' },
            ];

        const safeSelectedPlanIds = Array.isArray(pujaData.selected_plan_ids) 
          ? pujaData.selected_plan_ids.filter((id: any) => id != null).map((id: any) => id.toString())
          : [];

        const newFormData = {
          pujaName: (pujaData.name ?? '').toString().trim(),
          subHeading: (pujaData.sub_heading ?? '').toString().trim(),
          about: (pujaData.description ?? '').toString().trim(),
          pujaImages: [], // Reset to empty File array on update
          templeImage: (pujaData.temple_image_url ?? '').toString().trim(),
          templeAddress: (pujaData.temple_address ?? '').toString().trim(),
          templeDescription: (pujaData.temple_description ?? '').toString().trim(),
          benefits: safeBenefits,
          selectedPlanIds: safeSelectedPlanIds,
          prasadPrice: (() => {
            const price = pujaData.prasad_price;
            if (price === null || price === undefined) return 0;
            const numPrice = Number(price);
            return isNaN(numPrice) ? 0 : Math.max(0, numPrice);
          })(),
          prasadStatus: Boolean(pujaData.is_prasad_active ?? false),
          dakshinaPrices: (pujaData.dakshina_prices_inr ?? '').toString().trim(),
          dakshinaPricesUSD: (pujaData.dakshina_prices_usd ?? '').toString().trim(),
          dakshinaStatus: Boolean(pujaData.is_dakshina_active ?? false),
          manokamnaPrices: (pujaData.manokamna_prices_inr ?? '').toString().trim(),
          manokamnaPricesUSD: (pujaData.manokamna_prices_usd ?? '').toString().trim(),
          manokamnaStatus: Boolean(pujaData.is_manokamna_active ?? false),
          category: (pujaData.category ?? 'general').toString().trim(),
          isActive: Boolean(pujaData.is_active ?? true),
          isFeatured: Boolean(pujaData.is_featured ?? false),
        };

        setFormData(newFormData);
        
        // Reset images changed flag when new data is loaded
        setImagesChanged(false);
        
        // Set Ant Design form values to match the state
        form.setFieldsValue({
          pujaName: newFormData.pujaName,
          subHeading: newFormData.subHeading,
          about: newFormData.about,
          templeAddress: newFormData.templeAddress,
          templeDescription: newFormData.templeDescription,
          prasadPrice: newFormData.prasadPrice,
          prasadStatus: newFormData.prasadStatus,
          dakshinaPrices: newFormData.dakshinaPrices,
          dakshinaPricesUSD: newFormData.dakshinaPricesUSD,
          dakshinaStatus: newFormData.dakshinaStatus,
          manokamnaPrices: newFormData.manokamnaPrices,
          manokamnaPricesUSD: newFormData.manokamnaPricesUSD,
          manokamnaStatus: newFormData.manokamnaStatus,
          category: newFormData.category,
          isActive: newFormData.isActive,
          isFeatured: newFormData.isFeatured,
          // Set benefits with proper nested structure
          benefits: (newFormData.benefits as Array<{title: string, description: string}>).map((benefit, index) => ({
            title: benefit.title,
            description: benefit.description
          }))
        });
        
        console.log('UpdatePujaModal - Form data and Ant Design form values set successfully');
      } catch (error) {
        console.error('Error setting form data from pujaData:', error);
      }
    }
  }, [pujaData, isVisible, form]);

  // Dropzone for Puja Images with enhanced safety
  const { getRootProps: getPujaRootProps, getInputProps: getPujaInputProps } = useDropzone({
    accept: { 'image/*': [] },
    multiple: true,
    maxFiles: 6,
    maxSize: 10 * 1024 * 1024, // 10MB per file
    onDrop: (acceptedFiles, rejectedFiles) => {
      try {
        // Handle rejected files
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
        
        // Handle accepted files
        if (Array.isArray(acceptedFiles) && acceptedFiles.length > 0) {
          const validFiles = acceptedFiles.filter(file => file && file instanceof File);
          
          if (validFiles.length > 6) {
            console.warn('Only 6 images allowed. Taking first 6 files.');
            handleInputChange('pujaImages', validFiles.slice(0, 6));
          } else {
            handleInputChange('pujaImages', validFiles);
          }
          
          setImagesChanged(true);
        }
      } catch (error) {
        console.error('Error handling puja images drop:', error);
      }
    },
  });

  // Dropzone for Temple Image with enhanced safety
  const { getRootProps: getTempleRootProps, getInputProps: getTempleInputProps } = useDropzone({
    accept: { 'image/*': [] },
    multiple: false,
    maxSize: 10 * 1024 * 1024, // 10MB
    onDrop: (acceptedFiles, rejectedFiles) => {
      try {
        // Handle rejected files
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
        
        // Handle accepted files
        if (Array.isArray(acceptedFiles) && acceptedFiles.length > 0 && acceptedFiles[0]) {
          const fileName = acceptedFiles[0]?.name?.toString()?.trim() || '';
          handleInputChange('templeImage', fileName);
        }
      } catch (error) {
        console.error('Error handling temple image drop:', error);
      }
    },
  });

  const handleInputChange = (field: keyof PujaFormData, value: any) => {
    try {
      setFormData((prev) => {
        if (!prev || typeof prev !== 'object') {
          console.error('Previous form data is invalid:', prev);
          return prev;
        }
        
        // Safe value handling based on field type
        let safeValue;
        switch (field) {
          case 'pujaImages':
            safeValue = Array.isArray(value) ? value.filter(v => v instanceof File) : [];
            break;
          case 'benefits':
            safeValue = Array.isArray(value) ? value : [];
            break;
          case 'selectedPlanIds':
            safeValue = Array.isArray(value) ? value.filter(v => v != null).map(v => v.toString()) : [];
            break;
          case 'prasadPrice':
            const numValue = Number(value);
            safeValue = isNaN(numValue) ? 0 : Math.max(0, numValue);
            break;
          case 'prasadStatus':
          case 'dakshinaStatus':
          case 'manokamnaStatus':
          case 'isActive':
          case 'isFeatured':
            safeValue = Boolean(value);
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

  const handleBenefitChange = (index: number, field: keyof Benefit, value: string) => {
    try {
      const safeIndex = Math.max(0, Math.min(index, 3)); // Ensure index is between 0-3
      const safeValue = (value ?? '').toString().trim();
      
      setFormData((prev) => {
        if (!prev || typeof prev !== 'object') {
          console.error('Previous form data is invalid:', prev);
          return prev;
        }
        
        const currentBenefits = Array.isArray(prev.benefits) ? [...prev.benefits] : [
          { title: '', description: '' },
          { title: '', description: '' },
          { title: '', description: '' },
          { title: '', description: '' },
        ];
        
        // Ensure the benefit at index exists
        if (!currentBenefits[safeIndex] || typeof currentBenefits[safeIndex] !== 'object') {
          currentBenefits[safeIndex] = { title: '', description: '' };
        }
        
        currentBenefits[safeIndex] = { 
          ...currentBenefits[safeIndex], 
          [field]: safeValue 
        };
        
        return { ...prev, benefits: currentBenefits };
      });
    } catch (error) {
      console.error(`Error updating benefit ${index}.${field}:`, error);
    }
  };

  const handleSubmit = async () => {
    console.log("UpdatePujaModal - handleSubmit called");
    console.log("Images changed:", imagesChanged);
    console.log("Form data images:", formData.pujaImages);
    
    try {
      if (!safePujaId) {
        console.error('Puja ID is required');
        return;
      }
      
      if (!formData || typeof formData !== 'object') {
        console.error('Form data is invalid:', formData);
        return;
      }
      
      const requestData = {
        name: (formData.pujaName ?? '').toString().trim(),
        sub_heading: (formData.subHeading ?? '').toString().trim(),
        description: (formData.about ?? '').toString().trim(),
        date: null,
        time: null,
        temple_image_url: (formData.templeImage ?? '').toString().trim(),
        temple_address: (formData.templeAddress ?? '').toString().trim(),
        temple_description: (formData.templeDescription ?? '').toString().trim(),
        prasad_price: (() => {
          const price = formData.prasadPrice;
          if (price === null || price === undefined) return 0;
          const numPrice = Number(price);
          return isNaN(numPrice) ? 0 : Math.max(0, numPrice);
        })(),
        is_prasad_active: Boolean(formData.prasadStatus ?? false),
        dakshina_prices_inr: (formData.dakshinaPrices ?? '').toString().trim(),
        dakshina_prices_usd: (formData.dakshinaPricesUSD ?? '').toString().trim(),
        is_dakshina_active: Boolean(formData.dakshinaStatus ?? false),
        manokamna_prices_inr: (formData.manokamnaPrices ?? '').toString().trim(),
        manokamna_prices_usd: (formData.manokamnaPricesUSD ?? '').toString().trim(),
        is_manokamna_active: Boolean(formData.manokamnaStatus ?? false),
        category: (formData.category ?? 'general').toString().trim(),
        is_active: Boolean(formData.isActive ?? true),
        is_featured: Boolean(formData.isFeatured ?? false),
        benefits: Array.isArray(formData.benefits) 
          ? formData.benefits.map(benefit => ({
              title: (benefit?.title ?? '').toString().trim(),
              description: (benefit?.description ?? '').toString().trim()
            }))
          : [],
        selected_plan_ids: Array.isArray(formData.selectedPlanIds) 
          ? formData.selectedPlanIds.filter(id => id != null).map(id => id.toString())
          : [],
      } as any;
      
      console.log("Calling updatePuja with:", requestData);
      const updateResult = await dispatch(updatePuja({ id: safePujaId, ...requestData }));
      console.log("Update result:", updateResult);
      
      // Only upload images if they were changed and are valid
      if (updatePuja.fulfilled.match(updateResult) && 
          imagesChanged && 
          Array.isArray(formData.pujaImages) && 
          formData.pujaImages.length > 0) {
        
        const validImages = formData.pujaImages.filter(img => img instanceof File);
        if (validImages.length > 0) {
          console.log("Uploading images:", validImages);
          await dispatch(uploadPujaImages({
            pujaId: safePujaId,
            images: validImages
          }));
        }
      }
      
      safeOnSuccess();
      safeOnCancel();
    } catch (error) {
      console.error("Error in handleSubmit:", error);
    }
  };

  // Early return if not visible
  if (!isVisible) {
    return null;
  }

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <span className="text-2xl">🛕</span>
          <span className="font-['Philosopher'] text-xl">Update Puja</span>
        </div>
      }
      open={visible}
      onCancel={safeOnCancel}
      footer={null}
      width={1000}
      style={{ top: 20 }}
      className="admin-puja-modal"
    >
      <Form form={form} onFinish={handleSubmit} layout="vertical" className="space-y-6">
        <div className="max-h-[80vh] overflow-y-auto pr-2">
          {/* Section 1: Puja Details */}
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200 mb-6">
            <h3 className="text-lg font-semibold text-orange-800 mb-4 font-['Philosopher'] flex items-center gap-2">
              <span className="text-2xl">🛕</span>
              1. Puja Details
            </h3>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="pujaName"
                  label={<span className="block text-sm font-medium text-gray-700 mb-2">Puja Name</span>}
                  required={true}
                >
                  <Input
                    value={(formData.pujaName ?? '').toString()}
                    onChange={(e) => handleInputChange('pujaName', e?.target?.value ?? '')}
                    placeholder="Enter puja name"
                    className="w-full px-4 py-3 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-black placeholder-gray-400"
                  />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  name="subHeading"
                  label={<span className="block text-sm font-medium text-gray-700 mb-2">Sub Heading</span>}
                  required={true}
                >
                  <Input
                    value={(formData.subHeading ?? '').toString()}
                    onChange={(e) => handleInputChange('subHeading', e?.target?.value ?? '')}
                    placeholder="Enter puja sub heading"
                    className="w-full px-4 py-3 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-black placeholder-gray-400"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="about"
              label={<span className="block text-sm font-medium text-gray-700 mb-2">About Puja</span>}
            >
              <Input.TextArea
                value={(formData.about ?? '').toString()}
                onChange={(e) => handleInputChange('about', e?.target?.value ?? '')}
                rows={4}
                placeholder="Enter detailed description about the puja"
                className="w-full px-4 py-3 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-black placeholder-gray-400"
              />
            </Form.Item>

            {/* <Form.Item
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
            </Form.Item> */}

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
                    {(formData.pujaImages && Array.isArray(formData.pujaImages) && formData.pujaImages.length > 0) 
                      ? `Selected ${formData.pujaImages.length} of 6 new images` 
                      : 'Click or drag to upload new images (up to 6)'}
                  </p>
                  <p className="text-xs text-orange-500">PNG, JPG, JPEG up to 10MB each</p>
                  {imagesChanged && (
                    <p className="text-xs text-green-600 font-medium mt-1">Images will be updated when saved</p>
                  )}
                </div>
              </div>
              
              {/* Display selected new images preview */}
              {formData.pujaImages && Array.isArray(formData.pujaImages) && formData.pujaImages.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">New Images to Upload:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {formData.pujaImages.map((file, index) => (
                      <div key={index} className="relative bg-white p-3 rounded-lg border border-orange-200">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                          </svg>
                          <span className="text-xs text-gray-600 truncate flex-1">{file.name}</span>
                          <button
                            type="button"
                            onClick={() => {
                              if (formData.pujaImages && Array.isArray(formData.pujaImages)) {
                                const updatedImages = formData.pujaImages.filter((_, i) => i !== index);
                                handleInputChange('pujaImages', updatedImages);
                                if (updatedImages.length === 0) {
                                  setImagesChanged(false);
                                }
                              }
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
                    ))}
                  </div>
                </div>
              )}
              
              {/* Show existing images info */}
              {pujaData && pujaData.puja_images && Array.isArray(pujaData.puja_images) && pujaData.puja_images.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="text-sm font-medium text-blue-700 mb-2">Current Images:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {pujaData.puja_images.map((imageUrl: string, index: number) => (
                      <div key={index} className="bg-white p-2 rounded border border-blue-200">
                        <div className="flex items-center gap-1">
                          <svg className="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                          </svg>
                          <span className="text-xs text-blue-600">Image {index + 1}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-blue-600 mt-2">
                    {imagesChanged ? 'These will be replaced with new images when saved' : 'Upload new images to replace these'}
                  </p>
                </div>
              )}
            </Form.Item>
          </div>

          {/* Section 2: Temple Details */}
          <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 p-6 rounded-xl border border-indigo-200 mb-6">
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
                      {(formData.templeImage && formData.templeImage.toString().trim()) 
                        ? `Selected: ${formData.templeImage}` 
                        : 'Click or drag to upload Temple Image'}
                    </p>
                    <p className="text-xs text-indigo-500">PNG, JPG, JPEG up to 10MB</p>
                  </div>
                </div>
                
                {/* Display selected temple image with remove option */}
                {formData.templeImage && formData.templeImage.toString().trim() && (
                  <div className="mt-4">
                    <div className="bg-white p-3 rounded-lg border border-indigo-200">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm text-gray-600 truncate flex-1">{formData.templeImage}</span>
                        <button
                          type="button"
                          onClick={() => handleInputChange('templeImage', '')}
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
                  value={(formData.templeAddress ?? '').toString()}
                  onChange={(e) => handleInputChange('templeAddress', e?.target?.value ?? '')}
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
                value={(formData.templeDescription ?? '').toString()}
                onChange={(e) => handleInputChange('templeDescription', e?.target?.value ?? '')}
                rows={4}
                placeholder="Enter temple description, history, and significance"
                className="w-full px-4 py-3 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-black placeholder-gray-400"
              />
            </Form.Item>
          </div>

          {/* Section 3: Puja Benefits */}
          <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-xl border border-green-200 mb-6">
            <h3 className="text-lg font-semibold text-green-800 mb-4 font-['Philosopher'] flex items-center gap-2">
              <span className="text-2xl">✨</span>
              3. Puja Benefits
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(formData.benefits && Array.isArray(formData.benefits) ? formData.benefits : []).map((benefit, index) => {
                const safeBenefit = benefit && typeof benefit === 'object' ? benefit : { title: '', description: '' };
                return (
                <div key={index} className="bg-white p-4 rounded-lg border border-green-200">
                  <h4 className="font-medium text-green-700 mb-3">Benefit {index + 1}</h4>
                  <Form.Item
                    name={['benefits', index, 'title']}
                    label={<span className="block text-sm font-medium text-gray-700 mb-2">Title</span>}
                  >
                    <Input
                      value={(safeBenefit?.title ?? '').toString()}
                      onChange={(e) => handleBenefitChange(index, 'title', e?.target?.value ?? '')}
                      placeholder={`Enter benefit ${index + 1} title`}
                      className="w-full px-4 py-3 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black placeholder-gray-400"
                    />
                  </Form.Item>

                  <Form.Item
                    name={['benefits', index, 'description']}
                    label={<span className="block text-sm font-medium text-gray-700 mb-2">Description</span>}
                  >
                    <Input.TextArea
                      value={(safeBenefit?.description ?? '').toString()}
                      onChange={(e) => handleBenefitChange(index, 'description', e?.target?.value ?? '')}
                      rows={3}
                      placeholder={`Enter benefit ${index + 1} description`}
                      className="w-full px-3 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black placeholder-gray-400 text-sm"
                    />
                  </Form.Item>
                </div>
                );
              })}
            </div>
          </div>

          {/* Section 4: Plan Details */}
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200 mb-6">
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
                className="w-full"
                dropdownClassName="border border-purple-200 rounded-lg"
                style={{
                  background: 'white',
                  borderRadius: '0.5rem',
                  border: '1px solid #E9D5FF',
                }}
              >
                <Option value="1">Basic Puja Package - ₹5,000</Option>
                <Option value="2">Premium VIP Experience - ₹15,000</Option>
                <Option value="3">Standard Family Package - ₹8,000</Option>
                <Option value="4">Exclusive VIP Darshan - ₹25,000</Option>
              </Select>
              <Text className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple plans</Text>
            </Form.Item>
          </div>

          {/* Section 5: Prasad */}
          <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-6 rounded-xl border border-yellow-200 mb-6">
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
                  onChange={(e) => handleInputChange('prasadPrice', parseInt(e?.target?.value ?? '0') || 0)}
                  placeholder="Enter prasad price"
                  className="w-full px-4 py-3 border border-yellow-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-black placeholder-gray-400"
                />
              </Form.Item>

              <Form.Item name="prasadStatus" valuePropName="checked">
                <Checkbox
                  checked={Boolean(formData.prasadStatus ?? false)}
                  onChange={(e) => handleInputChange('prasadStatus', e?.target?.checked ?? false)}
                  className="flex items-center gap-2 text-sm font-medium text-gray-700"
                >
                  Active Prasad Service
                </Checkbox>
              </Form.Item>
            </div>
          </div>

          {/* Section 6: Dakshina */}
          <div className="bg-gradient-to-r from-red-50 to-red-100 p-6 rounded-xl border border-red-200 mb-6">
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
                  value={(formData.dakshinaPrices ?? '').toString()}
                  onChange={(e) => handleInputChange('dakshinaPrices', e?.target?.value ?? '')}
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
                  value={(formData.dakshinaPricesUSD ?? '').toString()}
                  onChange={(e) => handleInputChange('dakshinaPricesUSD', e?.target?.value ?? '')}
                  placeholder="e.g., 1.5,2.5,4.0,6.0"
                  className="w-full px-4 py-3 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-black placeholder-gray-400"
                />
                <Text className="text-xs text-gray-500 mt-1">Optional: Manual USD pricing (comma-separated)</Text>
              </Form.Item>

              <Form.Item name="dakshinaStatus" valuePropName="checked">
                <Checkbox
                  checked={Boolean(formData.dakshinaStatus ?? false)}
                  onChange={(e) => handleInputChange('dakshinaStatus', e?.target?.checked ?? false)}
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
          <div className="bg-gradient-to-r from-pink-50 to-pink-100 p-6 rounded-xl border border-pink-200 mb-6">
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
                  value={(formData.manokamnaPrices ?? '').toString()}
                  onChange={(e) => handleInputChange('manokamnaPrices', e?.target?.value ?? '')}
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
                  value={(formData.manokamnaPricesUSD ?? '').toString()}
                  onChange={(e) => handleInputChange('manokamnaPricesUSD', e?.target?.value ?? '')}
                  placeholder="e.g., 0.75,1.25,2.0,3.0"
                  className="w-full px-4 py-3 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-black placeholder-gray-400"
                />
                <Text className="text-xs text-gray-500 mt-1">Optional: Manual USD pricing (comma-separated)</Text>
              </Form.Item>

              <Form.Item name="manokamnaStatus" valuePropName="checked">
                <Checkbox
                  checked={Boolean(formData.manokamnaStatus ?? false)}
                  onChange={(e) => handleInputChange('manokamnaStatus', e?.target?.checked ?? false)}
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

          {/* General Settings */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 font-['Philosopher'] flex items-center gap-2">
              <span className="text-2xl">⚙️</span>
              General Settings
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Form.Item
                name="category"
                label={<span className="block text-sm font-medium text-gray-700 mb-2">Category</span>}
              >
                <Select
                  value={(formData.category ?? 'general').toString()}
                  onChange={(value) => handleInputChange('category', value ?? 'general')}
                  className="w-full"
                  dropdownClassName="border border-gray-200 rounded-lg"
                  style={{
                    background: 'white',
                    borderRadius: '0.5rem',
                    border: '1px solid #E5E7EB',
                  }}
                >
                  <Option value="general">General</Option>
                  <Option value="prosperity">Prosperity</Option>
                  <Option value="health">Health</Option>
                  <Option value="education">Education</Option>
                  <Option value="marriage">Marriage</Option>
                  <Option value="spiritual">Spiritual</Option>
                </Select>
              </Form.Item>

              <div className="flex items-center gap-6 mt-8">
                <Form.Item name="isActive" valuePropName="checked">
                  <Checkbox
                    checked={Boolean(formData.isActive ?? true)}
                    onChange={(e) => handleInputChange('isActive', e?.target?.checked ?? true)}
                    className="flex items-center gap-2 text-sm font-medium text-gray-700"
                  >
                    Active
                  </Checkbox>
                </Form.Item>

                <Form.Item name="isFeatured" valuePropName="checked">
                  <Checkbox
                    checked={Boolean(formData.isFeatured ?? false)}
                    onChange={(e) => handleInputChange('isFeatured', e?.target?.checked ?? false)}
                    className="flex items-center gap-2 text-sm font-medium text-gray-700"
                  >
                    Featured
                  </Checkbox>
                </Form.Item>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={false}
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-2 rounded-lg font-medium border-none"
          >
            Update Puja
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default UpdatePujaModal;