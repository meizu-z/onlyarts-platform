import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast'; // 🆕
import { useFormValidation, validators } from '../utils/formValidation'; // 🆕
import { InlineError } from '../components/ui/ErrorStates'; // 🆕
import { ButtonLoading } from '../components/ui/LoadingStates'; // 🆕
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Card from '../components/common/Card';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast(); // 🆕
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 🆕 Form validation
  const { values, errors, touched, handleChange, handleBlur, validateAll } = useFormValidation(
    { 
      username: '',
      password: '',
      rememberMe: false
    },
    {
      username: validators.required,
      password: validators.required
    }
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateAll()) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);

    try {
      const result = await login(values.username, values.password);

      if (result.success) {
        toast.success('Login successful! Welcome back 🎨');
        setTimeout(() => navigate('/dashboard'), 500);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-purple-900/10 via-[#1a1a1a] to-pink-900/10">
      <div className="w-full max-w-md">
        <Card className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#f2e9dd] mb-2">Welcome Back</h1>
            <p className="text-[#f2e9dd]/70">Log in to your OnlyArts account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Input
                label="Email or Username"
                type="text"
                name="username"
                value={values.username}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter your email or username"
                autoComplete="username"
                className={touched.username && errors.username ? 'border-red-500' : ''}
              />
              <InlineError message={touched.username ? errors.username : null} />
            </div>

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter your password"
                autoComplete="current-password"
                className={touched.password && errors.password ? 'border-red-500' : ''}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[42px] text-[#f2e9dd]/50 hover:text-[#f2e9dd] transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
              <InlineError message={touched.password ? errors.password : null} />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-[#f2e9dd]/70 cursor-pointer">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={values.rememberMe}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-white/10 bg-[#121212] text-purple-600 focus:ring-purple-500"
                />
                Remember me
              </label>
              <button 
                type="button" 
                className="text-purple-400 hover:text-purple-300 transition-colors"
                onClick={() => toast.info('Password reset feature coming soon!')}
              >
                Forgot password?
              </button>
            </div>

            <ButtonLoading
              type="submit" 
              loading={isLoading}
              className="w-full py-3 bg-gradient-to-r from-[#7C5FFF] to-[#FF5F9E] text-white rounded-lg hover:shadow-lg hover:shadow-[#7C5FFF]/30 transition-all duration-300 transform hover:scale-105"
            >
              {isLoading ? 'Logging in...' : 'Log In'}
            </ButtonLoading>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#121212] text-[#f2e9dd]/50">or continue with</span>
              </div>
            </div>

            <div className="space-y-3">
              <Button 
                type="button" 
                variant="secondary" 
                fullWidth
                onClick={() => toast.info('Google login coming soon!')}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </Button>

              <Button 
                type="button" 
                variant="secondary" 
                fullWidth
                onClick={() => toast.info('Apple login coming soon!')}
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.09l-.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                Continue with Apple
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-[#f2e9dd]/70">
              Don't have an account?{' '}
              <Link to="/register" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
                Sign up
              </Link>
            </p>
          </div>

          <div className="mt-6 p-4 bg-purple-600/10 border border-purple-500/30 rounded-lg">
            <p className="text-sm text-purple-400 font-medium mb-2">Demo Credentials:</p>
            <p className="text-xs text-[#f2e9dd]/70">
              Username: <span className="text-purple-400 font-mono">mz123</span><br />
              Password: <span className="text-purple-400 font-mono">12345</span>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export { LoginPage };