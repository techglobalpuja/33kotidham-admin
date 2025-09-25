'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import EditText from '@/components/ui/EditText';

const ContentManagement: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'all' | 'upload'>('all');

  // Mock content data
  const mockContent = [
    {
      id: '1',
      title: 'Ganesh Puja Video',
      type: 'video',
      category: 'Puja',
      uploadDate: '2024-01-15',
      size: '24MB'
    },
    {
      id: '2',
      title: 'Lakshmi Puja Certificate',
      type: 'certificate',
      category: 'Certificate',
      uploadDate: '2024-01-14',
      size: '2MB'
    },
    {
      id: '3',
      title: 'Saraswati Puja Video',
      type: 'video',
      category: 'Puja',
      uploadDate: '2024-01-13',
      size: '42MB'
    },
    {
      id: '4',
      title: 'Durga Puja Certificate',
      type: 'certificate',
      category: 'Certificate',
      uploadDate: '2024-01-12',
      size: '1.8MB'
    }
  ];

  // Type icon mapping
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return '📹';
      case 'certificate':
        return '📜';
      case 'image':
        return '🖼️';
      case 'document':
        return '📄';
      default:
        return '📁';
    }
  };

  // Type badge styling
  const getTypeBadgeClass = (type: string) => {
    switch (type) {
      case 'video':
        return 'bg-purple-100 text-purple-800';
      case 'certificate':
        return 'bg-green-100 text-green-800';
      case 'image':
        return 'bg-yellow-100 text-yellow-800';
      case 'document':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Content Management</h2>
        <div className="flex space-x-3">
          <Button
            variant={activeSubTab === 'all' ? 'primary' : 'outline'}
            onClick={() => setActiveSubTab('all')}
          >
            All Content
          </Button>
          <Button
            variant={activeSubTab === 'upload' ? 'primary' : 'outline'}
            onClick={() => setActiveSubTab('upload')}
          >
            Upload Content
          </Button>
        </div>
      </div>

      {activeSubTab === 'all' ? (
        <>
          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex space-x-2">
              <EditText
                placeholder="Search content..."
                className="w-48"
              />
              <Button variant="outline" size="sm">
                Filter
              </Button>
            </div>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockContent.map((content) => (
              <div key={content.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="aspect-video bg-gray-100 flex items-center justify-center">
                  <span className="text-4xl">{getTypeIcon(content.type)}</span>
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{content.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">{content.uploadDate}</p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeBadgeClass(content.type)}`}>
                      {content.type}
                    </span>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm text-gray-500">{content.size}</span>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                      <Button variant="danger" size="sm">
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Upload New Content</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-orange-400 transition-colors cursor-pointer">
              <div className="text-4xl mb-4">📹</div>
              <h3 className="font-medium text-gray-900 mb-2">Upload Videos</h3>
              <p className="text-sm text-gray-600">Drag and drop puja videos or click to browse</p>
            </div>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-orange-400 transition-colors cursor-pointer">
              <div className="text-4xl mb-4">📜</div>
              <h3 className="font-medium text-gray-900 mb-2">Upload Certificates</h3>
              <p className="text-sm text-gray-600">Drag and drop certificates or click to browse</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <EditText
                label="Content Title"
                placeholder="Enter content title"
                fullWidth
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#111111] mb-1 sm:mb-2">
                Content Type
              </label>
              <select className="w-full transition-all duration-200 ease-in-out border border-[#5c4228] rounded-[30px] bg-[#fff3ee] text-[#111111] placeholder:text-[#6d6d6d] focus:outline-none focus:ring-2 focus:ring-[#f37335] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base px-4 py-3 sm:py-4">
                <option value="video">Video</option>
                <option value="certificate">Certificate</option>
                <option value="image">Image</option>
                <option value="document">Document</option>
              </select>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <Button variant="outline">Cancel</Button>
            <Button variant="primary">Upload Content</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentManagement;