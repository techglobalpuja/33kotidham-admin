'use client';

import React, { useState } from 'react';
import { Form, Input, Button, Select, Checkbox, Typography } from 'antd';

const { TextArea } = Input;
const { Title } = Typography;

const CreateBlogForm: React.FC = () => {
  const [form] = Form.useForm();
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    excerpt: '',
    content: '',
    category: 'spiritual',
    tags: '',
    status: true,
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value ?? '',
    }));
  };

  const handleSubmit = async () => {
    // Mock submit logic
    console.log('Creating blog:', formData);
    form.resetFields();
    setFormData({
      title: '',
      author: '',
      excerpt: '',
      content: '',
      category: 'spiritual',
      tags: '',
      status: true,
    });
  };

  return (
    <Form form={form} onFinish={handleSubmit} layout="vertical" className="space-y-6">
      <Title level={3}>Add New Blog</Title>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Form.Item
          name="title"
          label="Blog Title"
          required
        >
          <Input
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="Enter blog title"
          />
        </Form.Item>

        <Form.Item
          name="author"
          label="Author"
          required
        >
          <Input
            value={formData.author}
            onChange={(e) => handleInputChange('author', e.target.value)}
            placeholder="Enter author name"
          />
        </Form.Item>
      </div>

      <Form.Item
        name="excerpt"
        label="Excerpt"
      >
        <TextArea
          value={formData.excerpt}
          onChange={(e) => handleInputChange('excerpt', e.target.value)}
          rows={3}
          placeholder="Enter a short excerpt for the blog post"
        />
      </Form.Item>

      <Form.Item
        name="content"
        label="Content"
      >
        <TextArea
          value={formData.content}
          onChange={(e) => handleInputChange('content', e.target.value)}
          rows={8}
          placeholder="Enter the full blog content"
        />
      </Form.Item>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Form.Item
          name="category"
          label="Category"
          required
        >
          <Select
            value={formData.category}
            onChange={(value) => handleInputChange('category', value)}
            placeholder="Select category"
          >
            <Select.Option value="spiritual">Spiritual</Select.Option>
            <Select.Option value="astrology">Astrology</Select.Option>
            <Select.Option value="puja">Puja</Select.Option>
            <Select.Option value="remedies">Remedies</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="tags"
          label="Tags (comma separated)"
        >
          <Input
            value={formData.tags}
            onChange={(e) => handleInputChange('tags', e.target.value)}
            placeholder="Enter tags separated by commas"
          />
        </Form.Item>
      </div>

      <Form.Item name="status" valuePropName="checked">
        <Checkbox
          checked={formData.status}
          onChange={(e) => handleInputChange('status', e.target.checked)}
        >
          Publish Blog
        </Checkbox>
      </Form.Item>

      <Form.Item>
        <div className="flex justify-end space-x-3">
          <Button type="default" onClick={() => {
            form.resetFields();
            setFormData({
              title: '',
              author: '',
              excerpt: '',
              content: '',
              category: 'spiritual',
              tags: '',
              status: true,
            });
          }}>
            Cancel
          </Button>
          <Button type="primary" htmlType="submit">
            Publish Blog
          </Button>
        </div>
      </Form.Item>
    </Form>
  );
};

export default CreateBlogForm;