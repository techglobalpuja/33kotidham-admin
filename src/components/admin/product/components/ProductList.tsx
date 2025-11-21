'use client';

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Modal, message } from 'antd';
import { RootState, AppDispatch } from '@/store';
import { fetchProducts, deleteProduct } from '@/store/slices/productSlice';
import UpdateProductModal from './UpdateProductModal';
import ViewProductModal from './ViewProductModal';

interface ProductListProps {
  viewMode?: 'grid' | 'table';
}

const ProductList: React.FC<ProductListProps> = ({ viewMode = 'grid' }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { products, isLoading } = useSelector((state: RootState) => state.product);

  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);

  useEffect(() => {
    dispatch(fetchProducts({ is_active: true }))
      .unwrap()
      .then(() => {
        message.success('Products loaded successfully');
      })
      .catch((error) => {
        message.error(error || 'Failed to load products');
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleViewProduct = (productId: number) => {
    setSelectedProductId(productId);
    setViewModalVisible(true);
  };

  const handleEditProduct = (productId: number) => {
    setSelectedProductId(productId);
    setUpdateModalVisible(true);
  };

  const handleDeleteProduct = (productId: number, productName: string) => {
    Modal.confirm({
      title: 'Delete Product',
      content: `Are you sure you want to delete "${productName}"? This action cannot be undone.`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await dispatch(deleteProduct(productId)).unwrap();
          message.success('Product deleted successfully');
          dispatch(fetchProducts({ is_active: true }))
            .unwrap()
            .catch((error) => {
              message.error(error || 'Failed to refresh product list');
            });
        } catch (error: any) {
          message.error(error || 'Failed to delete product');
        }
      },
    });
  };

  const handleUpdateSuccess = () => {
    setUpdateModalVisible(false);
    setSelectedProductId(null);
    dispatch(fetchProducts({ is_active: true }))
      .unwrap()
      .catch((error) => {
        message.error(error || 'Failed to refresh product list');
      });
  };

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(numAmount);
  };

  // Helper function to get proper image URL
  const getImageUrl = (imageUrl: string) => {
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    return `https://api.33kotidham.in/${imageUrl}`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No products</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by creating a new product.</p>
      </div>
    );
  }

  if (viewMode === 'grid') {
    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="relative h-48 bg-gray-100">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images.find(img => img.is_primary)?.image_url.startsWith('http') 
                      ? product.images.find(img => img.is_primary)?.image_url 
                      : `https://api.33kotidham.in/${product.images.find(img => img.is_primary)?.image_url || product.images[0]?.image_url}`}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                {product.is_featured && (
                  <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded">
                    Featured
                  </div>
                )}
                {!product.is_active && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                    Inactive
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{product.name}</h3>
                <p className="text-sm text-gray-500 mb-2 line-clamp-2">{product.short_description}</p>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg font-bold text-gray-900">{formatCurrency(product.selling_price)}</span>
                  {parseFloat(product.discount_percentage) > 0 && (
                    <>
                      <span className="text-sm text-gray-500 line-through">{formatCurrency(product.mrp)}</span>
                      <span className="text-xs text-green-600 font-medium">{parseFloat(product.discount_percentage).toFixed(0)}% OFF</span>
                    </>
                  )}
                </div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-gray-500">Stock: {product.stock_quantity}</span>
                  {product.category && (
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">{product.category.name}</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewProduct(product.id)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded text-sm font-medium transition-colors"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleEditProduct(product.id)}
                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded text-sm font-medium transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product.id, product.name)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded text-sm font-medium transition-colors"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {selectedProductId && (
          <ViewProductModal
            visible={viewModalVisible}
            productId={selectedProductId}
            onClose={() => {
              setViewModalVisible(false);
              setSelectedProductId(null);
            }}
          />
        )}
        {selectedProductId && (
          <UpdateProductModal
            visible={updateModalVisible}
            productId={selectedProductId}
            onClose={() => {
              setUpdateModalVisible(false);
              setSelectedProductId(null);
            }}
            onSuccess={handleUpdateSuccess}
          />
        )}
      </>
    );
  }

  // Table View
  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MRP</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Selling Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        {product.images && product.images.length > 0 ? (
                          <img
                            className="h-10 w-10 rounded object-cover"
                            src={product.images.find(img => img.is_primary)?.image_url.startsWith('http') 
                              ? product.images.find(img => img.is_primary)?.image_url 
                              : `https://api.33kotidham.in/${product.images.find(img => img.is_primary)?.image_url || product.images[0]?.image_url}`}
                            alt={product.name}
                            loading="lazy"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded bg-gray-200 flex items-center justify-center">
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">{product.sku}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{product.category?.name || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatCurrency(product.mrp)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{formatCurrency(product.selling_price)}</div>
                    {parseFloat(product.discount_percentage) > 0 && (
                      <div className="text-xs text-green-600">{parseFloat(product.discount_percentage).toFixed(0)}% OFF</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{product.stock_quantity}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      product.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {product.is_active ? 'Active' : 'Inactive'}
                    </span>
                    {product.is_featured && (
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        Featured
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleViewProduct(product.id)}
                      className="text-gray-600 hover:text-gray-900 mr-3"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleEditProduct(product.id)}
                      className="text-orange-600 hover:text-orange-900 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id, product.name)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedProductId && (
        <ViewProductModal
          visible={viewModalVisible}
          productId={selectedProductId}
          onClose={() => {
            setViewModalVisible(false);
            setSelectedProductId(null);
          }}
        />
      )}
      {selectedProductId && (
        <UpdateProductModal
          visible={updateModalVisible}
          productId={selectedProductId}
          onClose={() => {
            setUpdateModalVisible(false);
            setSelectedProductId(null);
          }}
          onSuccess={handleUpdateSuccess}
        />
      )}
    </>
  );
};

export default ProductList;