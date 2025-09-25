// API service layer for handling HTTP requests
import { PujaCard, User } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Get auth token from localStorage if available
    let authHeader = null;
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      const tokenType = localStorage.getItem('token_type') || 'Bearer';
      if (token) {
        authHeader = `${tokenType} ${token}`;
      }
    }
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader ? { 'Authorization': authHeader } : {}),
        ...options?.headers,
      },
      ...options,
    };

    console.log(`Making API request to: ${url}`);
    if (authHeader) {
      console.log('Using authorization header');
    }
    
    const response = await fetch(url, config);
    
    if (!response.ok) {
      // Try to parse error response as JSON
      try {
        const errorText = await response.text();
        let errorMessage = `API Error: ${response.status} ${response.statusText}`;
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.detail || errorMessage;
        } catch {
          // If parsing fails, use the raw error text if available
          if (errorText) errorMessage += ` - ${errorText}`;
        }
        
        throw new Error(errorMessage);
      } catch {
        // If any error occurs during error handling, throw the original error
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
    }
    
    return response.json();
  }

  // Auth API methods
  async login(email: string, password: string, clientId: string = '', clientSecret: string = ''): Promise<User> {
    const loginUrl = `${API_BASE_URL.replace(/\/api$/, '')}/auth/token`;
    
    // Create form data for OAuth2 token request
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);
    formData.append('grant_type', 'password');
    formData.append('scope', '');
    formData.append('client_id', clientId); // Add client ID if provided
    formData.append('client_secret', clientSecret); // Add client secret if provided
    
    console.log('Login URL:', loginUrl);
    console.log('Form data:', formData.toString());
    
    try {
      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Login failed: ${response.status} ${response.statusText}`;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.detail || errorData.error_description || errorData.error || errorMessage;
        } catch {
          // If parsing fails, use the raw error text
          if (errorText) errorMessage += ` - ${errorText}`;
        }
        throw new Error(errorMessage);
      }

      const tokenData = await response.json();
      console.log('Token response:', JSON.stringify(tokenData, null, 2));
      
      // Return a minimal user object with the token
      return {
        id: 0, // Placeholder ID
        email,
        name: email.split('@')[0], // Use email username as display name
        isAuthenticated: true,
        access_token: tokenData.access_token,
        token_type: tokenData.token_type || 'Bearer',
      } as User;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async signup(name: string, email: string, mobile: string, password: string, role: string = 'user'): Promise<User> {
    return this.request<User>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, mobile, password, role }),
    });
  }

  async register(email: string, password: string, name?: string): Promise<User> {
    // Keep for backward compatibility
    return this.signup(name || '', email, '', password);
  }

  async logout(): Promise<void> {
    return this.request<void>('/auth/logout', {
      method: 'POST',
    });
  }

  // Puja API methods
  async getPujas(): Promise<PujaCard[]> {
    return this.request<PujaCard[]>('/pujas');
  }

  async getPujaById(id: string): Promise<PujaCard> {
    return this.request<PujaCard>(`/pujas/${id}`);
  }

  async createPuja(puja: Omit<PujaCard, 'id'>): Promise<PujaCard> {
    return this.request<PujaCard>('/pujas', {
      method: 'POST',
      body: JSON.stringify(puja),
    });
  }

  async updatePuja(id: string, puja: Partial<PujaCard>): Promise<PujaCard> {
    return this.request<PujaCard>(`/pujas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(puja),
    });
  }

  async deletePuja(id: string): Promise<void> {
    return this.request<void>(`/pujas/${id}`, {
      method: 'DELETE',
    });
  }
}

export const apiService = new ApiService();