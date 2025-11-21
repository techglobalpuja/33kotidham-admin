'use client';

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Modal, Select, message } from 'antd';
import { AppDispatch, RootState } from '@/store';
import { fetchProductById, updateProduct, uploadProductImages, deleteProductImage } from '@/store/slices/productSlice';
import { fetchProductCategories } from '@/store/slices/productCategorySlice';
import EditText from '@/components/ui/EditText';
import CategoryModal from './CategoryModal';

const { Option } = Select;

interface UpdateProductModalProps {
  visible: boolean;
  productId: number;
  onClose: () => void;
  onSuccess: () => void;
}

const UpdateProductModal: React.FC<UpdateProductModalProps> = ({ visible, productId, onClose, onSuccess }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { selectedProduct, isLoading } = useSelector((state: RootState) => state.product);
  const { categories, isLoading: categoriesLoading } = useSelector((state: RootState) => state.productCategory);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    short_description: '',
    long_description: '',
    mrp: '',
    selling_price: '',
    discount_percentage: '',
    stock_quantity: '',
    sku: '',
    weight: '',
    dimensions: '',
    material: '',
    meta_description: '',
    tags: '',
    is_featured: false,
    is_active: true,
    allow_cod: false,
    category_id: null as number | null,
  });

  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [newImages, setNewImages] = useState<File[]>([]);

  useEffect(() => {
    if (visible && productId) {
      // Only fetch if we don't already have the product data or it's a different product
      if (!selectedProduct || selectedProduct.id !== productId) {
        dispatch(fetchProductById(productId))
          .unwrap()
          .then(() => {
            message.success('Product loaded successfully');
          })
          .catch((error) => {
            message.error(error || 'Failed to load product details');
          });
        dispatch(fetchProductCategories({ is_active: true }))
          .unwrap()
          .catch((error) => {
            message.error(error || 'Failed to load categories');
          });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, productId]);

  useEffect(() => {
    if (selectedProduct && selectedProduct.id === productId) {
      setFormData({
        name: selectedProduct.name,
        slug: selectedProduct.slug,
        short_description: selectedProduct.short_description,
        long_description: selectedProduct.long_description,
        mrp: selectedProduct.mrp,
        selling_price: selectedProduct.selling_price,
        discount_percentage: selectedProduct.discount_percentage,
        stock_quantity: selectedProduct.stock_quantity.toString(),
        sku: selectedProduct.sku,
        weight: selectedProduct.weight,
        dimensions: selectedProduct.dimensions,
        material: selectedProduct.material,
        meta_description: selectedProduct.meta_description,
        tags: selectedProduct.tags,
        is_featured: selectedProduct.is_featured,
        is_active: selectedProduct.is_active,
        allow_cod: selectedProduct.allow_cod,
        category_id: selectedProduct.category_id,
      });
    }
  }, [selectedProduct, productId]);

  // Auto-calculate discount percentage
  useEffect(() => {
    if (formData.mrp && formData.selling_price) {
      const mrp = parseFloat(formData.mrp);
      const sellingPrice = parseFloat(formData.selling_price);
      if (mrp > 0 && sellingPrice > 0) {
        const discount = ((mrp - sellingPrice) / mrp) * 100;
        setFormData(prev => ({ ...prev, discount_percentage: discount.toFixed(2) }));
      }
    }
  }, [formData.mrp, formData.selling_price]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setNewImages(prev => [...prev, ...files]);
      message.success(`${files.length} image(s) added for upload`);
    }
  };

  const handleRemoveNewImage = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
    message.info('Image removed from upload list');
  };

  // Helper function to get proper image URL
  const getImageUrl = (imageUrl: string) => {
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    return `https://api.33kotidham.in/${imageUrl}`;
  };

  const handleRemoveExistingImage = async (imageId: number) => {
    try {
      await dispatch(deleteProductImage({ productId, imageId })).unwrap();
      message.success('Image removed successfully');
      dispatch(fetchProductById(productId));
    } catch (error: any) {
      message.error(error || 'Failed to remove image');
    }
  };

  const handleCategorySuccess = (categoryId: number) => {
    dispatch(fetchProductCategories({ is_active: true }))
      .unwrap()
      .catch((error) => {
        message.error(error || 'Failed to refresh categories');
      });
    setFormData(prev => ({ ...prev, category_id: categoryId }));
    message.success('Category added successfully');
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.name.trim()) {
      message.error('Product name is required');
      return;
    }

    try {
      // Update product data
      const productData = {
        name: formData.name,
        slug: formData.slug,
        category_id: formData.category_id || undefined,
        short_description: formData.short_description,
        long_description: formData.long_description,
        mrp: parseFloat(formData.mrp),
        selling_price: parseFloat(formData.selling_price),
        discount_percentage: parseFloat(formData.discount_percentage) || 0,
        stock_quantity: parseInt(formData.stock_quantity),
        sku: formData.sku,
        weight: parseFloat(formData.weight) || 0,
        dimensions: formData.dimensions,
        material: formData.material,
        meta_description: formData.meta_description,
        tags: formData.tags,
        is_featured: formData.is_featured,
        is_active: formData.is_active,
        allow_cod: formData.allow_cod,
      };

      await dispatch(updateProduct({ id: productId, productData })).unwrap();
      message.success('Product updated successfully');

      // Upload new images if any
      if (newImages.length > 0) {
        try {
          await dispatch(uploadProductImages({
            productId,
            images: newImages,
          })).unwrap();
          message.success(`${newImages.length} image(s) uploaded successfully`);
        } catch (error: any) {
          message.error(error || 'Failed to upload images');
        }
      }

      setNewImages([]);
      onSuccess();
    } catch (error: any) {
      message.error(error || 'Failed to update product');
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <span className="text-xl">✏️</span>
          <span className="text-lg font-semibold">Update Product</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      onOk={handleSubmit}
      okText="Update Product"
      cancelText="Cancel"
      confirmLoading={isLoading}
      width={900}
      bodyStyle={{ maxHeight: '70vh', overflowY: 'auto' }}
    >
      <div className="space-y-6 mt-4">
        {/* Basic Information */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Basic Information</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <EditText
                label="Product Name"
                placeholder="Enter product name"
                value={formData.name}
                onChange={(value) => handleInputChange('name', value)}
                fullWidth
                required
              />
            </div>
            <div>
              <EditText
                label="Slug"
                placeholder="product-slug"
                value={formData.slug}
                onChange={(value) => handleInputChange('slug', value)}
                fullWidth
                required
              />
            </div>
            <div className="col-span-2">
              <EditText
                label="Short Description"
                placeholder="Brief product description"
                value={formData.short_description}
                onChange={(value) => handleInputChange('short_description', value)}
                fullWidth
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-[#111111] mb-1">
                Long Description
              </label>
              <textarea
                placeholder="Detailed product description"
                value={formData.long_description}
                onChange={(e) => handleInputChange('long_description', e.target.value)}
                className="w-full transition-all duration-200 ease-in-out border border-[#5c4228] rounded-[30px] bg-[#fff3ee] text-[#111111] placeholder:text-[#6d6d6d] focus:outline-none focus:ring-2 focus:ring-[#f37335] focus:border-transparent text-sm px-4 py-3"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Category */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Category</h4>
          <div className="flex gap-2">
            <div className="flex-1">
              <Select
                placeholder="Select category"
                value={formData.category_id}
                onChange={(value) => handleInputChange('category_id', value)}
                className="w-full"
                size="large"
                loading={categoriesLoading}
                allowClear
              >
                {categories?.map(category => (
                  <Option key={category.id} value={category.id}>
                    {category.name}
                  </Option>
                ))}
              </Select>
            </div>
            <button
              onClick={() => setCategoryModalVisible(true)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded text-sm font-medium transition-colors"
            >
              ➕ Add
            </button>
          </div>
        </div>

        {/* Pricing */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Pricing</h4>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <EditText
                label="MRP (₹)"
                placeholder="0.00"
                type="number"
                value={formData.mrp}
                onChange={(value) => handleInputChange('mrp', value)}
                fullWidth
              />
            </div>
            <div>
              <EditText
                label="Selling Price (₹)"
                placeholder="0.00"
                type="number"
                value={formData.selling_price}
                onChange={(value) => handleInputChange('selling_price', value)}
                fullWidth
              />
            </div>
            <div>
              <EditText
                label="Discount (%)"
                placeholder="0.00"
                type="number"
                value={formData.discount_percentage}
                disabled
                fullWidth
              />
            </div>
          </div>
        </div>

        {/* Inventory */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Inventory</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <EditText
                label="Stock Quantity"
                placeholder="0"
                type="number"
                value={formData.stock_quantity}
                onChange={(value) => handleInputChange('stock_quantity', value)}
                fullWidth
              />
            </div>
            <div>
              <EditText
                label="SKU"
                placeholder="PROD-001"
                value={formData.sku}
                onChange={(value) => handleInputChange('sku', value)}
                fullWidth
              />
            </div>
          </div>
        </div>

        {/* Product Details */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Product Details</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <EditText
                label="Weight (kg)"
                placeholder="0.00"
                type="number"
                value={formData.weight}
                onChange={(value) => handleInputChange('weight', value)}
                fullWidth
              />
            </div>
            <div>
              <EditText
                label="Dimensions"
                placeholder="L x W x H (cm)"
                value={formData.dimensions}
                onChange={(value) => handleInputChange('dimensions', value)}
                fullWidth
              />
            </div>
            <div>
              <EditText
                label="Material"
                placeholder="e.g., Cotton, Brass"
                value={formData.material}
                onChange={(value) => handleInputChange('material', value)}
                fullWidth
              />
            </div>
            <div>
              <EditText
                label="Tags"
                placeholder="tag1, tag2, tag3"
                value={formData.tags}
                onChange={(value) => handleInputChange('tags', value)}
                fullWidth
              />
            </div>
          </div>
        </div>

        {/* Images */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Images</h4>
          
          {/* Existing Images */}
          {selectedProduct?.images && selectedProduct.images.length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-2">Existing Images</p>
              <div className="grid grid-cols-4 gap-2">
                {selectedProduct.images.map((image) => (
                  <div key={image.id} className="relative group">
                    <img
                      src={getImageUrl(image.image_url)}
                      alt="Product"
                      className="w-full h-24 object-cover rounded border"
                    />
                    {image.is_primary && (
                      <div className="absolute top-1 left-1 bg-orange-500 text-white text-xs px-1 rounded">
                        Primary
                      </div>
                    )}
                    <button
                      onClick={() => handleRemoveExistingImage(image.id)}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Images */}
          {newImages.length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-2">New Images to Upload</p>
              <div className="grid grid-cols-4 gap-2">
                {newImages.map((file, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(file)}
                      alt="New"
                      className="w-full h-24 object-cover rounded border"
                    />
                    <button
                      onClick={() => handleRemoveNewImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Button */}
          <div>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Images
            </label>
          </div>
        </div>

        {/* Settings */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Settings</h4>
          <div className="space-y-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_featured"
                checked={formData.is_featured}
                onChange={(e) => handleInputChange('is_featured', e.target.checked)}
                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
              />
              <label htmlFor="is_featured" className="ml-2 block text-sm text-gray-900">
                Featured Product
              </label>
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
            <div className="flex items-center">
              <input
                type="checkbox"
                id="allow_cod"
                checked={formData.allow_cod}
                onChange={(e) => handleInputChange('allow_cod', e.target.checked)}
                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
              />
              <label htmlFor="allow_cod" className="ml-2 block text-sm text-gray-900">
                Allow Cash on Delivery
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Category Modal */}
      <CategoryModal
        visible={categoryModalVisible}
        onClose={() => setCategoryModalVisible(false)}
        onSuccess={handleCategorySuccess}
      />
    </Modal>
  );
};

export default UpdateProductModal;