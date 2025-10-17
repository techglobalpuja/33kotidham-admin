// app/signin/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { message } from 'antd';
import { adminLogin } from '@/store/slices/authSlice';
import { useRedirectIfAuthenticated } from '@/hooks/useAuth';
import { Form, Input, Button, Typography, Card, Row, Col } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import type { AppDispatch } from '@/store';

const { Title, Text } = Typography;

interface FormData {
  username: string;
  password: string;
}

const SignInPage: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error, user } = useSelector((state: any) => state.auth);
  const [form] = Form.useForm();
  const [formData, setFormData] = useState<FormData>({
    username: '',
    password: '',
  });

  // Redirect if already authenticated
  useRedirectIfAuthenticated();

  // Redirect to dashboard on successful login
  useEffect(() => {
    if (user && !isLoading) {
      router.push('/admin');
    }
  }, [user, isLoading, router]);

  // Update form error from Redux state
  useEffect(() => {
    if (error) {
      // Show error message using Ant Design message component
      message.error(typeof error === 'object' ? JSON.stringify(error) : error);
    }
  }, [error, form]);

  // Separate onChange handlers
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, username: e.target.value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, password: e.target.value }));
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        username: formData.username.trim(),
        password: formData.password.trim(),
      };
      // Dispatch the adminLogin thunk without .unwrap()
      await dispatch(adminLogin(payload) as any);
      // Show success message
      message.success('Login successful! Redirecting to dashboard...');
      // No need for manual redirection; useEffect handles it when user is set
    } catch (error) {
      // Errors are handled by the Redux state (updated in authSlice)
      // The useEffect above will display the error in the form
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-orange-100 to-orange-200 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Row justify="center" align="middle" className="w-full">
        <Col xs={24} sm={20} md={16} lg={12} xl={10}>
          <Card 
            className="shadow-2xl rounded-2xl border border-orange-200/50 overflow-hidden"
            style={{ 
              background: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <div className="text-center mb-8">
              <div className="mx-auto bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <LockOutlined className="text-orange-600 text-2xl" />
              </div>
              <Title level={2} className="text-gray-800 mb-2">
                Admin Portal
              </Title>
              <Text className="text-gray-600">Sign in to access your dashboard</Text>
            </div>

            <Form
              form={form}
              onFinish={handleSubmit}
              layout="vertical"
              className="space-y-4"
            >
              <Form.Item
                name="username"
                label={<span className="text-sm font-medium text-gray-700">Username</span>}
                rules={[{ required: true, message: 'Please enter your username' }]}
              >
                <Input
                  prefix={<UserOutlined className="text-orange-400" />}
                  value={formData.username}
                  onChange={handleUsernameChange}
                  placeholder="Enter your username"
                  className="py-3 rounded-xl border-orange-200 focus:border-orange-400 focus:ring-orange-300"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="password"
                label={<span className="text-sm font-medium text-gray-700">Password</span>}
                rules={[{ required: true, message: 'Please enter your password' }]}
              >
                <Input.Password
                  prefix={<LockOutlined className="text-orange-400" />}
                  value={formData.password}
                  onChange={handlePasswordChange}
                  placeholder="Enter your password"
                  className="py-3 rounded-xl border-orange-200 focus:border-orange-400 focus:ring-orange-300"
                  size="large"
                />
              </Form.Item>

              <div className="flex items-center justify-between mb-6">
                <a href="#" className="text-orange-600 hover:text-orange-800 text-sm font-medium">
                  Forgot password?
                </a>
              </div>

              <Form.Item name="submit">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isLoading}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  size="large"
                >
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </Button>
              </Form.Item>
            </Form>

            {/* Removed Google Sign-in option */}
            {/* <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              <div className="mt-6">
                <Button
                  icon={<GoogleOutlined />}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-300 hover:border-orange-400 hover:bg-orange-50 text-gray-700 font-medium"
                  size="large"
                >
                  Sign in with Google
                </Button>
              </div>
            </div> */}

            <div className="mt-8 text-center">
              {/* Commented out All rights reserved */}
              {/* <Text className="text-gray-600">
                © {new Date().getFullYear()} Admin Portal. All rights reserved.
              </Text> */}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SignInPage;