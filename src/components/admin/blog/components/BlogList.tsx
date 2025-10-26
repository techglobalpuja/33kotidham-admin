'use client';

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBlogs, deleteBlog, setSelectedBlog } from '@/store/slices/blogSlice';
import { AppDispatch, RootState } from '@/store';
import { Table, Button, Tag, Space, Modal, Input, Spin } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import UpdateBlogModal from './UpdateBlogModal';
import ViewBlogModal from './ViewBlogModal';
import dayjs from 'dayjs';
import { useCategories } from '@/hooks/useCategories';

const { Search } = Input;
const { confirm } = Modal;

interface Blog {
  id: number;
  title: string;
  subtitle: string;
  content: string;
  thumbnail_image: string;
  meta_description: string;
  tags: string;
  category_ids: number[]; // Changed from category_id to category_ids
  categories: any[]; // Add categories array to match API response
  is_featured: boolean;
  is_active: boolean;
  publish_time: string;
  slug: string;
  created_at?: string;
  updated_at?: string;
}

interface BlogListProps {
  viewMode?: 'grid' | 'table';
}

const BlogList: React.FC<BlogListProps> = ({ viewMode = 'grid' }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { blogs: rawBlogs, isLoading, selectedBlog } = useSelector((state: RootState) => state.blog);
  const { categories } = useCategories();
  const [searchText, setSearchText] = useState('');
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Transform raw blogs to match the component interface
  const blogs: Blog[] = React.useMemo(() => {
    if (!Array.isArray(rawBlogs)) {
      console.warn('rawBlogs is not an array:', rawBlogs);
      return [];
    }
    
    return rawBlogs
      .filter(blog => blog && typeof blog === 'object')
      .map((blog: any) => {
        try {
          return {
            id: blog?.id ?? 0,
            title: (blog?.title ?? '').toString().trim(),
            subtitle: (blog?.subtitle ?? '').toString().trim(),
            content: (blog?.content ?? '').toString().trim(),
            thumbnail_image: (blog?.thumbnail_image ?? '').toString().trim(),
            meta_description: (blog?.meta_description ?? '').toString().trim(),
            tags: (blog?.tags ?? '').toString().trim(),
            category_ids: Array.isArray(blog?.category_ids) ? blog.category_ids : [], // Changed from category_id to category_ids
            // Preserve the full categories array from API response
            categories: Array.isArray(blog?.categories) ? blog.categories : [],
            is_featured: Boolean(blog?.is_featured ?? false),
            is_active: Boolean(blog?.is_active ?? true),
            publish_time: (blog?.publish_time ?? '').toString().trim(),
            slug: (blog?.slug ?? '').toString().trim(),
            created_at: (blog?.created_at ?? '').toString().trim(),
            updated_at: (blog?.updated_at ?? '').toString().trim(),
          };
        } catch (error) {
          console.error('Error transforming blog data:', error, blog);
          // Return a safe default object for corrupted data
          return {
            id: 0,
            title: 'Error Loading Blog',
            subtitle: '',
            content: '',
            thumbnail_image: '',
            meta_description: '',
            tags: '',
            category_ids: [],
            categories: [],
            is_featured: false,
            is_active: false,
            publish_time: '',
            slug: '',
            created_at: '',
            updated_at: '',
          };
        }
      })
      .filter(blog => blog.id !== 0);
  }, [rawBlogs]);

  useEffect(() => {
    dispatch(fetchBlogs());
  }, [dispatch]);

  const handleDelete = (blog: Blog) => {
    confirm({
      title: 'Delete Blog',
      content: (
        <div>
          <p>Are you sure you want to delete the blog <strong>"{blog.title}"</strong>?</p>
          <p className="text-red-600 text-sm mt-2">This action cannot be undone.</p>
        </div>
      ),
      icon: <span className="text-red-500">🗑️</span>,
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      centered: true,
      onOk: async () => {
        try {
          const result = await dispatch(deleteBlog(blog.id));
          if (deleteBlog.fulfilled.match(result)) {
            console.log('Blog deleted successfully');
            dispatch(fetchBlogs());
            
            Modal.success({
              title: 'Blog Deleted',
              content: `"${blog.title}" has been successfully deleted.`,
              centered: true,
            });
          } else {
            console.error('Failed to delete blog:', result.payload);
            
            Modal.error({
              title: 'Delete Failed',
              content: 'Failed to delete blog. Please try again.',
              centered: true,
            });
          }
        } catch (error) {
          console.error('Error deleting blog:', error);
          
          Modal.error({
            title: 'Error',
            content: 'An error occurred while deleting the blog.',
            centered: true,
          });
        }
      },
    });
  };

  const handleUpdate = (blog: Blog) => {
    dispatch(setSelectedBlog(blog));
    setIsUpdateModalOpen(true);
  };

  const handleView = (blog: Blog) => {
    dispatch(setSelectedBlog(blog));
    setIsViewModalOpen(true);
  };

  const handleUpdateSuccess = () => {
    setIsUpdateModalOpen(false);
    dispatch(fetchBlogs());
  };

  // Filter blogs based on search text
  const filteredBlogs = blogs.filter(blog => 
    blog.title.toLowerCase().includes(searchText.toLowerCase()) ||
    blog.subtitle.toLowerCase().includes(searchText.toLowerCase()) ||
    blog.tags.toLowerCase().includes(searchText.toLowerCase())
  );

  const formatTags = (tags: string) => {
    return tags ? tags.split(',').map(tag => tag.trim()) : [];
  };

  const getCategoryNames = (categoryIds: number[]) => {
    if (!categories) return 'Loading...';
    return categoryIds.map(id => {
      const category = categories.find(cat => cat.id === id);
      return category ? category.name : 'Unknown';
    }).join(', ');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
        <span className="text-gray-600">Loading blogs...</span>
      </div>
    );
  }

  if (!Array.isArray(blogs) || blogs.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">📝</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No blogs available</h3>
        <p className="text-gray-500">Start by creating your first blog</p>
      </div>
    );
  }

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 70,
      sorter: (a: any, b: any) => a.id - b.id,
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      width: 250,
      ellipsis: true,
      render: (text: string) => <span className="font-medium text-gray-900">{text}</span>,
    },
    {
      title: 'Subtitle',
      dataIndex: 'subtitle',
      key: 'subtitle',
      width: 200,
      ellipsis: true,
    },
    {
      title: 'Categories',
      dataIndex: 'category_ids',
      key: 'category_ids',
      width: 150,
      render: (categoryIds: number[]) => getCategoryNames(categoryIds),
    },
    {
      title: 'Tags',
      dataIndex: 'tags',
      key: 'tags',
      width: 200,
      render: (tags: string) => {
        const tagArray = tags ? tags.split(',').map(tag => tag.trim()) : [];
        return (
          <div className="flex flex-wrap gap-1">
            {tagArray.slice(0, 3).map((tag, index) => (
              <Tag key={index} color="blue" className="text-xs">
                {tag}
              </Tag>
            ))}
            {tagArray.length > 3 && (
              <Tag className="text-xs">+{tagArray.length - 3}</Tag>
            )}
          </div>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 100,
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
      filters: [
        { text: 'Active', value: true },
        { text: 'Inactive', value: false },
      ],
      onFilter: (value: any, record: any) => record.is_active === value,
    },
    {
      title: 'Featured',
      dataIndex: 'is_featured',
      key: 'is_featured',
      width: 100,
      render: (isFeatured: boolean) => (
        isFeatured ? <Tag color="gold">Featured</Tag> : <Tag>Normal</Tag>
      ),
      filters: [
        { text: 'Featured', value: true },
        { text: 'Normal', value: false },
      ],
      onFilter: (value: any, record: any) => record.is_featured === value,
    },
    {
      title: 'Publish Time',
      dataIndex: 'publish_time',
      key: 'publish_time',
      width: 180,
      render: (time: string) => time ? dayjs(time).format('MMM D, YYYY h:mm A') : 'N/A',
      sorter: (a: any, b: any) => new Date(a.publish_time).getTime() - new Date(b.publish_time).getTime(),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 180,
      fixed: 'right' as const,
      render: (_: any, record: any) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
            className="text-blue-600 hover:text-blue-700"
          >
            View
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleUpdate(record)}
            className="text-green-600 hover:text-green-700"
          >
            Edit
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];
  return (
    <>
      {/* Search and Filter */}
      <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex-1 min-w-64">
          <input
            type="text"
            placeholder="Search blogs by title, subtitle, or tags..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-black placeholder-gray-400"
          />
        </div>
        <div className="text-sm text-gray-600 flex items-center">
          Total: <span className="font-semibold ml-1">{filteredBlogs.length}</span> blog(s)
        </div>
      </div>

      {/* Blogs List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(filteredBlogs ?? []).length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🔍</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No blogs found</h3>
              <p className="text-gray-500">Try adjusting your search criteria</p>
            </div>
          ) : (
            (filteredBlogs ?? []).map((blog) => (
            <div key={blog.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-all duration-200 bg-white">
              <div className="aspect-video bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
                {blog.thumbnail_image ? (
                  <img 
                    src={`https://api.33kotidham.in/${blog.thumbnail_image}`} 
                    alt={blog.title}
                    className="w-full h-full object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      if (e.currentTarget.parentElement) {
                        e.currentTarget.parentElement.innerHTML = '<div class="w-full h-full bg-blue-100 rounded-lg flex items-center justify-center"><span class="text-blue-600 text-3xl">📝</span></div>';
                      }
                    }}
                  />
                ) : (
                  <span className="text-blue-600 text-3xl">📝</span>
                )}
                {blog.is_featured && (
                  <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                    ⭐ Featured
                  </div>
                )}
                <div className={`absolute top-2 left-2 text-xs px-2 py-1 rounded-full font-medium ${
                  blog.is_active ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                }`}>
                  {blog.is_active ? '● Active' : '● Inactive'}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <h4 className="font-semibold text-gray-900 text-lg   leading-tight">{blog.title}</h4>
                </div>
                
                <p className="text-sm text-blue-600 font-medium">{blog.subtitle}</p>
                
                <div className="flex items-center text-sm text-gray-500">
                  <span className="font-medium">Categories:</span>
                  <span className="ml-1">{getCategoryNames(blog.category_ids)}</span>
                </div>
                
                <div className="flex flex-wrap gap-1 mt-2">
                  {formatTags(blog.tags).slice(0, 3).map((tag, index) => (
                    <span key={index} className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {tag}
                    </span>
                  ))}
                  {formatTags(blog.tags).length > 3 && (
                    <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      +{formatTags(blog.tags).length - 3}
                    </span>
                  )}
                </div>
                
                <div className="text-xs text-gray-500 border-t pt-2 mt-3">
                  Published: {dayjs(blog.publish_time).format('MMM D, YYYY')}
                </div>
              </div>
              
              <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                <button 
                  onClick={() => handleView(blog)}
                  className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-600 py-2 px-3 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-1"
                >
                  <span>👁️</span> View
                </button>
                <button 
                  onClick={() => handleUpdate(blog)}
                  className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 py-2 px-3 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-1"
                >
                  <span>✏️</span> Edit
                </button>
                <button 
                  onClick={() => handleDelete(blog)}
                  className="bg-red-50 hover:bg-red-100 text-red-600 py-2 px-3 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-1"
                >
                  🗑️
                </button>
              </div>
            </div>
            ))
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Blog Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categories
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tags
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(filteredBlogs ?? []).length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="text-gray-400 text-4xl mb-4">🔍</div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No blogs found</h3>
                      <p className="text-gray-500">Try adjusting your search criteria</p>
                    </td>
                  </tr>
                ) : (
                  (filteredBlogs ?? []).map((blog) => (
                  <tr key={blog.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          <div className="h-12 w-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                            <span className="text-blue-600 text-lg">📝</span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900  ">{blog.title}</div>
                          <div className="text-sm text-blue-600">{blog.subtitle}</div>
                          <div className="text-xs text-gray-500">Published: {dayjs(blog.publish_time).format('MMM D, YYYY')}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getCategoryNames(blog.category_ids)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {formatTags(blog.tags).slice(0, 3).map((tag, index) => (
                          <span key={index} className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {tag}
                          </span>
                        ))}
                        {formatTags(blog.tags).length > 3 && (
                          <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            +{formatTags(blog.tags).length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          blog.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {blog.is_active ? '● Active' : '● Inactive'}
                        </span>
                        {blog.is_featured && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            ⭐ Featured
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleView(blog)}
                          className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-100" 
                          title="View"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => handleUpdate(blog)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-100" 
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => handleDelete(blog)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-100" 
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Update Modal */}
      <UpdateBlogModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        blog={selectedBlog}
        onSuccess={handleUpdateSuccess}
      />

      {/* View Modal */}
      <ViewBlogModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        blog={selectedBlog}
      />
    </>
  );
};

export default BlogList;