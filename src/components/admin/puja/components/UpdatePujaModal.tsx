'use client';

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Modal, Form, Input, Button, Checkbox, Select, Typography, Row, Col, message } from 'antd';
import { useDropzone } from 'react-dropzone';
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
import { RootState } from '@/store';
import { fetchPujaById, updatePuja, uploadPujaImages, deletePujaImage } from '@/store/slices/pujaSlice';
import { fetchPlans } from '@/store/slices/planSlice';
import { fetchChadawas } from '@/store/slices/chadawaSlice';
import { uploadTempleImage } from '@/store/slices/templeSlice';
import { AppDispatch } from '@/store';

const { Text } = Typography;
const { Option } = Select;

// Sortable Image Item Component for Update Modal
interface SortableImageItemProps {
  file: File;
  index: number;
  onRemove: () => void;
  createImagePreviewUrl: (file: File) => string;
  revokeImagePreviewUrl: (url: string) => void;
}

const SortableImageItem: React.FC<SortableImageItemProps> = ({ 
  file, 
  index, 
  onRemove,
  createImagePreviewUrl,
  revokeImagePreviewUrl
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: file.name + index });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  let previewUrl = '';
  try {
    previewUrl = createImagePreviewUrl(file);
  } catch (e) {}

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className="relative bg-white p-3 rounded-lg border-2 border-orange-200 hover:border-orange-400 transition-colors cursor-move"
    >
      {/* Drag Handle Indicator */}
      <div 
        {...attributes} 
        {...listeners}
        className="absolute top-2 left-2 z-10 bg-orange-500 text-white px-2 py-1 rounded text-xs font-bold flex items-center gap-1 cursor-grab active:cursor-grabbing"
      >
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
        #{index + 1}
      </div>

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
            onClick={onRemove}
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
          onClick={onRemove}
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
};

interface Benefit {
  title?: string | null;
  description?: string | null;
}

interface PujaFormData {
  pujaName?: string | null;
  subHeading?: string | null;
  about?: string | null;
  images?: any[] | null; // ✅ EXISTING IMAGES
  pujaImages?: File[] | null; // ✅ NEW FILES
  templeImage?: string | null;
  templeImageFile?: File | null; // ✅ NEW: Store the file for upload
  templeImageUrl?: string | null; // ✅ NEW: Store uploaded URL
  templeAddress?: string | null;
  templeDescription?: string | null;
  benefits?: Benefit[] | null;
  selectedPlanIds?: number[] | null;
  selectedChadawaIds?: number[] | null; // ✅ NEW: chadawa IDs
  date?: string | null; // ✅ CHANGED: just date
  time?: string | null; // ✅ CHANGED: just time
  prasadPrice?: number | null;
  prasadStatus?: boolean | null;
  dakshinaPrices?: string | null;
  dakshinaPricesUSD?: string | null;
  dakshinaStatus?: boolean | null;
  manokamnaPrices?: string | null;
  manokamnaPricesUSD?: string | null;
  manokamnaStatus?: boolean | null;
  category?: string[] | null;
  isActive?: boolean | null;
  isFeatured?: boolean | null;
}

interface UpdatePujaModalProps {
  pujaId?: string | null;
  visible?: boolean;
  pujaData?: any;
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
  
  const safePujaId = (pujaId ?? '').toString().trim();
  const isVisible = Boolean(visible ?? false);
  const safeOnCancel = onCancel ?? (() => {});
  const safeOnSuccess = onSuccess ?? (() => {});
  
  const dispatch = useDispatch<AppDispatch>();
  const { plans, isLoading: plansLoading } = useSelector((state: RootState) => state.plan);
  const { chadawas, isLoading: chadawasLoading } = useSelector((state: RootState) => state.chadawa); // ✅ NEW: chadawa state

  const [imagesChanged, setImagesChanged] = useState(false);
  const [form] = Form.useForm();

