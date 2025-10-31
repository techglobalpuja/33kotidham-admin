'use client';

import React, { useEffect } from 'react';
import { Modal, Typography } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { fetchPlans } from '@/store/slices/planSlice';
import { fetchChadawas } from '@/store/slices/chadawaSlice';
import { AppDispatch } from '@/store';

const { Text } = Typography;

interface Benefit {
  id?: number;
  benefit_title?: string | null;
  benefit_description?: string | null;
  title?: string | null;
  description?: string | null;
}

interface Image {
  id: number;
  image_url: string;
}

interface PlanReference {
  id: number;
  name: string;
  description?: string;
  price?: string;
}

interface ChadawaReference {
  id: number;
  name: string;
  description?: string;
  image_url?: string;
  price?: string;
  requires_note?: boolean;
}

interface PujaData {
  id?: string | null;
  name?: string | null;
  sub_heading?: string | null;
  description?: string | null;
  temple_image_url?: string | null;
  temple_address?: string | null;
  temple_description?: string | null;
  benefits?: Benefit[] | null;
  prasad_price?: number | string | null;
  is_prasad_active?: boolean | null;
  dakshina_prices_inr?: string | null;
  dakshina_prices_usd?: string | null;
  is_dakshina_active?: boolean | null;
  manokamna_prices_inr?: string | null;
  manokamna_prices_usd?: string | null;
  is_manokamna_active?: boolean | null;
  category?: string | null;
  is_active?: boolean | null;
  is_featured?: boolean | null;
  puja_images?: string[] | null;
  images?: Image[] | null;
  plan_ids?: number[] | null; // Updated to match API response
  chadawas?: ChadawaReference[] | null; // Updated to match API response
  date?: string | null;
  time?: string | null;
}

interface ViewPujaModalProps {
  puja?: PujaData | null;
  visible?: boolean;
  onCancel?: () => void;
}

