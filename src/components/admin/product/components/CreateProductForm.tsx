'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { createProduct, uploadProductImages } from '@/store/slices/productSlice';
import { fetchProductCategories } from '@/store/slices/productCategorySlice';
import { AppDispatch, RootState } from '@/store';
import { message, Select } from 'antd';
import EditText from '@/components/ui/EditText';
import Button from '@/components/ui/Button';
import { useDropzone } from 'react-dropzone';
import CategoryModal from './CategoryModal';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const { Option } = Select;

// Sortable Image Item Component - FIXED: No infinite loop
interface SortableImageItemProps {
  file: File;
  index: number;
  onRemove: () => void;
}

const SortableImageItem: React.FC<SortableImageItemProps> = ({ 
  file, 
  index, 
  onRemove
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: file.name });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // FIXED: Create preview URL once using useMemo - prevents infinite loop
  const previewUrl = useMemo(() => {
    return URL.createObjectURL(file);
  }, [file]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group"
    >
      <div className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
        <img
          src={previewUrl}
          alt={`Product ${index + 1}`}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded">
          {index === 0 ? 'Primary' : `#${index + 1}`}
        </div>
        <div
          {...attributes}
          {...listeners}
          className="absolute top-2 right-2 bg-white p-1 rounded cursor-move hover:bg-gray-100"
        >
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        </div>
        <button
          onClick={onRemove}
          className="absolute bottom-2 right-2 bg-red-500 text-white p-1 rounded hover:bg-red-600"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

interface ProductFormData {
  name: string;
  slug: string;
  short_description: string;
  long_description: string;
  mrp: string;
  selling_price: string;
  discount_percentage: string;
  stock_quantity: string;
  sku: string;
  weight: string;
  dimensions: string;
  material: string;
  meta_description: string;
  tags: string;
  is_featured: boolean;
  is_active: boolean;
  allow_cod: boolean;
  category_id: number | null;
  productImages: File[];
}

interface CreateProductFormProps {
  onSuccess?: () => void;
}

const CreateProductForm: React.FC<CreateProductFormProps> = ({ onSuccess }) => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { isLoading } = useSelector((state: RootState) => state.product);
  const { categories, isLoading: categoriesLoading } = useSelector((state: RootState) => state.productCategory);

  const [formData, setFormData] = useState<ProductFormData>({
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
    category_id: null,
    productImages: [],
  });

  const [categoryModalVisible, setCategoryModalVisible] = useState(false);

  // Fetch categories on component mount
  useEffect(() => {
    dispatch(fetchProductCategories({ is_active: true }))
      .unwrap()
      .then(() => {
        message.success('Categories loaded successfully');
      })
      .catch((error) => {
        message.error(error || 'Failed to load categories');
      });
  }, [dispatch]);

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

  // Auto-generate slug from name
  useEffect(() => {
    if (formData.name && !formData.slug) {
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.name]);

  // DnD Kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end to reorder images
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setFormData(prev => {
        const oldIndex = prev.productImages.findIndex(img => img.name === active.id);
        const newIndex = prev.productImages.findIndex(img => img.name === over.id);
        return {
          ...prev,
          productImages: arrayMove(prev.productImages, oldIndex, newIndex),
        };
      });
    }
  };

  // Dropzone for product images
  const { getRootProps: getProductImagesRootProps, getInputProps: getProductImagesInputProps } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    maxFiles: 6,
    onDrop: (acceptedFiles, rejectedFiles) => {
      if (rejectedFiles.length > 0) {
        message.error('Some files were rejected. Please upload valid image files.');
        return;
      }

      if (formData.productImages.length + acceptedFiles.length > 6) {
        message.error('Maximum 6 images allowed');
        return;
      }

      setFormData(prev => ({
        ...prev,
        productImages: [...prev.productImages, ...acceptedFiles],
      }));
      
      if (acceptedFiles.length > 0) {
        message.success(`${acceptedFiles.length} image(s) added successfully`);
      }
    },
  });

  const handleInputChange = (field: keyof ProductFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      productImages: prev.productImages.filter((_, i) => i !== index),
    }));
    message.info('Image removed successfully');
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

    if (!formData.slug.trim()) {
      message.error('Product slug is required');
      return;
    }

    if (!formData.short_description.trim()) {
      message.error('Short description is required');
      return;
    }

    if (!formData.mrp || parseFloat(formData.mrp) <= 0) {
      message.error('Valid MRP is required');
      return;
    }

    if (!formData.selling_price || parseFloat(formData.selling_price) <= 0) {
      message.error('Valid selling price is required');
      return;
    }

    if (!formData.stock_quantity || parseInt(formData.stock_quantity) < 0) {
      message.error('Valid stock quantity is required');
      return;
    }

    if (!formData.sku.trim()) {
      message.error('SKU is required');
      return;
    }

    try {
      // Create product data
      const productData = {
        name: formData.name,
        slug: formData.slug,
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
        category_id: formData.category_id || undefined,
        image_urls: [], // Will be populated after image upload
      };

      // Create product
      const result = await dispatch(createProduct(productData)).unwrap();
      message.success('Product created successfully');

      // Upload images if any
      if (formData.productImages.length > 0) {
        try {
          await dispatch(uploadProductImages({
            productId: result.id,
            images: formData.productImages,
          })).unwrap();
          message.success(`${formData.productImages.length} image(s) uploaded successfully`);
        } catch (error: any) {
          message.error(error || 'Failed to upload images');
        }
      }

      // Reset form
      setFormData({
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
        category_id: null,
        productImages: [],
      });

      // Call success callback
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      message.error(error || 'Failed to create product');
    }
  };

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <div className="md:col-span-2">
            <EditText
              label="Short Description"
              placeholder="Brief product description"
              value={formData.short_description}
              onChange={(value) => handleInputChange('short_description', value)}
              fullWidth
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-[#111111] mb-1 sm:mb-2">
              Long Description
            </label>
            <textarea
              placeholder="Detailed product description"
              value={formData.long_description}
              onChange={(e) => handleInputChange('long_description', e.target.value)}
              className="w-full transition-all duration-200 ease-in-out border border-[#5c4228] rounded-[30px] bg-[#fff3ee] text-[#111111] placeholder:text-[#6d6d6d] focus:outline-none focus:ring-2 focus:ring-[#f37335] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base px-4 py-3 sm:py-4"
              rows={4}
            />
          </div>
        </div>
      </div>

      {/* Category */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Category</h3>
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
          <Button
            variant="outline"
            onClick={() => setCategoryModalVisible(true)}
          >
            ➕ Add Category
          </Button>
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <EditText
              label="MRP (₹)"
              placeholder="0.00"
              type="number"
              value={formData.mrp}
              onChange={(value) => handleInputChange('mrp', value)}
              fullWidth
              required
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
              required
            />
          </div>
          <div>
            <EditText
              label="Discount (%)"
              placeholder="0.00"
              type="number"
              value={formData.discount_percentage}
              onChange={(value) => handleInputChange('discount_percentage', value)}
              fullWidth
              disabled
            />
          </div>
        </div>
      </div>

      {/* Inventory */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Inventory</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <EditText
              label="Stock Quantity"
              placeholder="0"
              type="number"
              value={formData.stock_quantity}
              onChange={(value) => handleInputChange('stock_quantity', value)}
              fullWidth
              required
            />
          </div>
          <div>
            <EditText
              label="SKU"
              placeholder="PROD-001"
              value={formData.sku}
              onChange={(value) => handleInputChange('sku', value)}
              fullWidth
              required
            />
          </div>
        </div>
      </div>

      {/* Product Details */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              placeholder="e.g., Cotton, Brass, etc."
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
          <div className="md:col-span-2">
            <EditText
              label="Meta Description (SEO)"
              placeholder="SEO-friendly description"
              value={formData.meta_description}
              onChange={(value) => handleInputChange('meta_description', value)}
              fullWidth
            />
          </div>
        </div>
      </div>

      {/* Product Images */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Images</h3>
        <div className="space-y-4">
          {formData.productImages.length > 0 && (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={formData.productImages.map(img => img.name)}
                strategy={verticalListSortingStrategy}
              >
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {formData.productImages.map((file, index) => (
                    <SortableImageItem
                      key={file.name}
                      file={file}
                      index={index}
                      onRemove={() => handleRemoveImage(index)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}

          {formData.productImages.length < 6 && (
            <div
              {...getProductImagesRootProps()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-orange-500 transition-colors"
            >
              <input {...getProductImagesInputProps()} />
              <div className="flex flex-col items-center">
                <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-sm text-gray-600">
                  Drag & drop images here, or click to select
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Maximum 6 images (PNG, JPG, JPEG, WEBP)
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Settings */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Settings</h3>
        <div className="space-y-3">
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

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? 'Creating...' : 'Create Product'}
        </Button>
      </div>

      {/* Category Modal */}
      <CategoryModal
        visible={categoryModalVisible}
        onClose={() => setCategoryModalVisible(false)}
        onSuccess={handleCategorySuccess}
      />
    </div>
  );
};

export default CreateProductForm;