  const [formData, setFormData] = useState<PujaFormData>({
    pujaName: '',
    subHeading: '',
    about: '',
    images: [], // ✅ EXISTING IMAGES
    pujaImages: [], // ✅ NEW FILES
    templeImage: '',
    templeImageFile: null,
    templeImageUrl: '',
    templeAddress: '',
    templeDescription: '',
    benefits: [
      { title: '', description: '' },
      { title: '', description: '' },
      { title: '', description: '' },
      { title: '', description: '' },
    ],
    selectedPlanIds: [],
    selectedChadawaIds: [], // ✅ NEW: chadawa IDs
    date: '',
    time: '',
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

  useEffect(() => { 
    console.log('Updating form data images:', formData.images)
},[formData.images])
  useEffect(() => {
    if (isVisible) {
      dispatch(fetchPlans());
      dispatch(fetchChadawas()); // ✅ NEW: fetch chadawas
    }
  }, [dispatch, isVisible]);

  // ✅ FORM POPULATION - SET images FROM pujaData
  useEffect(() => {
    if (pujaData && typeof pujaData === 'object' && isVisible) {
      try {
        console.log('Setting form data from pujaData:', pujaData);
        
        let safeSelectedPlanIds: number[] = [];
        console.log('Processing plan IDs from pujaData:', { 
          selected_plan_ids: pujaData.selected_plan_ids, 
          plan_ids: pujaData.plan_ids,
          type_selected: typeof pujaData.selected_plan_ids,
          type_plan: typeof pujaData.plan_ids
        });
        
        // Handle different possible formats for plan IDs
        if (Array.isArray(pujaData.selected_plan_ids)) {
          safeSelectedPlanIds = pujaData.selected_plan_ids
            .filter((id: any) => id != null && !isNaN(Number(id)))
            .map((id: any) => Number(id));
        } else if (Array.isArray(pujaData.plan_ids)) {
          safeSelectedPlanIds = pujaData.plan_ids
            .filter((id: any) => id != null && !isNaN(Number(id)))
            .map((id: any) => Number(id));
        } else if (typeof pujaData.selected_plan_ids === 'string') {
          // Handle string format like "[7,5,6]"
          try {
            const parsed = JSON.parse(pujaData.selected_plan_ids);
            if (Array.isArray(parsed)) {
              safeSelectedPlanIds = parsed
                .filter((id: any) => id != null && !isNaN(Number(id)))
                .map((id: any) => Number(id));
            }
          } catch (e) {
            // If JSON parsing fails, try to extract numbers from string
            const matches = pujaData.selected_plan_ids.match(/\d+/g);
            if (matches) {
              safeSelectedPlanIds = matches
                .map(Number)
                .filter((id: number) => !isNaN(id));
            }
          }
        }
        
        console.log('Processed safeSelectedPlanIds:', safeSelectedPlanIds);

        // ✅ NEW: Handle chadawas (array of chadawa objects)
        let safeSelectedChadawaIds: number[] = [];
        console.log('Processing chadawas from pujaData:', { 
          chadawas: pujaData.chadawas, 
          type: typeof pujaData.chadawas 
        });
        
        if (Array.isArray(pujaData.chadawas)) {
          console.log('Found chadawas array:', pujaData.chadawas);
          // Extract IDs from chadawa objects
          safeSelectedChadawaIds = pujaData.chadawas
            .filter((chadawa: any) => {
              const isValid = chadawa && chadawa.id != null && !isNaN(Number(chadawa.id));
              console.log('Chadawa filter check:', { chadawa, isValid, id: chadawa?.id });
              return isValid;
            })
            .map((chadawa: any) => {
              const id = Number(chadawa.id);
              console.log('Extracting ID from chadawa:', { chadawa, extractedId: id });
              return id;
            });
          console.log('Extracted chadawa IDs:', safeSelectedChadawaIds);
        } else {
          console.log('No chadawas array found in pujaData');
        }

        // Handle category data - could be array or comma-separated string
        let safeCategories: string[] = ['general'];
        console.log('Processing category data:', { categories: pujaData.categories, category: pujaData.category });
        
        // Helper function to process category strings
        const processCategoryString = (catString: string): string[] => {
          // Remove any curly braces that might be present
          const cleanString = catString.replace(/[{}]/g, '');
          return cleanString
            .split(',')
            .map((cat: string) => cat.trim())
            .filter((cat: string) => cat.length > 0);
        };
        
        if (Array.isArray(pujaData.categories)) {
          safeCategories = [];
          // Join all categories and remove curly braces to handle malformed data
          let joinedCategories = pujaData.categories
            .filter((cat: any) => cat != null)
            .join(',')
            .replace(/[{}]/g, '');
          // Split by comma to get individual categories
          safeCategories = joinedCategories
            .split(',')
            .map((cat: string) => cat.trim())
            .filter((cat: string) => cat.length > 0);
        } else if (typeof pujaData.categories === 'string') {
          // Handle comma-separated string format
          safeCategories = processCategoryString(pujaData.categories);
        } else if (typeof pujaData.category === 'string') {
          // Handle single category field
          console.log('Processing category string:', pujaData.category);
          safeCategories = processCategoryString(pujaData.category);
        } else if (pujaData.category && typeof pujaData.category === 'object' && pujaData.category.hasOwnProperty('data')) {
          // Handle case where category is an object with a data property containing the string
          const categoryData = pujaData.category.data || pujaData.category;
          if (typeof categoryData === 'string') {
            safeCategories = processCategoryString(categoryData);
          }
        }
        
        // Remove duplicates
        safeCategories = Array.from(new Set(safeCategories));
        
        console.log('Processed safeCategories:', safeCategories);

        const safeBenefits = Array.isArray(pujaData.benefits) 
          ? pujaData.benefits.map((benefit: any) => ({
              title: (benefit?.benefit_title ?? '').toString().trim(),
              description: (benefit?.benefit_description ?? '').toString().trim()
            }))
          : [
              { title: '', description: '' },
              { title: '', description: '' },
              { title: '', description: '' },
              { title: '', description: '' },
            ];

        // ✅ SET EXISTING IMAGES
        let safeImages: any[] = [];
        if (Array.isArray(pujaData.images)) {
          safeImages = pujaData.images;
        } else if (Array.isArray(pujaData.puja_images)) {
          safeImages = pujaData.puja_images.map((url: string, index: number) => ({
            id: index + 1,
            image_url: url
          }));
        }

        const newFormData = {
          pujaName: (pujaData.name ?? '').toString().trim(),
          subHeading: (pujaData.sub_heading ?? '').toString().trim(),
          about: (pujaData.description ?? '').toString().trim(),
          images: safeImages, // ✅ EXISTING IMAGES
          pujaImages: [],
          templeImage: (pujaData.temple_image_url ?? '').toString().trim(),
          templeImageFile: null,
          templeImageUrl: (pujaData.temple_image_url ?? '').toString().trim(),
          templeAddress: (pujaData.temple_address ?? '').toString().trim(),
          templeDescription: (pujaData.temple_description ?? '').toString().trim(),
          benefits: safeBenefits,
          selectedPlanIds: safeSelectedPlanIds,
          selectedChadawaIds: safeSelectedChadawaIds, // ✅ NEW: chadawa IDs
          date: (pujaData.date ?? '').toString().trim(), // ✅ CHANGED: just date
          time: (pujaData.time ?? '').toString().trim(), // ✅ CHANGED: just time
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
          category: safeCategories,
          isActive: Boolean(pujaData.is_active ?? true),
          isFeatured: Boolean(pujaData.is_featured ?? false),
        };

        console.log('Prepared newFormData:', newFormData);
        setFormData(newFormData);
        setImagesChanged(false);
        
        // Ensure category is an array for the Select component
        const categoryValue = Array.isArray(newFormData.category) 
          ? newFormData.category 
          : typeof newFormData.category === 'string' 
            ? (newFormData.category as string).replace(/[{}]/g, '').split(',').map((cat: string) => cat.trim()).filter((cat: string) => cat.length > 0)
            : ['general'];
        
        console.log('Setting form fields with categoryValue:', categoryValue);
        console.log('Setting form fields with selectedPlanIds:', newFormData.selectedPlanIds);
        console.log('Setting form fields with selectedChadawaIds:', newFormData.selectedChadawaIds);
        
        // Set form fields with multiple attempts to ensure they're set
        const setFormValues = () => {
          form.setFieldsValue({
            pujaName: newFormData.pujaName,
            subHeading: newFormData.subHeading,
            about: newFormData.about,
            templeAddress: newFormData.templeAddress,
            templeDescription: newFormData.templeDescription,
            selectedPlanIds: newFormData.selectedPlanIds,
            selectedChadawaIds: newFormData.selectedChadawaIds, // ✅ NEW: chadawa IDs
            date: newFormData.date, // ✅ CHANGED: just date
            time: newFormData.time, // ✅ CHANGED: just time
            prasadPrice: newFormData.prasadPrice,
            prasadStatus: newFormData.prasadStatus,
            dakshinaPrices: newFormData.dakshinaPrices,
            dakshinaPricesUSD: newFormData.dakshinaPricesUSD,
            dakshinaStatus: newFormData.dakshinaStatus,
            manokamnaPrices: newFormData.manokamnaPrices,
            manokamnaPricesUSD: newFormData.manokamnaPricesUSD,
            manokamnaStatus: newFormData.manokamnaStatus,
            category: categoryValue,
            isActive: newFormData.isActive,
            isFeatured: newFormData.isFeatured,
            benefits: (newFormData.benefits as Array<{title: string, description: string}>).map((benefit, index) => ({
              title: benefit.title,
              description: benefit.description
            }))
          });
          
          // Also update the form data state directly to ensure UI updates
          setFormData(prev => ({
            ...prev,
            selectedChadawaIds: newFormData.selectedChadawaIds
          }));
          
          console.log('✅ Form data set successfully:', {
            planIds: newFormData.selectedPlanIds,
            chadawaIds: newFormData.selectedChadawaIds,
            imagesCount: newFormData.images?.length || 0
          });
        };
        
        // Try setting form values immediately
        setFormValues();
        
        // Also try after a small delay to handle any timing issues
        setTimeout(setFormValues, 50);
        setTimeout(setFormValues, 100);
        setTimeout(setFormValues, 200);
        
      } catch (error) {
        console.error('Error setting form data:', error);
      }
    }
  }, [pujaData, isVisible, form]);

  const { getRootProps: getPujaRootProps, getInputProps: getPujaInputProps, isDragActive } = useDropzone({
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/jpg': [],
      'image/webp': []
    },
    multiple: true,
    maxFiles: 6,
    maxSize: 10 * 1024 * 1024,
    onDrop: (acceptedFiles, rejectedFiles) => {
      try {
        if (rejectedFiles.length > 0) {
          rejectedFiles.forEach(({ file, errors }) => {
            errors.forEach(error => {
              if (error.code === 'file-too-large') {
                message.error(`File ${file.name} is too large. Maximum size is 10MB.`);
              } else if (error.code === 'file-invalid-type') {
                message.error(`File ${file.name} has invalid type. Only JPEG, PNG, WebP are allowed.`);
              } else if (error.code === 'too-many-files') {
                message.error('Cannot upload more than 6 images.');
              }
            });
          });
        }
        
        if (Array.isArray(acceptedFiles) && acceptedFiles.length > 0) {
          const validFiles = acceptedFiles.filter(file => file && file instanceof File);
          const currentImages = formData.pujaImages || [];
          const totalImages = currentImages.length + validFiles.length;
          
          if (totalImages > 6) {
            message.warning(`Cannot upload more than 6 images. You can add ${6 - currentImages.length} more images.`);
            const allowedCount = 6 - currentImages.length;
            const filesToAdd = validFiles.slice(0, allowedCount);
            handleInputChange('pujaImages', [...currentImages, ...filesToAdd]);
          } else {
            handleInputChange('pujaImages', [...currentImages, ...validFiles]);
          }
          
          setImagesChanged(true);
        }
      } catch (error) {
        console.error('Error in onDrop:', error);
        message.error('Error processing files');
      }
    },
  });

  const { getRootProps: getTempleRootProps, getInputProps: getTempleInputProps } = useDropzone({
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/jpg': [],
      'image/webp': []
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024,
    onDrop: async (acceptedFiles, rejectedFiles) => {
      try {
        if (rejectedFiles.length > 0) {
          rejectedFiles.forEach(({ file, errors }) => {
            errors.forEach(error => {
              if (error.code === 'file-too-large') {
                message.error(`File ${file.name} is too large. Maximum size is 10MB.`);
              } else if (error.code === 'file-invalid-type') {
                message.error(`File ${file.name} has invalid type. Only JPEG, PNG, WebP are allowed.`);
              }
            });
          });
        }
        
        if (Array.isArray(acceptedFiles) && acceptedFiles.length > 0 && acceptedFiles[0]) {
          const file = acceptedFiles[0];
          handleInputChange('templeImageFile', file);
          handleInputChange('templeImage', file.name);
          
          // Upload temple image immediately
          message.loading({ content: 'Uploading temple image...', key: 'templeImageUpload' });
          try {
            const uploadResult = await dispatch(uploadTempleImage(file)) as any;
            
            if (uploadTempleImage.fulfilled.match(uploadResult)) {
              const { file_url } = uploadResult.payload;
              handleInputChange('templeImageUrl', file_url);
              message.success({ content: 'Temple image uploaded successfully!', key: 'templeImageUpload' });
            } else {
              message.error({ content: 'Failed to upload temple image', key: 'templeImageUpload' });
              handleInputChange('templeImageFile', null);
              handleInputChange('templeImage', '');
            }
          } catch (error) {
            console.error('Temple image upload error:', error);
            message.error({ content: 'Error uploading temple image', key: 'templeImageUpload' });
            handleInputChange('templeImageFile', null);
            handleInputChange('templeImage', '');
          }
        }
      } catch (error) {
        console.error('Error handling temple image drop:', error);
      }
    },
  });

  // Drag and Drop sensors for image reordering
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end to reorder new images
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id && formData.pujaImages && Array.isArray(formData.pujaImages)) {
      const oldIndex = formData.pujaImages.findIndex((file, idx) => file.name + idx === active.id);
      const newIndex = formData.pujaImages.findIndex((file, idx) => file.name + idx === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedImages = arrayMove(formData.pujaImages, oldIndex, newIndex);
        handleInputChange('pujaImages', reorderedImages);
        message.success('Image order updated!');
      }
    }
  };

  const handleInputChange = (field: keyof PujaFormData, value: any) => {
    try {
      setFormData((prev) => {
        if (!prev || typeof prev !== 'object') {
          console.error('Previous form data is invalid:', prev);
          return prev;
        }
        
        let safeValue: any;
        switch (field) {
          case 'images':
          case 'pujaImages':
            safeValue = Array.isArray(value) ? value : [];
            break;
          case 'benefits':
            safeValue = Array.isArray(value) ? value : [];
            break;
          case 'selectedPlanIds':
            safeValue = Array.isArray(value) 
              ? value.filter(v => v != null).map((v: string | number) => {
                  // Handle both string and number values
                  const num = typeof v === 'string' ? parseInt(v, 10) : v;
                  return isNaN(num) ? 0 : num;
                }).filter(id => id !== 0)
              : [];
            console.log('Processed selectedPlanIds:', safeValue);
            break;
          case 'selectedChadawaIds': // ✅ NEW: handle chadawa IDs
            safeValue = Array.isArray(value) 
              ? value.filter(v => v != null).map((v: string | number) => {
                  // Handle both string and number values
                  const num = typeof v === 'string' ? parseInt(v, 10) : v;
                  return isNaN(num) ? 0 : num;
                }).filter(id => id !== 0)
              : [];
            console.log('Processed selectedChadawaIds:', safeValue);
            break;
          case 'category':
            console.log('Handling category input change:', { value, typeof: typeof value });
            // Handle both array values and comma-separated strings
            let categoryValue: string[] = [];
            if (Array.isArray(value)) {
              console.log('Category value is array:', value);
              // First, join all elements and remove curly braces to handle malformed data
              let joinedValue = value.join(',').replace(/[{}]/g, '');
              // Then split by comma to get individual categories
              categoryValue = joinedValue
                .split(',')
                .map((v: string) => v.trim())
                .filter((v: string) => v.length > 0);
              // Remove duplicates
              categoryValue = Array.from(new Set(categoryValue));
            } else if (typeof value === 'string') {
              console.log('Category value is string:', value);
              // If it's a comma-separated string, split it
              let cleanValue = value.replace(/[{}]/g, '');
              categoryValue = cleanValue
                .split(',')
                .map((v: string) => v.trim())
                .filter((v: string) => v.length > 0);
            } else {
              console.log('Category value is other:', value);
              categoryValue = ['general'];
            }
            safeValue = categoryValue;
            console.log('Processed category safeValue:', safeValue);
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
      const safeIndex = Math.max(0, Math.min(index, 3));
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

  // ✅ PERFECT: UPDATE formData.images ONLY!
  const handleDeleteExistingImage = async (imageId: number) => {
    try {
      console.log(`🗑️ Deleting image ${imageId} from SERVER`);
      const result = await dispatch(deletePujaImage({ pujaId: safePujaId, imageId }));
      
      if (deletePujaImage.fulfilled.match(result)) {
        console.log("check hii")
        console.log(`✅ Image ${imageId} DELETED FROM SERVER`);
        
        setFormData((prev) => {
          if (prev.images && Array.isArray(prev.images)) {
            const updatedImages = prev.images.filter((image: any) => image.id !== imageId);
            console.log(`✅ formData.images updated: ${updatedImages} IMAGES LEFT`,updatedImages);
            return { ...prev, images: updatedImages };
          }
          return prev;
        });
      }
    } catch (error) {
      console.error(`❌ Error deleting image ${imageId}:`, error);
    }
  };

  const createImagePreviewUrl = (file: File): string => {
    return URL.createObjectURL(file);
  };

  const revokeImagePreviewUrl = (url: string): void => {
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    return () => {
      if (formData.pujaImages && Array.isArray(formData.pujaImages)) {
        formData.pujaImages.forEach(file => {
          if (file instanceof File) {
            try {
              revokeImagePreviewUrl(URL.createObjectURL(file));
            } catch (e) {}
          }
        });
      }
    };
  }, [formData.pujaImages]);

  const handleSubmit = async () => {
    console.log("UpdatePujaModal - handleSubmit called");
    
    try {
      if (!safePujaId) {
        console.error('Puja ID is required');
        return;
      }
      
      const benefitsToUpdate = (formData.benefits ?? [])
        .filter(benefit => 
          (benefit?.title ?? '').trim() !== '' && 
          (benefit?.description ?? '').trim() !== ''
        )
        .map(benefit => ({
          benefit_title: (benefit?.title ?? '').trim(),
          benefit_description: (benefit?.description ?? '').trim()
        }));

      // Send category as array directly, like in createPuja
      console.log('Formatting category for API. Current formData.category:', formData.category);
      const categoryArray = Array.isArray(formData.category) 
        ? formData.category 
        : (formData.category ?? 'general').toString().split(',').map((cat: string) => cat.trim()).filter((cat: string) => cat.length > 0);
      console.log('Formatted categoryArray for API:', categoryArray);
      
      const requestData = {
        name: (formData.pujaName ?? '').trim(),
        sub_heading: (formData.subHeading ?? '').trim(),
        description: (formData.about ?? '').trim(),
        date: formData.date || null, // ✅ CHANGED: just date
        time: formData.time || null, // ✅ CHANGED: just time
        temple_image_url: formData.templeImageUrl || (formData.templeImage ?? '').trim(),
        temple_address: (formData.templeAddress ?? '').trim(),
        temple_description: (formData.templeDescription ?? '').trim(),
        benefits: benefitsToUpdate,
        prasad_price: Number(formData.prasadPrice ?? 0),
        is_prasad_active: Boolean(formData.prasadStatus ?? false),
        dakshina_prices_inr: (formData.dakshinaPrices ?? '').trim(),
        dakshina_prices_usd: (formData.dakshinaPricesUSD ?? '').trim(),
        is_dakshina_active: Boolean(formData.dakshinaStatus ?? false),
        manokamna_prices_inr: (formData.manokamnaPrices ?? '').trim(),
        manokamna_prices_usd: (formData.manokamnaPricesUSD ?? '').trim(),
        is_manokamna_active: Boolean(formData.manokamnaStatus ?? false),
        category: categoryArray,
        plan_ids: formData.selectedPlanIds ?? [], // ✅ Changed from selected_plan_ids to plan_ids
        chadawa_ids: formData.selectedChadawaIds ?? [], // ✅ NEW: chadawa IDs
        is_active: Boolean(formData.isActive ?? true),
        is_featured: Boolean(formData.isFeatured ?? false),
      };
      
      console.log("✅ Calling updatePuja with:", requestData);
      
      const updateResult = await dispatch(updatePuja({ id: safePujaId, ...requestData }));
      
      if (updatePuja.fulfilled.match(updateResult)) {
        // ✅ NEW: If new images are being uploaded, delete all old images first
        if (imagesChanged && 
            Array.isArray(formData.pujaImages) && 
            formData.pujaImages.length > 0) {
          
          // Delete all existing images before uploading new ones
          if (formData.images && Array.isArray(formData.images) && formData.images.length > 0) {
            console.log(`🗑️ Deleting ${formData.images.length} existing images before uploading new ones...`);
            
            for (const image of formData.images) {
              if (image && image.id) {
                try {
                  const deleteResult = await dispatch(deletePujaImage({ 
                    pujaId: safePujaId, 
                    imageId: image.id 
                  }));
                  
                  if (deletePujaImage.fulfilled.match(deleteResult)) {
                    console.log(`✅ Deleted image ${image.id}`);
                  } else {
                    console.error(`❌ Failed to delete image ${image.id}`);
                  }
                } catch (error) {
                  console.error(`❌ Error deleting image ${image.id}:`, error);
                }
              }
            }
            
            message.success('Previous images deleted successfully');
          }
          
          // Upload new images
          const validImages = formData.pujaImages.filter(img => img instanceof File);
          if (validImages.length > 0) {
            console.log(`📤 Uploading ${validImages.length} new images...`);
            const uploadResult = await dispatch(uploadPujaImages({
              pujaId: safePujaId,
              images: validImages
            }));
            
            if (uploadPujaImages.fulfilled.match(uploadResult)) {
              message.success('New images uploaded successfully!');
            }
          }
        }
      }
      
      safeOnSuccess();
      safeOnCancel();
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
          <span className="text-2xl">🛕</span>
          <span className="  text-xl">Update Puja</span>
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
            <h3 className="text-lg font-semibold text-orange-800 mb-4   flex items-center gap-2">
              <span className="text-2xl">🛕</span>
              1. Puja Details
            </h3>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="pujaName" label={<span className="block text-sm font-medium text-gray-700 mb-2">Puja Name</span>} required={true}>
                  <Input
                    value={(formData.pujaName ?? '').toString()}
                    onChange={(e) => handleInputChange('pujaName', e?.target?.value ?? '')}
                    placeholder="Enter puja name"
                    className="w-full px-4 py-3 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-black placeholder-gray-400"
                  />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item name="subHeading" label={<span className="block text-sm font-medium text-gray-700 mb-2">Sub Heading</span>} required={true}>
                  <Input
                    value={(formData.subHeading ?? '').toString()}
                    onChange={(e) => handleInputChange('subHeading', e?.target?.value ?? '')}
                    placeholder="Enter puja sub heading"
                    className="w-full px-4 py-3 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-black placeholder-gray-400"
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* ✅ CHANGED: Date and Time Fields */}
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="date" label={<span className="block text-sm font-medium text-gray-700 mb-2">Puja Date</span>}>
                  <Input
                    type="date"
                    value={(formData.date ?? '').toString()}
                    onChange={(e) => handleInputChange('date', e?.target?.value ?? '')}
                    className="w-full px-4 py-3 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-black"
                  />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item name="time" label={<span className="block text-sm font-medium text-gray-700 mb-2">Puja Time</span>}>
                  <Input
                    type="time"
                    value={(formData.time ?? '').toString()}
                    onChange={(e) => handleInputChange('time', e?.target?.value ?? '')}
                    className="w-full px-4 py-3 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-black"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="about" label={<span className="block text-sm font-medium text-gray-700 mb-2">About Puja</span>}>
              <Input.TextArea
                value={(formData.about ?? '').toString()}
                onChange={(e) => handleInputChange('about', e?.target?.value ?? '')}
                rows={4}
                placeholder="Enter detailed description about the puja"
                className="w-full px-4 py-3 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-black placeholder-gray-400"
              />
            </Form.Item>

            {/* IMAGES SECTION */}
            <Form.Item name="pujaImages" label={<span className="block text-sm font-medium text-gray-700 mb-2">Puja Images (Max 6)</span>}>
              <div {...getPujaRootProps()} className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200 border-orange-300 bg-orange-50 hover:bg-orange-100">
                <input {...getPujaInputProps()} />
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg className="w-8 h-8 mb-2 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="mb-1 text-sm text-orange-600 font-medium">
                    {isDragActive ? 'Drop images here...' : 'Click or drag to upload Puja Images'}
                  </p>
                  <p className="text-xs text-orange-500">PNG, JPG, JPEG, WebP up to 10MB (max 6 images)</p>
                </div>
              </div>
              
              {/* New Images Preview */}
              {formData.pujaImages && Array.isArray(formData.pujaImages) && formData.pujaImages.length > 0 && (
                <div className="mt-4">
                  {/* Warning Banner */}
                  <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p className="text-sm font-bold text-red-800">All previous images will be deleted</p>
                        <p className="text-xs text-red-600 mt-1">When you save, all current images will be permanently removed and replaced with the new images below.</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-700">New Images to Upload (Drag to Reorder):</h4>
                    <div className="text-xs text-gray-500 bg-blue-50 px-3 py-1 rounded-full">
                      💡 Drag images to change upload order
                    </div>
                  </div>
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={formData.pujaImages.map((file, idx) => file.name + idx)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {formData.pujaImages.map((file, index) => (
                          <SortableImageItem
                            key={file.name + index}
                            file={file}
                            index={index}
                            onRemove={() => {
                              const updatedImages = formData.pujaImages!.filter((_, i) => i !== index);
                              handleInputChange('pujaImages', updatedImages);
                              if (updatedImages.length === 0) {
                                setImagesChanged(false);
                              }
                            }}
                            createImagePreviewUrl={createImagePreviewUrl}
                            revokeImagePreviewUrl={revokeImagePreviewUrl}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                </div>
              )}
              
              {/* EXISTING IMAGES FROM formData.images */}
              {formData.images && Array.isArray(formData.images) && formData.images.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="text-sm font-medium text-blue-700 mb-2">Current Images ({formData.images.length}):</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {formData.images.map((image: any, index: number) => (
                      <div key={image.id || index} className="relative bg-white p-2 rounded border border-blue-200">
                        {image.image_url ? (
                          <div className="relative w-full h-16 rounded overflow-hidden">
                            <img 
                              src={`https://api.33kotidham.in/${image.image_url}`} 
                              alt={`Current image ${index + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                if (e.currentTarget.parentElement) {
                                  e.currentTarget.parentElement.innerHTML = '<div class="w-full h-full bg-blue-100 flex items-center justify-center"><svg class="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" /></svg></div>';
                                }
                              }}
                            />
                            {/* <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`Delete this image?`)) {
                                  handleDeleteExistingImage(image.id);
                                }
                              }}
                              className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold hover:bg-red-600 transition-colors"
                              title="Delete Image"
                            >
                              ✕
                            </button> */}
                          </div>
                        ) : (
                          <div className="flex items-center justify-center w-full h-16 bg-blue-100 rounded">
                            <span className="text-xs text-blue-600">Image {index + 1}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className={`text-xs mt-2 font-medium ${imagesChanged ? 'text-red-600' : 'text-blue-600'}`}>
                    {imagesChanged ? '⚠️ These images will be deleted and replaced with new images when saved' : 'Upload new images above to replace these'}
                  </p>
                </div>
              )}
            </Form.Item>
          </div>

          {/* ✅ ALL OTHER SECTIONS SAME - COPY FROM PREVIOUS */}
          {/* Section 2: Temple Details */}
          <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 p-6 rounded-xl border border-indigo-200 mb-6">
            <h3 className="text-lg font-semibold text-indigo-800 mb-4   flex items-center gap-2">
              <span className="text-2xl">🏦</span>
              2. Temple Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Form.Item name="templeImage" label={<span className="block text-sm font-medium text-gray-700 mb-2">Temple Image</span>}>
                <div {...getTempleRootProps()} className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-indigo-50 hover:bg-indigo-100 transition-colors duration-200 border-indigo-300">
                  <input {...getTempleInputProps()} />
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-8 h-8 mb-2 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="mb-1 text-sm text-indigo-600 font-medium">
                      {(formData.templeImage && formData.templeImage.toString().trim()) 
                        ? `Selected: ${formData.templeImage}` 
                        : 'Click or drag to upload Temple Image'}
                    </p>
                    <p className="text-xs text-indigo-500">PNG, JPG, JPEG, WebP up to 10MB</p>
                  </div>
                </div>
                
                {formData.templeImage && formData.templeImage.toString().trim() && (
                  <div className="mt-4 space-y-3">
                    {/* Image Preview */}
                    <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden border-2 border-indigo-200">
                      {formData.templeImageFile ? (
                        <img
                          src={createImagePreviewUrl(formData.templeImageFile)}
                          alt="Temple preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : formData.templeImageUrl ? (
                        <img
                          src={`https://api.33kotidham.in/${formData.templeImageUrl}`}
                          alt="Temple preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : null}
                    </div>
                    
                    {/* File Info */}
                    <div className="bg-white p-3 rounded-lg border border-indigo-200">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm text-gray-600 truncate flex-1">{formData.templeImage}</span>
                        {formData.templeImageUrl && (
                          <span className="text-xs text-green-600 font-medium">✓ Uploaded</span>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            handleInputChange('templeImage', '');
                            handleInputChange('templeImageFile', null);
                            handleInputChange('templeImageUrl', '');
                          }}
                          className="text-red-500 hover:text-red-700 text-sm font-medium"
                        >
                          ✕
                        </button>
                      </div>
                      {formData.templeImageUrl && (
                        <div className="mt-2 text-xs text-gray-500 truncate">
                          URL: {formData.templeImageUrl}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Form.Item>

              <Form.Item name="templeAddress" label={<span className="block text-sm font-medium text-gray-700 mb-2">Temple Address</span>}>
                <Input
                  value={(formData.templeAddress ?? '').toString()}
                  onChange={(e) => handleInputChange('templeAddress', e?.target?.value ?? '')}
                  placeholder="Enter complete temple address"
                  className="w-full px-4 py-3 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-black placeholder-gray-400"
                />
              </Form.Item>
            </div>

            <Form.Item name="templeDescription" label={<span className="block text-sm font-medium text-gray-700 mb-2">Temple Description</span>}>
              <Input.TextArea
                value={(formData.templeDescription ?? '').toString()}
                onChange={(e) => handleInputChange('templeDescription', e?.target?.value ?? '')}
                rows={4}
                placeholder="Enter temple description, history, and significance"
                className="w-full px-4 py-3 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-black placeholder-gray-400"
              />
            </Form.Item>
          </div>

          {/* Sections 3-8: SAME AS BEFORE - COPY FROM PREVIOUS FULL CODE */}
          {/* ... (Benefits, Plans, Prasad, Dakshina, Manokamna, Settings) ... */}
          
          {/* Section 3: Puja Benefits */}
          <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-xl border border-green-200 mb-6">
            <h3 className="text-lg font-semibold text-green-800 mb-4   flex items-center gap-2">
              <span className="text-2xl">✨</span>
              3. Puja Benefits
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(formData.benefits && Array.isArray(formData.benefits) ? formData.benefits : []).map((benefit, index) => {
                const safeBenefit = benefit && typeof benefit === 'object' ? benefit : { title: '', description: '' };
                return (
                <div key={index} className="bg-white p-4 rounded-lg border border-green-200">
                  <h4 className="font-medium text-green-700 mb-3">Benefit {index + 1}</h4>
                  <Form.Item name={['benefits', index, 'title']} label={<span className="block text-sm font-medium text-gray-700 mb-2">Title</span>}>
                    <Input
                      value={(safeBenefit?.title ?? '').toString()}
                      onChange={(e) => handleBenefitChange(index, 'title', e?.target?.value ?? '')}
                      placeholder={`Enter benefit ${index + 1} title`}
                      className="w-full px-4 py-3 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black placeholder-gray-400"
                    />
                  </Form.Item>

                  <Form.Item name={['benefits', index, 'description']} label={<span className="block text-sm font-medium text-gray-700 mb-2">Description</span>}>
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
            <h3 className="text-lg font-semibold text-purple-800 mb-4   flex items-center gap-2">
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
                onChange={(value) => {
                  console.log('Plan selection changed:', value);
                  handleInputChange('selectedPlanIds', value ?? []);
                }}
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
                  plans.map((plan: any) => (
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

          {/* Section 5: Prasad */}
          {/* <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-6 rounded-xl border border-yellow-200 mb-6">
            <h3 className="text-lg font-semibold text-yellow-800 mb-4   flex items-center gap-2">
              <span className="text-2xl">🍯</span>
              5. Prasad
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <Form.Item name="prasadPrice" label={<span className="block text-sm font-medium text-gray-700 mb-2">Prasad Price (₹)</span>}>
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
          </div> */}

          {/* Section 6: Dakshina */}
          {/* <div className="bg-gradient-to-r from-red-50 to-red-100 p-6 rounded-xl border border-red-200 mb-6">
            <h3 className="text-lg font-semibold text-red-800 mb-4   flex items-center gap-2">
              <span className="text-2xl">💰</span>
              6. Dakshina
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              <Form.Item name="dakshinaPrices" label={<span className="block text-sm font-medium text-gray-700 mb-2">Dakshina Prices (₹)</span>}>
                <Input
                  value={(formData.dakshinaPrices ?? '').toString()}
                  onChange={(e) => handleInputChange('dakshinaPrices', e?.target?.value ?? '')}
                  placeholder="e.g., 101,201,310,500"
                  className="w-full px-4 py-3 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-black placeholder-gray-400"
                />
                <Text className="text-xs text-gray-500 mt-1">Enter comma-separated values for multiple price options</Text>
              </Form.Item>
              <Form.Item name="dakshinaPricesUSD" label={<span className="block text-sm font-medium text-gray-700 mb-2">Dakshina Prices (USD)</span>}>
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
          </div> */}

          {/* Section 7: Manokamna Parchi */}
          {/* <div className="bg-gradient-to-r from-pink-50 to-pink-100 p-6 rounded-xl border border-pink-200 mb-6">
            <h3 className="text-lg font-semibold text-pink-800 mb-4   flex items-center gap-2">
              <span className="text-2xl">📜</span>
              7. Manokamna Parchi
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              <Form.Item name="manokamnaPrices" label={<span className="block text-sm font-medium text-gray-700 mb-2">Manokamna Prices (₹)</span>}>
                <Input
                  value={(formData.manokamnaPrices ?? '').toString()}
                  onChange={(e) => handleInputChange('manokamnaPrices', e?.target?.value ?? '')}
                  placeholder="e.g., 51,101,151,251"
                  className="w-full px-4 py-3 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-black placeholder-gray-400"
                />
                <Text className="text-xs text-gray-500 mt-1">Enter comma-separated values for multiple price options</Text>
              </Form.Item>
              <Form.Item name="manokamnaPricesUSD" label={<span className="block text-sm font-medium text-gray-700 mb-2">Manokamna Prices (USD)</span>}>
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
                  Manokamna Parchi allows devotees to write their wishes and prayers. No automatic conversion - you can manually set both INR and USD prices
                </span>
              </Text>
            </div>
          </div> */}

          {/* ✅ NEW: Section for Chadawa Selection */}
          <div className="bg-gradient-to-r from-teal-50 to-teal-100 p-6 rounded-xl border border-teal-200 mb-6">
            <h3 className="text-lg font-semibold text-teal-800 mb-4   flex items-center gap-2">
              <span className="text-2xl">📿</span>
              Chadawa Selection
            </h3>

            <Form.Item
              name="selectedChadawaIds"
              label={<span className="block text-sm font-medium text-gray-700 mb-2">Select Chadawas (Multiple Selection)</span>}
            >
              <Select
                mode="multiple"
                value={formData.selectedChadawaIds || []}
                onChange={(value) => {
                  handleInputChange('selectedChadawaIds', value ?? []);
                }}
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
                  chadawas.map((chadawa: any) => (
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

          {/* Section 8: General Settings */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4   flex items-center gap-2">
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
                  value={Array.isArray(formData.category) ? formData.category : ['general']}
                  onChange={(value) => handleInputChange('category', Array.isArray(value) ? value : ['general'])}
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