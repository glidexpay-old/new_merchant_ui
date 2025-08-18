# Login Page Migration Plan

## Overview
This document outlines the migration strategy for the login page from React Router to Next.js 14 with authentication flow and API integration.

## Current Implementation Analysis

### File Location
- **New**: `src/app/(auth)/login/page.tsx`

### Current Dependencies
```javascript
// Current imports
import { useState, useContext, Fragment } from 'react'
import { useDispatch } from 'react-redux'
import { useForm } from 'react-hook-form'
import { toast, Slide } from 'react-toastify'
import { handleOtpVerification, handleLogin } from '@store/actions/auth'
import useEazy from '@src/auth/eazy/useEazy'
import ReCAPTCHA from "react-google-recaptcha-enterprise"
import { Link, useHistory } from 'react-router-dom'
import InputPasswordToggle from '@components/input-password-toggle'
import { Row, Col, CardTitle, CardText, Form, Input, FormGroup, Label, Button } from 'reactstrap'
```

## API Endpoints Analysis

### Login API
- **Method**: POST
- **Base URL**: `http://13.233.149.65:8081/` (from linkConfigs.js)
- **Full URL**: `http://13.233.149.65:8081/user/login`

### Request Payload
```typescript
interface LoginRequest {
  userNameOrEmail: string
  password: string
  ipAddress: string
  captchaToken: string
  userAgent: string
}
```

### Response Structure
```typescript
interface LoginResponse {
  successCode: string
  extraData: {
    LoginData?: {
      jwtToken: string
      uuid: string
      merchantId: string
      payoutFlag: string
    }
    merchantSignUp?: {
      otpSessionId: string
    }
  }
  exception?: string
  msg?: string[]
}
```

### OTP Verification API
- **Method**: PUT
- **Full URL**: `http://13.233.149.65:8081/user/verify/otp?otp={otpCode}`

### ReCAPTCHA Configuration
- **Site Key**: `6LfmI-4pAAAAAJtMH_PxevWfR9eFkG1G0QQheYkA`
- **Type**: Google reCAPTCHA Enterprise

## New Implementation Structure

### Page Component
**Location**: `src/app/(auth)/login/page.tsx`

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAppDispatch } from '@/store/hooks'
import { loginUser } from '@/store/slices/auth-slice'
import { LoginForm } from '@/components/forms/login-form'
import { Card } from '@/components/ui/card'
import { toast } from '@/components/ui/toast'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  captchaToken: z.string().min(1, 'Please verify you are human')
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const dispatch = useAppDispatch()

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      captchaToken: ''
    }
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    try {
      const result = await dispatch(loginUser({
        userNameOrEmail: data.email,
        password: "AnyPass123!",
        ipAddress: "127.0.0.1",
        captchaToken: data.captchaToken,
        userAgent: navigator.userAgent
      })).unwrap()

      if (result.requiresOTP) {
        router.push('/verify-otp')
        toast.success('OTP sent to your email')
      } else {
        router.push('/dashboard')
        toast.success('Login successful')
      }
    } catch (error) {
      toast.error(error.message || 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-blue-900">
            Welcome to GlideXPay! 👋
          </h2>
          <p className="text-gray-600 mt-2">
            Please sign-in to your account
          </p>
        </div>
        
        <Card className="p-6">
          <LoginForm
            form={form}
            onSubmit={onSubmit}
            isLoading={isLoading}
          />
        </Card>
      </div>
    </div>
  )
}
```

### Auth Layout
**Location**: `src/app/(auth)/layout.tsx`

```typescript
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="absolute inset-0 bg-white bg-opacity-75" />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}
```

### Login Form Component
**Location**: `src/components/forms/login-form.tsx`

```typescript
'use client'

import { useState } from 'react'
import { UseFormReturn } from 'react-hook-form'
import ReCAPTCHA from 'react-google-recaptcha-enterprise'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PasswordInput } from '@/components/ui/password-input'

interface LoginFormProps {
  form: UseFormReturn<LoginFormData>
  onSubmit: (data: LoginFormData) => void
  isLoading: boolean
}

