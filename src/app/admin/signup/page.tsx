'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { signupUser } from '@/store/slices/authSlice';
import { Form, Input, Button, Typography } from 'antd';
import { GoogleOutlined } from '@ant-design/icons';

const { Title, Text, Link } = Typography;

interface FormData {
  name: string;
  email: string;
  mobile: string;
  password: string;
  confirmPassword: string;
}

const SignUpPage: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isLoading, error, user } = useSelector((state: any) => state.auth);
  const [form] = Form.useForm();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
  });

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
      await dispatch(signupUser(payload));
      // Redirection is handled by useEffect when user is set
    } catch (error) {
      // Errors are handled by Redux state (updated in authSlice)
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white/20 backdrop-blur-xl border border-orange-200/30 rounded-2xl shadow-2xl p-6 w-full max-w-md">
        <Title level={2} className="text-center mb-6 font-['Philosopher'] text-black">
          Sign Up
        </Title>

        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
          className="space-y-4"
        >
          <Form.Item
            name="name"
            label={<span className="text-sm font-medium text-black font-['Lato']">Full Name</span>}
            rules={[{ required: true, message: 'Name is required' }]}
          >
            <Input
              value={formData.name}
              onChange={handleNameChange}
              placeholder="Enter your full name"
              className="bg-white/30 border-orange-200/30 focus:ring-orange-200 text-black placeholder-black/50"
            />
          </Form.Item>

          <Form.Item
            name="email"
            label={<span className="text-sm font-medium text-black font-['Lato']">Email (optional)</span>}
            rules={[
              { type: 'email', message: 'Invalid email format', validateTrigger: 'onBlur' },
            ]}
          >
            <Input
              value={formData.email}
              onChange={handleEmailChange}
              placeholder="Enter your email"
              className="bg-white/30 border-orange-200/30 focus:ring-orange-200 text-black placeholder-black/50"
            />
          </Form.Item>

          <Form.Item
            name="mobile"
            label={<span className="text-sm font-medium text-black font-['Lato']">Mobile Number</span>}
            rules={[
              { required: true, message: 'Mobile number is required' },
              {
                pattern: /^\+?[0-9]{10,15}$/,
                message: 'Mobile number must be 10–15 digits, optionally starting with +',
              },
            ]}
          >
            <Input
              value={formData.mobile}
              onChange={handleMobileChange}
              placeholder="Enter your mobile number"
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

          <Form.Item
            name="confirmPassword"
            label={<span className="text-sm font-medium text-black font-['Lato']">Confirm Password</span>}
            rules={[
              { required: true, message: 'Confirm password is required' },
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
              value={formData.confirmPassword}
              onChange={handleConfirmPasswordChange}
              placeholder="Confirm password"
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
              {isLoading ? 'Loading...' : 'Sign Up'}
            </Button>
          </Form.Item>
        </Form>

        <div className="mt-6 text-center">
          <Button
            icon={<GoogleOutlined />}
            className="w-full bg-orange-100/40 text-black font-semibold font-['Work_Sans'] uppercase text-sm border-none hover:bg-orange-200/60 hover:shadow-lg flex items-center justify-center gap-2"
          >
            Sign up with Google
          </Button>
          <Text className="mt-4 text-sm text-black/70">
            Already have an account?{' '}
            <Link
              href="/signin"
              onClick={() => router.push('/admin/signin')}
              className="text-orange-600 hover:underline ml-1"
            >
              Login
            </Link>
          </Text>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;