'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { signupUser } from '@/store/slices/authSlice';
import { useRedirectIfAuthenticated } from '@/hooks/useAuth';
import { Form, Input, Button, Typography, Card, Row, Col } from 'antd';
import { GoogleOutlined, UserOutlined, MailOutlined, PhoneOutlined, LockOutlined } from '@ant-design/icons';
import type { AppDispatch } from '@/store';

const { Title, Text } = Typography;

interface FormData {
  name: string;
  email: string;
  mobile: string;
  password: string;
  confirmPassword: string;
}

const SignUpPage: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error, user } = useSelector((state: any) => state.auth);
  const [form] = Form.useForm();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
  });

  // Redirect if already authenticated
  useRedirectIfAuthenticated();

  // Redirect to dashboard on successful signup
  useEffect(() => {
    if (user && !isLoading) {
      router.push('/admin');
    }
  }, [user, isLoading, router]);

  // Update form error from Redux state
  useEffect(() => {
    if (error) {
      form.setFields([
        {
          name: 'submit',
          errors: [typeof error === 'object' ? JSON.stringify(error) : error],
        },
      ]);
    }
  }, [error, form]);

  // Separate onChange handlers
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, name: e.target.value }));
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, email: e.target.value }));
  };

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, mobile: e.target.value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, password: e.target.value }));
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }));
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim() || null,
        mobile: formData.mobile.trim(),
        password: formData.password.trim() || null,
        role: 'super_admin',
      };
      // Dispatch signupUser without .unwrap()
      await dispatch(signupUser(payload) as any);
      // Redirection is handled by useEffect when user is set
    } catch (error) {
      // Errors are handled by Redux state (updated in authSlice)
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
                <UserOutlined className="text-orange-600 text-2xl" />
              </div>
              <Title level={2} className="text-gray-800 mb-2">
                Create Admin Account
              </Title>
              <Text className="text-gray-600">Sign up to access your admin dashboard</Text>
            </div>

            <Form
              form={form}
              onFinish={handleSubmit}
              layout="vertical"
              className="space-y-4"
            >
              <Form.Item
                name="name"
                label={<span className="text-sm font-medium text-gray-700">Full Name</span>}
                rules={[{ required: true, message: 'Please enter your full name' }]}
              >
                <Input
                  prefix={<UserOutlined className="text-orange-400" />}
                  value={formData.name}
                  onChange={handleNameChange}
                  placeholder="Enter your full name"
                  className="py-3 rounded-xl border-orange-200 focus:border-orange-400 focus:ring-orange-300"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="email"
                label={<span className="text-sm font-medium text-gray-700">Email (optional)</span>}
                rules={[
                  { type: 'email', message: 'Please enter a valid email', validateTrigger: 'onBlur' },
                ]}
              >
                <Input
                  prefix={<MailOutlined className="text-orange-400" />}
                  value={formData.email}
                  onChange={handleEmailChange}
                  placeholder="Enter your email"
                  className="py-3 rounded-xl border-orange-200 focus:border-orange-400 focus:ring-orange-300"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="mobile"
                label={<span className="text-sm font-medium text-gray-700">Mobile Number</span>}
                rules={[
                  { required: true, message: 'Please enter your mobile number' },
                  {
                    pattern: /^\+?[0-9]{10,15}$/,
                    message: 'Mobile number must be 10–15 digits',
                  },
                ]}
              >
                <Input
                  prefix={<PhoneOutlined className="text-orange-400" />}
                  value={formData.mobile}
                  onChange={handleMobileChange}
                  placeholder="Enter your mobile number"
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
                  placeholder="Enter password"
                  className="py-3 rounded-xl border-orange-200 focus:border-orange-400 focus:ring-orange-300"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                label={<span className="text-sm font-medium text-gray-700">Confirm Password</span>}
                rules={[
                  { required: true, message: 'Please confirm your password' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Passwords do not match'));
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined className="text-orange-400" />}
                  value={formData.confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  placeholder="Confirm password"
                  className="py-3 rounded-xl border-orange-200 focus:border-orange-400 focus:ring-orange-300"
                  size="large"
                />
              </Form.Item>

              <Form.Item name="submit">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isLoading}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  size="large"
                >
                  {isLoading ? 'Creating Account...' : 'Sign Up'}
                </Button>
              </Form.Item>
            </Form>

            <div className="mt-8">
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
                  Sign up with Google
                </Button>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Text className="text-gray-600">
                Already have an account?{' '}
                <button
                  onClick={() => router.push('/admin/signin')}
                  className="text-orange-600 hover:text-orange-800 font-medium"
                >
                  Sign in
                </button>
              </Text>
            </div>

            <div className="mt-8 text-center">
              <Text className="text-gray-600">
                © {new Date().getFullYear()} Admin Portal. All rights reserved.
              </Text>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SignUpPage;