'use client';

import React from 'react';
import { Modal, Typography, Tag, Divider } from 'antd';
import { Temple } from '@/types';

const { Text, Title } = Typography;

interface ViewTempleModalProps {
  temple: Temple | null;
  visible: boolean;
  onCancel: () => void;
}

const ViewTempleModal: React.FC<ViewTempleModalProps> = ({ 
  temple, 
  visible, 
  onCancel
}) => {
  const isVisible = Boolean(visible ?? false);
  const safeOnCancel = onCancel ?? (() => {});
  
  // Early return with comprehensive null checks
  if (!isVisible || !temple || typeof temple !== 'object') {
    return null;
  }

  // Safe data extraction with fallbacks
  const safeData = {
    id: temple.id ?? 0,
    name: (temple.name ?? '').toString().trim() || 'Unnamed Temple',
    description: (temple.description ?? '').toString().trim() || 'No description available',
    image_url: (temple.image_url ?? '').toString().trim() || '',
    location: (temple.location ?? '').toString().trim() || 'Location not specified',
    slug: (temple.slug ?? '').toString().trim() || 'N/A',
    created_at: temple.created_at ?? '',
    updated_at: temple.updated_at ?? '',
    recommended_pujas: Array.isArray(temple.recommended_pujas) ? temple.recommended_pujas : [],
    chadawas: Array.isArray(temple.chadawas) ? temple.chadawas : [],
  };

  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'N/A';
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <span className="text-2xl">🛕</span>
          <span>Temple Details</span>
        </div>
      }
      open={isVisible}
      onCancel={safeOnCancel}
      footer={null}
      width={800}
      centered
    >
      <div className="space-y-6 max-h-[70vh] overflow-y-auto">
        {/* Temple Image */}
        {safeData.image_url && (
          <div className="flex justify-center bg-gray-50 rounded-lg p-4">
            <img
              src={`https://api.33kotidham.in/${safeData.image_url}`}
              alt={safeData.name}
              className="max-h-64 rounded-lg object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Basic Information */}
        <div>
          <Title level={4} className="mb-3">Basic Information</Title>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Text strong className="text-gray-600">Temple Name:</Text>
              <div className="text-lg">{safeData.name}</div>
            </div>
            <div>
              <Text strong className="text-gray-600">Location:</Text>
              <div className="text-lg flex items-center gap-1">
                <span>📍</span>
                {safeData.location}
              </div>
            </div>
            <div>
              <Text strong className="text-gray-600">Slug:</Text>
              <div>
                <Tag color="blue">{safeData.slug}</Tag>
              </div>
            </div>
            <div>
              <Text strong className="text-gray-600">Temple ID:</Text>
              <div>#{safeData.id}</div>
            </div>
          </div>
        </div>

        <Divider />

        {/* Description */}
        <div>
          <Title level={4} className="mb-3">Description</Title>
          <div className="bg-gray-50 p-4 rounded-lg">
            <Text>{safeData.description}</Text>
          </div>
        </div>

        <Divider />

        {/* Associated Items */}
        <div>
          <Title level={4} className="mb-3">Associated Items</Title>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-orange-50 p-4 rounded-lg">
              <Text strong className="text-orange-600">Recommended Pujas</Text>
              <div className="text-2xl font-bold text-orange-700 mt-2">
                {safeData.recommended_pujas.length}
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <Text strong className="text-green-600">Chadawas</Text>
              <div className="text-2xl font-bold text-green-700 mt-2">
                {safeData.chadawas.length}
              </div>
            </div>
          </div>
        </div>

        <Divider />

        {/* Metadata */}
        <div>
          <Title level={4} className="mb-3">Metadata</Title>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <Text strong className="text-gray-600">Created At:</Text>
              <div>{formatDate(safeData.created_at)}</div>
            </div>
            <div>
              <Text strong className="text-gray-600">Last Updated:</Text>
              <div>{formatDate(safeData.updated_at)}</div>
            </div>
          </div>
        </div>

        {/* Recommended Pujas List */}
        {safeData.recommended_pujas.length > 0 && (
          <>
            <Divider />
            <div>
              <Title level={4} className="mb-3">Recommended Pujas</Title>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {safeData.recommended_pujas.map((puja: any, index: number) => (
                  <div key={index} className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        {puja.temple_image_url ? (
                          <img
                            src={`https://api.33kotidham.in/${puja.temple_image_url}`}
                            alt={puja.name}
                            className="w-20 h-20 rounded-lg object-cover shadow-sm"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const fallback = document.createElement('div');
                              fallback.className = 'w-20 h-20 rounded-lg bg-gradient-to-br from-purple-200 to-purple-300 flex items-center justify-center text-3xl';
                              fallback.textContent = '🛕';
                              e.currentTarget.parentElement?.appendChild(fallback);
                            }}
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-purple-200 to-purple-300 flex items-center justify-center text-3xl">
                            🛕
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <Text strong className="text-base">{puja.name || `Puja ${index + 1}`}</Text>
                        {puja.sub_heading && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{puja.sub_heading}</p>
                        )}
                        {puja.description && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{puja.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          {puja.date && (
                            <Tag color="blue" className="text-xs">
                              📅 {new Date(puja.date).toLocaleDateString()}
                            </Tag>
                          )}
                          {puja.time && (
                            <Tag color="green" className="text-xs">
                              🕐 {puja.time}
                            </Tag>
                          )}
                          {puja.category && (
                            <Tag color="purple" className="text-xs">
                              {Array.isArray(puja.category) ? puja.category[0] : puja.category.split(',')[0]}
                            </Tag>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Chadawas List */}
        {safeData.chadawas.length > 0 && (
          <>
            <Divider />
            <div>
              <Title level={4} className="mb-3">Associated Chadawas</Title>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {safeData.chadawas.map((chadawa: any, index: number) => (
                  <div key={index} className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        {chadawa.image_url ? (
                          <img
                            src={`https://api.33kotidham.in/${chadawa.image_url}`}
                            alt={chadawa.name}
                            className="w-20 h-20 rounded-lg object-cover shadow-sm"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const fallback = document.createElement('div');
                              fallback.className = 'w-20 h-20 rounded-lg bg-gradient-to-br from-orange-200 to-orange-300 flex items-center justify-center text-3xl';
                              fallback.textContent = '🛍️';
                              e.currentTarget.parentElement?.appendChild(fallback);
                            }}
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-orange-200 to-orange-300 flex items-center justify-center text-3xl">
                            🛍️
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <Text strong className="text-base">{chadawa.name || `Chadawa ${index + 1}`}</Text>
                        {chadawa.description && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{chadawa.description}</p>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          {chadawa.price && (
                            <span className="text-base font-bold text-green-600">
                              ₹{chadawa.price}
                            </span>
                          )}
                          {chadawa.requires_note && (
                            <Tag color="orange" className="text-xs">
                              📝 Note Required
                            </Tag>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default ViewTempleModal;