const ViewPujaModal: React.FC<ViewPujaModalProps> = ({ 
  puja, 
  visible, 
  onCancel
}) => {
  const dispatch = useDispatch<AppDispatch>();
  
  // Enhanced safety checks and handlers
  const isVisible = Boolean(visible ?? false);
  const safeOnCancel = onCancel ?? (() => {});
  
  // ✅ NEW: Access plan and chadawa data from Redux store
  const { plans } = useSelector((state: RootState) => state.plan);
  const { chadawas } = useSelector((state: RootState) => state.chadawa);

  // Fetch plans and chadawas when the modal is opened
  useEffect(() => {
    if (isVisible) {
      dispatch(fetchPlans());
      dispatch(fetchChadawas());
    }
  }, [dispatch, isVisible]);

  // Early return with comprehensive null checks
  if (!isVisible || !puja || typeof puja !== 'object') {
    return null;
  }

  // Safe data extraction with fallbacks using puja prop directly
  const safeData = {
    id: (puja.id ?? '').toString().trim() || 'N/A',
    name: (puja.name ?? '').toString().trim() || 'Unnamed Puja',
    sub_heading: (puja.sub_heading ?? '').toString().trim() || 'N/A',
    description: (puja.description ?? '').toString().trim() || 'No description available',
    temple_image_url: (puja.temple_image_url ?? '').toString().trim() || 'N/A',
    temple_address: (puja.temple_address ?? '').toString().trim() || 'No address provided',
    temple_description: (puja.temple_description ?? '').toString().trim() || 'No temple description available',
    benefits: Array.isArray(puja.benefits) ? puja.benefits : [],
    prasad_price: (() => {
      const price = puja.prasad_price;
      if (price === null || price === undefined) return 0;
      const numPrice = Number(price);
      return isNaN(numPrice) ? 0 : Math.max(0, numPrice);
    })(),
    is_prasad_active: Boolean(puja.is_prasad_active ?? false),
    dakshina_prices_inr: (puja.dakshina_prices_inr ?? '').toString().trim() || 'N/A',
    dakshina_prices_usd: (puja.dakshina_prices_usd ?? '').toString().trim() || 'N/A',
    is_dakshina_active: Boolean(puja.is_dakshina_active ?? false),
    manokamna_prices_inr: (puja.manokamna_prices_inr ?? '').toString().trim() || 'N/A',
    manokamna_prices_usd: (puja.manokamna_prices_usd ?? '').toString().trim() || 'N/A',
    is_manokamna_active: Boolean(puja.is_manokamna_active ?? false),
    category: (puja.category ?? 'general').toString().trim(),
    is_active: Boolean(puja.is_active ?? true),
    is_featured: Boolean(puja.is_featured ?? false),
    puja_images: Array.isArray(puja.puja_images) ? puja.puja_images : [],
    images: Array.isArray(puja.images) ? puja.images : [],
    plan_ids: Array.isArray(puja.plan_ids) ? puja.plan_ids : [], // Updated to match API response
    chadawas: Array.isArray(puja.chadawas) ? puja.chadawas : [], // Updated to match API response
    date: (puja.date ?? '').toString().trim() || 'N/A',
    time: (puja.time ?? '').toString().trim() || 'N/A',
  };

  // Format price safely
  const formatPrice = (price: number) => {
    try {
      return new Intl.NumberFormat('hi-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
      }).format(price);
    } catch (error) {
      return `₹${price}`;
    }
  };

  // ✅ NEW: Function to get plan names by IDs
  const getPlanNames = (planIds: number[]) => {
    if (!Array.isArray(planIds) || planIds.length === 0) return 'None selected';
    
    // Get plan names from Redux store
    return planIds
      .map(id => {
        const plan = plans?.find(p => p.id === id);
        return plan ? plan.name : `Unknown Plan (${id})`;
      })
      .join(', ');
  };

  // ✅ NEW: Function to get chadawa names from chadawa objects
  const getChadawaNames = (chadawas: ChadawaReference[]) => {
    if (!Array.isArray(chadawas) || chadawas.length === 0) return 'None selected';
    
    return chadawas
      .map(chadawa => chadawa.name || `Unknown Chadawa (${chadawa.id})`)
      .join(', ');
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <span className="text-2xl">🛕</span>
          <span className="  text-xl">View Puja Details</span>
        </div>
      }
      open={visible}
      onCancel={safeOnCancel}
      footer={null}
      width={1000}
      style={{ top: 20 }}
      className="admin-puja-view-modal"
    >
      <div className="max-h-[75vh] overflow-y-auto pr-2">
        {/* Puja Header Info */}
        <div className="bg-white p-4 rounded-lg mb-6 border border-orange-200 shadow-sm">
          <h4 className="font-medium text-orange-800 text-lg  ">
            Puja: {safeData.name}
          </h4>
          <p className="text-sm text-orange-600">ID: {safeData.id}</p>
        </div>

        {/* Section 1: Puja Details */}
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200 mb-6">
          <h3 className="text-lg font-semibold text-orange-800 mb-4   flex items-center gap-2">
            <span className="text-2xl">🛕</span>
            1. Puja Details
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Puja Name</label>
              <div className="w-full px-4 py-3 bg-orange-50 border border-orange-200 rounded-lg text-black">
                {safeData.name}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sub Heading</label>
              <div className="w-full px-4 py-3 bg-orange-50 border border-orange-200 rounded-lg text-black">
                {safeData.sub_heading}
              </div>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <div className="w-full px-4 py-3 bg-orange-50 border border-orange-200 rounded-lg text-black min-h-24">
                {safeData.description}
              </div>
            </div>
            
            {/* ✅ NEW: Date and Time Fields */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Puja Date</label>
              <div className="w-full px-4 py-3 bg-orange-50 border border-orange-200 rounded-lg text-black">
                {safeData.date}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Puja Time</label>
              <div className="w-full px-4 py-3 bg-orange-50 border border-orange-200 rounded-lg text-black">
                {safeData.time}
              </div>
            </div>
            
            {/* Puja Images Preview */}
            {safeData.images && safeData.images.length > 0 && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Puja Images</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-2">
                  {safeData.images.map((image: Image, index: number) => (
                    <div key={image.id} className="relative group">
                      <div className="aspect-square bg-orange-100 rounded-lg flex items-center justify-center overflow-hidden border border-orange-200">
                        {image.image_url ? (
                          <img 
                            src={`https://api.33kotidham.in/${image.image_url}`} 
                            alt={`Puja image ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              if (e.currentTarget.parentElement) {
                                e.currentTarget.parentElement.innerHTML = '<span class="text-orange-600 text-2xl">🛕</span>';
                              }
                            }}
                          />
                        ) : (
                          <span className="text-orange-400 text-xl">?</span>
                        )}
                      </div>
                      <div className="absolute bottom-1 right-1 bg-black bg-opacity-60 text-white text-xs px-1 py-0.5 rounded">
                        #{index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Temple Details */}
        <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 p-6 rounded-xl border border-indigo-200 mb-6">
          <h3 className="text-lg font-semibold text-indigo-800 mb-4   flex items-center gap-2">
            <span className="text-2xl">🏦</span>
            2. Temple Details
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Temple Image Preview */}
            {safeData.temple_image_url && safeData.temple_image_url !== 'N/A' && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Temple Image</label>
                <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden border-2 border-indigo-200">
                  <img
                    src={`https://api.33kotidham.in/${safeData.temple_image_url}`}
                    alt="Temple"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      if (e.currentTarget.parentElement) {
                        e.currentTarget.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-indigo-100"><span class="text-indigo-400 text-4xl">🏦</span></div>';
                      }
                    }}
                  />
                </div>
                <div className="mt-2 text-xs text-gray-500 break-words bg-indigo-50 p-2 rounded border border-indigo-200">
                  URL: {safeData.temple_image_url}
                </div>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Temple Address</label>
              <div className="w-full px-4 py-3 bg-indigo-50 border border-indigo-200 rounded-lg text-black">
                {safeData.temple_address}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Temple Description</label>
              <div className="w-full px-4 py-3 bg-indigo-50 border border-indigo-200 rounded-lg text-black min-h-24">
                {safeData.temple_description}
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Puja Benefits */}
        <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-xl border border-green-200 mb-6">
          <h3 className="text-lg font-semibold text-green-800 mb-4   flex items-center gap-2">
            <span className="text-2xl">✨</span>
            3. Puja Benefits
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {safeData.benefits && safeData.benefits.length === 0 ? (
              <div className="md:col-span-2 text-center py-8">
                <div className="text-gray-400 text-4xl mb-2">✨</div>
                <p className="text-gray-500">No benefits information available</p>
              </div>
            ) : (
              safeData.benefits?.map((benefit: Benefit, index: number) => {
                if (!benefit || typeof benefit !== 'object') {
                  return null;
                }
                
                const safeBenefit = {
                  title: (benefit.benefit_title ?? benefit.title ?? '').toString().trim() || 'N/A',
                  description: (benefit.benefit_description ?? benefit.description ?? '').toString().trim() || 'No description available'
                };
                
                return (
                  <div key={index} className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h4 className="font-medium text-green-800 mb-3">Benefit {index + 1}</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Title</label>
                        <div className="w-full px-3 py-2 bg-green-100 border border-green-200 rounded-lg text-sm">
                          {safeBenefit.title}
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                        <div className="w-full px-3 py-2 bg-green-100 border border-green-200 rounded-lg text-sm min-h-16">
                          {safeBenefit.description}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }).filter(Boolean)
            )}
          </div>
        </div>

        {/* Section 4: Prasad */}
        {/* <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-6 rounded-xl border border-yellow-200 mb-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-4   flex items-center gap-2">
            <span className="text-2xl">🍯</span>
            4. Prasad
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prasad Price (₹)</label>
              <div className="w-full px-4 py-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                {formatPrice(safeData.prasad_price)}
              </div>
            </div>
            
            <div className="flex items-center pt-6">
              <div className={`h-5 w-5 rounded-full ${safeData.is_prasad_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <label className="ml-2 block text-sm text-gray-700">
                {safeData.is_prasad_active ? 'Active' : 'Inactive'}
              </label>
            </div>
          </div>
        </div> */}

        {/* Section 5: Dakshina */}
        {/* <div className="bg-gradient-to-r from-red-50 to-red-100 p-6 rounded-xl border border-red-200 mb-6">
          <h3 className="text-lg font-semibold text-red-800 mb-4   flex items-center gap-2">
            <span className="text-2xl">💰</span>
            5. Dakshina
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dakshina Prices (₹)</label>
              <div className="w-full px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
                {safeData.dakshina_prices_inr}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dakshina Prices (USD)</label>
              <div className="w-full px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
                {safeData.dakshina_prices_usd}
              </div>
            </div>
            
            <div className="flex items-center pt-6">
              <div className={`h-5 w-5 rounded-full ${safeData.is_dakshina_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <label className="ml-2 block text-sm text-gray-700">
                {safeData.is_dakshina_active ? 'Active' : 'Inactive'}
              </label>
            </div>
          </div>
        </div> */}

        {/* Section 6: Manokamna Parchi */}
        {/* <div className="bg-gradient-to-r from-pink-50 to-pink-100 p-6 rounded-xl border border-pink-200 mb-6">
          <h3 className="text-lg font-semibold text-pink-800 mb-4   flex items-center gap-2">
            <span className="text-2xl">📜</span>
            6. Manokamna Parchi
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Manokamna Prices (₹)</label>
              <div className="w-full px-4 py-3 bg-pink-50 border border-pink-200 rounded-lg">
                {safeData.manokamna_prices_inr}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Manokamna Prices (USD)</label>
              <div className="w-full px-4 py-3 bg-pink-50 border border-pink-200 rounded-lg">
                {safeData.manokamna_prices_usd}
              </div>
            </div>
            
            <div className="flex items-center pt-6">
              <div className={`h-5 w-5 rounded-full ${safeData.is_manokamna_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <label className="ml-2 block text-sm text-gray-700">
                {safeData.is_manokamna_active ? 'Active' : 'Inactive'}
              </label>
            </div>
          </div>
        </div> */}

        {/* ✅ NEW: Section for Plan and Chadawa Information */}
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200 mb-6">
          <h3 className="text-lg font-semibold text-purple-800 mb-4   flex items-center gap-2">
            <span className="text-2xl">📋</span>
            Associated Plans & Chadawas
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Selected Plans</label>
              <div className="w-full px-4 py-3 bg-purple-50 border border-purple-200 rounded-lg text-black min-h-12">
                {getPlanNames(safeData.plan_ids)}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Selected Chadawas</label>
              <div className="w-full px-4 py-3 bg-purple-50 border border-purple-200 rounded-lg text-black min-h-12">
                {getChadawaNames(safeData.chadawas)}
              </div>
            </div>
          </div>
        </div>

        {/* Section 7: General Settings */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4   flex items-center gap-2">
            <span className="text-2xl">⚙️</span>
            7. General Settings
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg capitalize">
                {safeData.category}
              </div>
            </div>
            
            <div className="flex items-center pt-6">
              <div className={`h-5 w-5 rounded-full ${safeData.is_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <label className="ml-2 block text-sm text-gray-700">
                {safeData.is_active ? 'Active' : 'Inactive'}
              </label>
            </div>
            
            <div className="flex items-center pt-6">
              <div className={`h-5 w-5 rounded-full ${safeData.is_featured ? 'bg-yellow-500' : 'bg-gray-400'}`}></div>
              <label className="ml-2 block text-sm text-gray-700">
                {safeData.is_featured ? 'Featured' : 'Not Featured'}
              </label>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ViewPujaModal;