export function LoginForm({ form, onSubmit, isLoading }: LoginFormProps) {
  const [captchaToken, setCaptchaToken] = useState<string>('')

  const { register, handleSubmit, formState: { errors }, setValue } = form

  const onCaptchaChange = (token: string | null) => {
    if (token) {
      setCaptchaToken(token)
      setValue('captchaToken', token)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="john@example.com"
          {...register('email')}
          error={errors.email?.message}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <PasswordInput
          id="password"
          placeholder="Enter your password"
          {...register('password')}
          error={errors.password?.message}
        />
      </div>

      <div className="flex justify-center">
        <ReCAPTCHA
          sitekey="6LfmI-4pAAAAAJtMH_PxevWfR9eFkG1G0QQheYkA"
          onChange={onCaptchaChange}
          theme="light"
        />
      </div>

      <Button
        type="submit"
        className="w-full"
        loading={isLoading}
        disabled={!captchaToken || isLoading}
      >
        Sign In
      </Button>
    </form>
  )
}
```

## Redux Toolkit Slice

### Auth Slice
**Location**: `src/store/slices/auth-slice.ts`

```typescript
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { authAPI } from '@/lib/api'

interface LoginPayload {
  userNameOrEmail: string
  password: string
  ipAddress: string
  captchaToken: string
  userAgent: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  requiresOTP: boolean
  otpData: any | null
}

export const loginUser = createAsyncThunk(
  'auth/login',
  async (payload: LoginPayload, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(payload)
      
      if (response.data.successCode === 'API_SUCCESS') {
        if (response.data.extraData.LoginData) {
          // Direct login success
          return {
            user: response.data.extraData.LoginData,
            token: response.data.extraData.LoginData.jwtToken,
            requiresOTP: false
          }
        } else {
          // Requires OTP verification
          return {
            requiresOTP: true,
            otpData: {
              userNameOrEmail: payload.userNameOrEmail,
              password: payload.password,
              ipAddress: payload.ipAddress,
              otpSessionId: response.data.extraData.merchantSignUp.otpSessionId
            }
          }
        }
      } else {
        throw new Error(response.data.msg?.[0] || 'Login failed')
      }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.otpData = null
      state.requiresOTP = false
      // Clear secure storage
      localStorage.removeItem('accessToken')
      localStorage.removeItem('userData')
    },
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false
        if (action.payload.requiresOTP) {
          state.requiresOTP = true
          state.otpData = action.payload.otpData
        } else {
          state.user = action.payload.user
          state.token = action.payload.token
          state.isAuthenticated = true
          // Store in secure storage
          localStorage.setItem('accessToken', action.payload.token)
          localStorage.setItem('userData', JSON.stringify(action.payload.user))
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  }
})

export const { logout, clearError } = authSlice.actions
export default authSlice.reducer
```

## API Configuration

### Base API Configuration
**Location**: `src/lib/api.ts`

```typescript
import axios from 'axios'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://13.233.149.65:8081/'

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Token ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle token expiration
      localStorage.removeItem('accessToken')
      localStorage.removeItem('userData')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  login: (payload: LoginPayload) => api.post('user/login', payload),
  verifyOTP: (otp: string, sessionData: any) => 
    api.put(`user/verify/otp?otp=${otp}`, sessionData.payload, {
      headers: {
        OTPSessionId: sessionData.otpSessionId
      }
    }),
  resendOTP: (email: string) => api.put(`user/resend/otp?email=${email}`)
}

export default api
```

## Environment Configuration

### Environment Variables
**Location**: `.env.local`

```bash
NEXT_PUBLIC_API_BASE_URL=http://13.233.149.65:8081/
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6LfmI-4pAAAAAJtMH_PxevWfR9eFkG1G0QQheYkA
```

## Middleware for Protected Routes

### Auth Middleware
**Location**: `src/middleware.ts`

```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value
  const isAuthPage = request.nextUrl.pathname.startsWith('/(auth)')
  const isProtectedPage = request.nextUrl.pathname.startsWith('/(dashboard)')

  if (isProtectedPage && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
```

## Testing Strategy

### Unit Tests
```typescript
// __tests__/login.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { store } from '@/store'
import LoginPage from '@/app/(auth)/login/page'

describe('Login Page', () => {
  it('renders login form correctly', () => {
    render(
      <Provider store={store}>
        <LoginPage />
      </Provider>
    )
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('shows validation errors for invalid inputs', async () => {
    // Test validation logic
  })

  it('submits form with valid data', async () => {
    // Test form submission
  })
})
```

## Migration Checklist

### Phase 1: Setup
- [ ] Create auth layout and login page structure
- [ ] Set up Redux Toolkit auth slice
- [ ] Configure API client with interceptors
- [ ] Add environment variables

### Phase 2: Components
- [ ] Create login form component
- [ ] Implement password input with toggle
- [ ] Add ReCAPTCHA integration
- [ ] Style with Tailwind CSS (blue-white theme)

### Phase 3: Logic
- [ ] Implement login API call
- [ ] Add form validation with Zod
- [ ] Handle different response scenarios
- [ ] Add error handling and toast notifications

### Phase 4: Security
- [ ] Set up middleware for route protection
- [ ] Implement secure token storage
- [ ] Add CSRF protection
- [ ] Configure API security headers

### Phase 5: Testing
- [ ] Write unit tests for components
- [ ] Add integration tests for auth flow
- [ ] Test error scenarios
- [ ] Verify accessibility compliance

This migration plan ensures a secure, modern authentication system while maintaining all existing functionality and improving the user experience with the new blue-white theme.
