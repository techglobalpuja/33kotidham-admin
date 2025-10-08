'use client';

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Modal, Form, Input, Button, Checkbox, Select, Typography, Row, Col } from 'antd';
import { useDropzone } from 'react-dropzone';
import { RootState } from '@/store';
import { fetchPujaById, updatePuja } from '@/store/slices/pujaSlice';

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
  manokamnaPrices: string;
  manokamnaPricesUSD: string;
  manokamnaStatus: boolean;
  category: string;
  isActive: boolean;
  isFeatured: boolean;
}

interface UpdatePujaModalProps {
  pujaId: string;
  visible: boolean;
  onCancel: () => void;
  onSuccess?: () => void;
}

const UpdatePujaModal: React.FC<UpdatePujaModalProps> = ({ pujaId, visible, onCancel, onSuccess }) => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const selectedPuja = useSelector((state: RootState) => state.puja.selectedPuja);
  const isLoading = useSelector((state: RootState) => state.puja.isLoading);
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

  useEffect(() => {
    if (pujaId && visible) {
      dispatch(fetchPujaById(pujaId) as any);
    }
  }, [pujaId, visible, dispatch]);

  useEffect(() => {
    if (selectedPuja && visible && pujaId) {
      setFormData({
        pujaName: selectedPuja.name ?? '',
        subHeading: selectedPuja.sub_heading ?? '',
        about: selectedPuja.description ?? '',
        pujaImages: selectedPuja.puja_images ?? [],
        templeImage: selectedPuja.temple_image_url ?? '',
        templeAddress: selectedPuja.temple_address ?? '',
        templeDescription: selectedPuja.temple_description ?? '',
        benefits: selectedPuja.benefits ?? [
          { title: '', description: '' },
          { title: '', description: '' },
          { title: '', description: '' },
          { title: '', description: '' },
        ],
        selectedPlanIds: selectedPuja.selected_plan_ids ?? [],
        prasadPrice: selectedPuja.prasad_price ?? 0,
        prasadStatus: selectedPuja.is_prasad_active ?? false,
        dakshinaPrices: selectedPuja.dakshina_prices_inr ?? '',
        dakshinaPricesUSD: selectedPuja.dakshina_prices_usd ?? '',
        dakshinaStatus: selectedPuja.is_dakshina_active ?? false,
        manokamnaPrices: selectedPuja.manokamna_prices_inr ?? '',
        manokamnaPricesUSD: selectedPuja.manokamna_prices_usd ?? '',
        manokamnaStatus: selectedPuja.is_manokamna_active ?? false,
        category: selectedPuja.category ?? 'general',
        isActive: selectedPuja.is_active ?? true,
        isFeatured: selectedPuja.is_featured ?? false,
      });
    }
  }, [selectedPuja, visible, pujaId]);

  // Dropzone for Puja Images
  const { getRootProps: getPujaRootProps, getInputProps: getPujaInputProps } = useDropzone({
    accept: { 'image/*': [] },
    multiple: true,
    maxFiles: 6,
    onDrop: (acceptedFiles) => {
      const fileNames = acceptedFiles.map((file) => file.name);
      handleInputChange('pujaImages', fileNames);
    },
  });

  // Dropzone for Temple Image
  const { getRootProps: getTempleRootProps, getInputProps: getTempleInputProps } = useDropzone({
    accept: { 'image/*': [] },
    multiple: false,
    onDrop: (acceptedFiles) => {
      const fileName = acceptedFiles[0]?.name || '';
      handleInputChange('templeImage', fileName);
    },
  });

  const handleInputChange = (field: keyof PujaFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value ?? '',
    }));
  };

  const handleBenefitChange = (index: number, field: keyof Benefit, value: string) => {
    const newBenefits = [...(formData.benefits ?? [])];
    newBenefits[index] = { ...newBenefits[index], [field]: value ?? '' };
    setFormData((prev) => ({ ...prev, benefits: newBenefits }));
  };

  const handleSubmit = async () => {
    try {
      if (!pujaId) {
        console.error('Puja ID is required');
        return;
      }
      
      const requestData = {
        name: (formData.pujaName ?? '').trim(),
        sub_heading: (formData.subHeading ?? '').trim(),
        description: (formData.about ?? '').trim(),
        date: null,
        time: null,
        temple_image_url: formData.templeImage ?? '',
        temple_address: (formData.templeAddress ?? '').trim(),
        temple_description: (formData.templeDescription ?? '').trim(),
        prasad_price: formData.prasadPrice ?? 0,
        is_prasad_active: formData.prasadStatus ?? false,
        dakshina_prices_inr: formData.dakshinaPrices ?? '',
        dakshina_prices_usd: formData.dakshinaPricesUSD ?? '',
        is_dakshina_active: formData.dakshinaStatus ?? false,
        manokamna_prices_inr: formData.manokamnaPrices ?? '',
        manokamna_prices_usd: formData.manokamnaPricesUSD ?? '',
        is_manokamna_active: formData.manokamnaStatus ?? false,
        category: formData.category ?? 'general',
        is_active: formData.isActive ?? true,
        is_featured: formData.isFeatured ?? false,
        benefits: formData.benefits ?? [],
        selected_plan_ids: formData.selectedPlanIds ?? [],
      };
      await dispatch(updatePuja({ id: pujaId, ...requestData }) as any);
      onSuccess?.();
      onCancel();
    } catch (error) {
      // Errors not handled via Redux state as per request
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <span className="text-2xl">🛕</span>
          <span className="font-['Philosopher'] text-xl">Update Puja</span>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={1000}
      className="admin-puja-modal"
    >
      <Form form={form} onFinish={handleSubmit} layout="vertical" className="space-y-6">
        <div className="max-h-[70vh] overflow-y-auto pr-2">
          {/* Section 1: Puja Details */}
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-xl border border-orange-200 mb-4">
            <h3 className="text-md font-semibold text-orange-800 mb-3 font-['Philosopher'] flex items-center gap-2">
              <span className="text-xl">🛕</span>
              1. Puja Details
            </h3>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="pujaName"
                  label={<span className="block text-sm font-medium text-gray-700">Puja Name</span>}
                  required={true}
                >
                  <Input
                    value={formData.pujaName ?? ''}
                    onChange={(e) => handleInputChange('pujaName', e.target.value ?? '')}
                    placeholder="Enter puja name"
                    className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  name="subHeading"
                  label={<span className="block text-sm font-medium text-gray-700">Sub Heading</span>}
                  required={true}
                >
                  <Input
                    value={formData.subHeading ?? ''}
                    onChange={(e) => handleInputChange('subHeading', e.target.value ?? '')}
                    placeholder="Enter puja sub heading"
                    className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="about"
              label={<span className="block text-sm font-medium text-gray-700">About Puja</span>}
            >
              <Input.TextArea
                value={formData.about ?? ''}
                onChange={(e) => handleInputChange('about', e.target.value ?? '')}
                rows={3}
                placeholder="Enter detailed description about the puja"
                className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </Form.Item>

            <Form.Item
              name="pujaImages"
              label={<span className="block text-sm font-medium text-gray-700">Puja Images (Max 6)</span>}
            >
              <div
                {...getPujaRootProps()}
                className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200 border-orange-300 bg-orange-50 hover:bg-orange-100"
              >
                <input {...getPujaInputProps()} />
                <div className="flex flex-col items-center justify-center pt-3 pb-4">
                  <svg
                    className="w-6 h-6 mb-1 text-orange-400"
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
                  <p className="mb-1 text-xs font-medium text-orange-600">
                    {formData.pujaImages.length > 0 ? `Selected ${formData.pujaImages.length} files` : 'Click or drag to upload images'}
                  </p>
                  <p className="text-xs text-orange-500">PNG, JPG, JPEG up to 10MB</p>
                </div>
              </div>
            </Form.Item>
          </div>

          {/* Section 2: Temple Details */}
          <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 p-4 rounded-xl border border-indigo-200 mb-4">
            <h3 className="text-md font-semibold text-indigo-800 mb-3 font-['Philosopher'] flex items-center gap-2">
              <span className="text-xl">🏦</span>
              2. Temple Details
            </h3>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="templeImage"
                  label={<span className="block text-sm font-medium text-gray-700">Temple Image</span>}
                >
                  <div
                    {...getTempleRootProps()}
                    className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer bg-indigo-50 hover:bg-indigo-100 transition-colors duration-200 border-indigo-300"
                  >
                    <input {...getTempleInputProps()} />
                    <div className="flex flex-col items-center justify-center pt-3 pb-4">
                      <svg
                        className="w-6 h-6 mb-1 text-indigo-400"
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
                      <p className="mb-1 text-xs text-indigo-600 font-medium">
                        {formData.templeImage ? `Selected: ${formData.templeImage}` : 'Click or drag to upload Temple Image'}
                      </p>
                      <p className="text-xs text-indigo-500">PNG, JPG, JPEG up to 10MB</p>
                    </div>
                  </div>
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  name="templeAddress"
                  label={<span className="block text-sm font-medium text-gray-700">Temple Address</span>}
                >
                  <Input
                    value={formData.templeAddress ?? ''}
                    onChange={(e) => handleInputChange('templeAddress', e.target.value ?? '')}
                    placeholder="Enter complete temple address"
                    className="w-full px-3 py-2 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="templeDescription"
              label={<span className="block text-sm font-medium text-gray-700">Temple Description</span>}
            >
              <Input.TextArea
                value={formData.templeDescription ?? ''}
                onChange={(e) => handleInputChange('templeDescription', e.target.value ?? '')}
                rows={3}
                placeholder="Enter temple description, history, and significance"
                className="w-full px-3 py-2 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </Form.Item>
          </div>

          {/* Section 3: Puja Benefits */}
          <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl border border-green-200 mb-4">
            <h3 className="text-md font-semibold text-green-800 mb-3 font-['Philosopher'] flex items-center gap-2">
              <span className="text-xl">✨</span>
              3. Puja Benefits
            </h3>

            <Row gutter={16}>
              {(formData.benefits ?? []).map((benefit, index) => (
                <Col span={12} key={index}>
                  <div className="bg-white p-3 rounded-lg border border-green-200 mb-3">
                    <h4 className="font-medium text-green-700 mb-2">Benefit {index + 1}</h4>
                    <Form.Item
                      name={['benefits', index, 'title']}
                      label={<span className="block text-xs font-medium text-gray-700">Title</span>}
                    >
                      <Input
                        value={benefit?.title ?? ''}
                        onChange={(e) => handleBenefitChange(index, 'title', e.target.value ?? '')}
                        placeholder={`Enter benefit ${index + 1} title`}
                        className="w-full px-3 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                      />
                    </Form.Item>

                    <Form.Item
                      name={['benefits', index, 'description']}
                      label={<span className="block text-xs font-medium text-gray-700">Description</span>}
                    >
                      <Input.TextArea
                        value={benefit?.description ?? ''}
                        onChange={(e) => handleBenefitChange(index, 'description', e.target.value ?? '')}
                        rows={2}
                        placeholder={`Enter benefit ${index + 1} description`}
                        className="w-full px-3 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                      />
                    </Form.Item>
                  </div>
                </Col>
              ))}
            </Row>
          </div>

          {/* Section 4: Plan Details */}
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200 mb-4">
            <h3 className="text-md font-semibold text-purple-800 mb-3 font-['Philosopher'] flex items-center gap-2">
              <span className="text-xl">📋</span>
              4. Plan Details
            </h3>

            <Form.Item
              name="selectedPlanIds"
              label={<span className="block text-sm font-medium text-gray-700">Select Plans (Multiple Selection)</span>}
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
          <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-xl border border-yellow-200 mb-4">
            <h3 className="text-md font-semibold text-yellow-800 mb-3 font-['Philosopher'] flex items-center gap-2">
              <span className="text-xl">🍯</span>
              5. Prasad
            </h3>

            <Row gutter={16} align="middle">
              <Col span={12}>
                <Form.Item
                  name="prasadPrice"
                  label={<span className="block text-sm font-medium text-gray-700">Prasad Price (₹)</span>}
                >
                  <Input
                    type="number"
                    value={(formData.prasadPrice ?? 0).toString()}
                    onChange={(e) => handleInputChange('prasadPrice', parseInt(e.target.value ?? '0') || 0)}
                    placeholder="Enter prasad price"
                    className="w-full px-3 py-2 border border-yellow-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item name="prasadStatus" valuePropName="checked">
                  <Checkbox
                    checked={formData.prasadStatus ?? false}
                    onChange={(e) => handleInputChange('prasadStatus', e.target.checked ?? false)}
                    className="flex items-center gap-2 text-sm font-medium text-gray-700"
                  >
                    Active Prasad Service
                  </Checkbox>
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Section 6: Dakshina */}
          <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-xl border border-red-200 mb-4">
            <h3 className="text-md font-semibold text-red-800 mb-3 font-['Philosopher'] flex items-center gap-2">
              <span className="text-xl">💰</span>
              6. Dakshina
            </h3>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="dakshinaPrices"
                  label={<span className="block text-sm font-medium text-gray-700">Dakshina Prices (₹)</span>}
                >
                  <Input
                    value={formData.dakshinaPrices ?? ''}
                    onChange={(e) => handleInputChange('dakshinaPrices', e.target.value ?? '')}
                    placeholder="e.g., 101,201,310,500"
                    className="w-full px-3 py-2 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                  <Text className="text-xs text-gray-500 mt-1">Enter comma-separated values for multiple price options</Text>
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item
                  name="dakshinaPricesUSD"
                  label={<span className="block text-sm font-medium text-gray-700">Dakshina Prices (USD)</span>}
                >
                  <Input
                    value={formData.dakshinaPricesUSD ?? ''}
                    onChange={(e) => handleInputChange('dakshinaPricesUSD', e.target.value ?? '')}
                    placeholder="e.g., 1.5,2.5,4.0,6.0"
                    className="w-full px-3 py-2 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                  <Text className="text-xs text-gray-500 mt-1">Optional: Manual USD pricing (comma-separated)</Text>
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item name="dakshinaStatus" valuePropName="checked">
                  <Checkbox
                    checked={formData.dakshinaStatus ?? false}
                    onChange={(e) => handleInputChange('dakshinaStatus', e.target.checked ?? false)}
                    className="flex items-center gap-2 text-sm font-medium text-gray-700"
                  >
                    Active Dakshina
                  </Checkbox>
                </Form.Item>
              </Col>
            </Row>

            <div className="mt-3 p-2 bg-white rounded-lg border border-red-200">
              <Text className="text-xs text-gray-600">
                <span className="font-medium">Note: </span>
                <span className="text-red-600">No automatic conversion - you can manually set both INR and USD prices</span>
              </Text>
            </div>
          </div>

          {/* Section 7: Manokamna Parchi */}
          <div className="bg-gradient-to-r from-pink-50 to-pink-100 p-4 rounded-xl border border-pink-200 mb-4">
            <h3 className="text-md font-semibold text-pink-800 mb-3 font-['Philosopher'] flex items-center gap-2">
              <span className="text-xl">📜</span>
              7. Manokamna Parchi
            </h3>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="manokamnaPrices"
                  label={<span className="block text-sm font-medium text-gray-700">Manokamna Prices (₹)</span>}
                >
                  <Input
                    value={formData.manokamnaPrices ?? ''}
                    onChange={(e) => handleInputChange('manokamnaPrices', e.target.value ?? '')}
                    placeholder="e.g., 51,101,151,251"
                    className="w-full px-3 py-2 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                  <Text className="text-xs text-gray-500 mt-1">Enter comma-separated values for multiple price options</Text>
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item
                  name="manokamnaPricesUSD"
                  label={<span className="block text-sm font-medium text-gray-700">Manokamna Prices (USD)</span>}
                >
                  <Input
                    value={formData.manokamnaPricesUSD ?? ''}
                    onChange={(e) => handleInputChange('manokamnaPricesUSD', e.target.value ?? '')}
                    placeholder="e.g., 0.75,1.25,2.0,3.0"
                    className="w-full px-3 py-2 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                  <Text className="text-xs text-gray-500 mt-1">Optional: Manual USD pricing (comma-separated)</Text>
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item name="manokamnaStatus" valuePropName="checked">
                  <Checkbox
                    checked={formData.manokamnaStatus ?? false}
                    onChange={(e) => handleInputChange('manokamnaStatus', e.target.checked ?? false)}
                    className="flex items-center gap-2 text-sm font-medium text-gray-700"
                  >
                    Active Manokamna
                  </Checkbox>
                </Form.Item>
              </Col>
            </Row>

            <div className="mt-3 p-2 bg-white rounded-lg border border-pink-200">
              <Text className="text-xs text-gray-600">
                <span className="font-medium">Note: </span>
                <span className="text-pink-600">
                  Manokamna Parchi allows devotees to write their wishes and prayers. No automatic conversion - you can
                  manually set both INR and USD prices
                </span>
              </Text>
            </div>
          </div>

          {/* General Settings */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200 mb-4">
            <h3 className="text-md font-semibold text-gray-800 mb-3 font-['Philosopher'] flex items-center gap-2">
              <span className="text-xl">⚙️</span>
              General Settings
            </h3>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="category"
                  label={<span className="block text-sm font-medium text-gray-700">Category</span>}
                >
                  <Select
                    value={formData.category ?? 'general'}
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
              </Col>

              <Col span={12}>
                <div className="flex items-center gap-6 mt-6">
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
              </Col>
            </Row>
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
            loading={isLoading}
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