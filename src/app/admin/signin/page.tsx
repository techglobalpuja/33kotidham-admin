// app/signin/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { adminLogin } from '@/store/slices/authSlice';
import { Form, Input, Button, Typography } from 'antd';
import { GoogleOutlined } from '@ant-design/icons';

const { Title, Text, Link } = Typography;

interface FormData {
  username: string;
  password: string;
}

const SignInPage: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isLoading, error, user } = useSelector((state: any) => state.auth);
  const [form] = Form.useForm();
  const [formData, setFormData] = useState<FormData>({
    username: '',
    password: '',
  });

  // Redirect to dashboard on successful login
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
          errors: [
            typeof error === 'object' ? JSON.stringify(error) : error,
          ],
        },
      ]);
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
        clientId: process.env.NEXT_PUBLIC_CLIENT_ID || 'default-client-id',
        clientSecret: process.env.NEXT_PUBLIC_CLIENT_SECRET || 'default-client-secret',
      };
      // Dispatch the adminLogin thunk without .unwrap()
      await dispatch(adminLogin(payload));
      // No need for manual redirection; useEffect handles it when user is set
    } catch (error) {
      // Errors are handled by the Redux state (updated in authSlice)
      // The useEffect above will display the error in the form
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white/20 backdrop-blur-xl border border-orange-200/30 rounded-2xl shadow-2xl p-6 w-full max-w-md">
        <Title level={2} className="text-center mb-6 font-['Philosopher'] text-black">
          Admin Login
        </Title>

        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
          className="space-y-4"
        >
          <Form.Item
            name="username"
            label={<span className="text-sm font-medium text-black font-['Lato']">Username</span>}
            rules={[{ required: true, message: 'Username is required' }]}
          >
            <Input
              value={formData.username}
              onChange={handleUsernameChange}
              placeholder="Enter your username"
              className="bg-white/30 border-orange-200/30 focus:ring-orange-200 text-black placeholder-black/50"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label={<span className="text-sm font-medium text-black font-['Lato']">Password</span>}
            rules={[{ required: true, message: 'Password is required' }]}
          >
            <Input.Password
              value={formData.password}
              onChange={handlePasswordChange}
              placeholder="Enter password"
              className="bg-white/30 border-orange-200/30 focus:ring-orange-200 text-black placeholder-black/50"
            />
          </Form.Item>

          <Form.Item name="submit">
            <Button
              type="primary"
              htmlType="submit"
              loading={isLoading}
              className="w-full bg-gradient-to-r from-orange-200/60 to-orange-300/70 text-black font-semibold font-['Work_Sans'] uppercase text-sm border-none hover:shadow-lg"
            >
              {isLoading ? 'Loading...' : 'Login'}
            </Button>
          </Form.Item>
        </Form>

        <div className="mt-6 text-center">
          <Button
            icon={<GoogleOutlined />}
            className="w-full bg-orange-100/40 text-black font-semibold font-['Work_Sans'] uppercase text-sm border-none hover:bg-orange-200/60 hover:shadow-lg flex items-center justify-center gap-2"
          >
            Login with Google
          </Button>
          <Text className="mt-4 text-sm text-black/70">
            Don't have an account?{' '}
            <Link
              href="/signup"
              onClick={() => router.push('/admin/signup')}
              className="text-orange-600 hover:underline ml-1"
            >
              Sign up
            </Link>
          </Text>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;