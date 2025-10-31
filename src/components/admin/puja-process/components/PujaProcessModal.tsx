'use client';

import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Modal, Form, Select, Button, message, Input } from 'antd';
import { updatePujaProcessStatus } from '@/store/slices/pujaProcessSlice';
import { AppDispatch } from '@/store/index';

const { Option } = Select;

interface Puja {
  id: string;
  name: string;
  date: string;
  temple_address: string;
  total_bookings: number;
  process_status: string;
  is_active: boolean; // Added is_active field
  sub_heading: string; // Added sub_heading field
  video_url?: string; // Added video_url field
}

interface PujaProcessModalProps {
  visible: boolean;
  puja: Puja | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const PujaProcessModal: React.FC<PujaProcessModalProps> = ({ 
  visible, 
  puja,
  onCancel, 
  onSuccess
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  // Set initial form values when puja changes
  React.useEffect(() => {
    if (puja && visible) {
      const initialValues: { 
        process_status: string;
        video_url?: string;
      } = {
        process_status: puja.process_status || 'Scheduled'
      };
      
      // If the current status is Shared Video, set the video URL
      if (puja.process_status === 'Shared Video' && puja.video_url) {
        initialValues.video_url = puja.video_url;
      }
      
      form.setFieldsValue(initialValues);
      setSelectedStatus(puja.process_status || 'Scheduled');
    }
  }, [puja, visible, form]);

  const handleStatusChange = (value: string) => {
    setSelectedStatus(value);
    // Reset video URL field when changing status
    if (value !== 'Shared Video') {
      form.setFieldsValue({ video_url: undefined });
    }
  };

  const handleSubmit = async (values: { process_status: string; video_url?: string }) => {
    if (!puja) return;
    
    try {
      setIsSubmitting(true);
      
      // Prepare the payload
      const payload: { 
        id: string; 
        process_status: string;
        video_url?: string;
      } = {
        id: puja.id,
        process_status: values.process_status
      };
      
      // Include video URL only if status is Shared Video and URL is provided
      if (values.process_status === 'Shared Video' && values.video_url) {
        payload.video_url = values.video_url;
      }
      
      // Dispatch action to update puja process status
      const result = await dispatch(updatePujaProcessStatus(payload) as any);
      
      if (updatePujaProcessStatus.fulfilled.match(result)) {
        message.success('Puja process status updated successfully');
        onSuccess();
      } else {
        message.error('Failed to update puja process status');
      }
    } catch (error) {
      console.error('Error updating puja process:', error);
      message.error('An error occurred while updating puja process status');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <span className="text-2xl">🔄</span>
          <span className="text-xl">Update Puja Process</span>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
      style={{ top: 20 }}
      className="admin-puja-process-modal"
    >
      {puja && (
        <Form 
          form={form} 
          onFinish={handleSubmit} 
          layout="vertical" 
          className="space-y-6"
        >
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200">
            <h3 className="text-lg font-semibold text-orange-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">🛕</span>
              {puja.name}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-white p-3 rounded-lg border border-orange-200">
                <p className="text-xs text-gray-500">Puja Date</p>
                <p className="font-medium">
                  {puja.date ? new Date(puja.date).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              
              <div className="bg-white p-3 rounded-lg border border-orange-200">
                <p className="text-xs text-gray-500">Temple</p>
                <p className="font-medium truncate">{puja.temple_address}</p>
              </div>
              
              <div className="bg-white p-3 rounded-lg border border-orange-200">
                <p className="text-xs text-gray-500">Total Bookings</p>
                <p className="font-medium">{puja.total_bookings}</p>
              </div>
              
              <div className="bg-white p-3 rounded-lg border border-orange-200">
                <p className="text-xs text-gray-500">Status</p>
                <div className="flex flex-col space-y-1">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    puja.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {puja.is_active ? '● Active' : '● Inactive'}
                  </span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    puja.process_status === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                    puja.process_status === 'Puja Started' ? 'bg-yellow-100 text-yellow-800' :
                    puja.process_status === 'Puja Ended' ? 'bg-green-100 text-green-800' :
                    puja.process_status === 'Shared Video' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {puja.process_status}
                  </span>
                </div>
              </div>
            </div>

            <Form.Item
              name="process_status"
              label={<span className="block text-sm font-medium text-gray-700 mb-2">Process Status</span>}
              required={true}
            >
              <Select
                placeholder="Select process status"
                className="w-full bg-white text-gray-700 border border-gray-300 rounded-lg"
                onChange={handleStatusChange}
              >
                <Option value="Scheduled">Scheduled</Option>
                <Option value="Puja Started">Puja Started</Option>
                <Option value="Puja Ended">Puja Ended</Option>
                <Option value="Shared Video">Shared Video</Option>
              </Select>
            </Form.Item>

            {/* Video URL input - only shown when Shared Video is selected */}
            {selectedStatus === 'Shared Video' && (
              <Form.Item
                name="video_url"
                label={<span className="block text-sm font-medium text-gray-700 mb-2">Video URL</span>}
                rules={[
                  { required: true, message: 'Please enter the video URL' },
                  { type: 'url', message: 'Please enter a valid URL' }
                ]}
              >
                <Input
                  placeholder="Enter the video URL"
                  className="w-full bg-white text-gray-700 border border-gray-300 rounded-lg"
                />
              </Form.Item>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="default"
              onClick={onCancel}
              className="px-6 py-2"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={isSubmitting}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-2 border-none"
            >
              {isSubmitting ? 'Updating...' : 'Update Process'}
            </Button>
          </div>
        </Form>
      )}
    </Modal>
  );
};

export default PujaProcessModal;