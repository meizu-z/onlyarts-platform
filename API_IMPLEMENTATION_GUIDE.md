# API Implementation Guide - OnlyArts Platform

This guide explains how to use the new API infrastructure that has been set up for the OnlyArts platform.

## 📁 File Structure

```
src/
├── config/
│   └── api.config.js          # API configuration and endpoints
├── services/
│   ├── api.client.js          # Axios instance with interceptors
│   ├── auth.service.js        # Authentication API calls
│   ├── user.service.js        # User profile API calls
│   ├── artwork.service.js     # Artwork API calls
│   └── index.js               # Central export point
├── utils/
│   └── errorHandler.js        # Error handling utilities
├── hooks/
│   └── useApi.js              # React hooks for API calls
└── .env                       # Environment variables
```

## 🚀 Quick Start

### 1. Environment Setup

The `.env` file has been created with default values:

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_API_TIMEOUT=10000
VITE_TOKEN_KEY=onlyarts_token
VITE_REFRESH_TOKEN_KEY=onlyarts_refresh_token
```

**Update the `VITE_API_BASE_URL`** to point to your actual backend API.

### 2. Basic API Call

```javascript
import { authService } from '../services';

// Simple API call
const login = async (email, password) => {
  try {
    const data = await authService.login(email, password);
    console.log('Login successful:', data);
  } catch (error) {
    console.error('Login failed:', error.message);
  }
};
```

### 3. Using the useApi Hook

```javascript
import { useApi } from '../hooks/useApi';
import { authService } from '../services';

function LoginForm() {
  const { loading, error, execute } = useApi(authService.login, {
    showSuccessToast: true,
    successMessage: 'Login successful!',
    onSuccess: (data) => {
      // Save token and user data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      // Redirect to dashboard
      navigate('/dashboard');
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await execute(email, password);
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <p className="error">{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

## 📚 Available Services

### Authentication Service

```javascript
import { authService } from '../services';

// Login
const data = await authService.login(email, password);

// Register
const data = await authService.register({
  email,
  password,
  displayName,
  username
});

// Logout
await authService.logout();

// Forgot Password
await authService.forgotPassword(email);

// Reset Password
await authService.resetPassword(token, newPassword);

// Verify Email
await authService.verifyEmail(token);
```

### User Service

```javascript
import { userService } from '../services';

// Get Profile
const profile = await userService.getProfile();

// Update Profile
const updated = await userService.updateProfile({
  displayName: 'New Name',
  bio: 'New bio...'
});

// Upload Avatar
const result = await userService.uploadAvatar(file, (progressEvent) => {
  const percentCompleted = Math.round(
    (progressEvent.loaded * 100) / progressEvent.total
  );
  console.log(`Upload progress: ${percentCompleted}%`);
});

// Change Password
await userService.changePassword(currentPassword, newPassword);
```

### Artwork Service

```javascript
import { artworkService } from '../services';

// Get Artworks (with pagination)
const { artworks, total } = await artworkService.getArtworks({
  page: 1,
  limit: 10,
  category: 'digital'
});

// Get Single Artwork
const artwork = await artworkService.getArtwork(artworkId);

// Create Artwork (with image upload)
const newArtwork = await artworkService.createArtwork(
  {
    title: 'My Artwork',
    description: 'Description...',
    category: 'digital',
    price: 1000
  },
  imageFile,
  (progressEvent) => {
    console.log('Upload progress:', progressEvent);
  }
);

// Like Artwork
await artworkService.likeArtwork(artworkId);

// Add Comment
const comment = await artworkService.addComment(artworkId, 'Great work!');
```

## 🎣 React Hooks

### useApi Hook

For manual API calls:

```javascript
import { useApi } from '../hooks/useApi';
import { artworkService } from '../services';

function CreateArtwork() {
  const { loading, error, execute } = useApi(artworkService.createArtwork, {
    showSuccessToast: true,
    successMessage: 'Artwork created successfully!',
    onSuccess: (artwork) => {
      navigate(`/artwork/${artwork.id}`);
    },
  });

  const handleCreate = async (artworkData, imageFile) => {
    await execute(artworkData, imageFile);
  };

  return (
    <div>
      {error && <Alert type="error">{error}</Alert>}
      <button onClick={handleCreate} disabled={loading}>
        {loading ? 'Creating...' : 'Create Artwork'}
      </button>
    </div>
  );
}
```

### useApiOnMount Hook

For loading data on component mount:

```javascript
import { useApiOnMount } from '../hooks/useApi';
import { artworkService } from '../services';

function ArtworkPage({ id }) {
  const { data: artwork, loading, error, refetch } = useApiOnMount(
    () => artworkService.getArtwork(id),
    [id], // Dependencies
    {
      showErrorToast: true,
    }
  );

  if (loading) return <LoadingPaint />;
  if (error) return <ErrorState message={error} retry={refetch} />;

  return <div>{artwork.title}</div>;
}
```

### usePaginatedApi Hook

For paginated data:

```javascript
import { usePaginatedApi } from '../hooks/useApi';
import { artworkService } from '../services';

function ArtworkList() {
  const {
    data: artworks,
    loading,
    page,
    totalPages,
    hasNextPage,
    hasPrevPage,
    nextPage,
    prevPage,
    goToPage,
  } = usePaginatedApi(artworkService.getArtworks, {
    initialPage: 1,
    initialLimit: 12,
  });

  return (
    <div>
      {artworks.map(artwork => (
        <ArtworkCard key={artwork.id} artwork={artwork} />
      ))}

      <Pagination
        page={page}
        totalPages={totalPages}
        onNext={nextPage}
        onPrev={prevPage}
        onGoTo={goToPage}
        hasNext={hasNextPage}
        hasPrev={hasPrevPage}
      />
    </div>
  );
}
```

## 🔐 Authentication Flow

The API client automatically handles authentication:

1. **Storing Tokens**: Save tokens after login
```javascript
// After successful login
localStorage.setItem('onlyarts_token', data.token);
localStorage.setItem('onlyarts_refresh_token', data.refreshToken);
```

2. **Automatic Token Injection**: All requests automatically include the token in headers

3. **Token Refresh**: If a 401 error occurs, the client automatically attempts to refresh the token

4. **Auto Logout**: If refresh fails, tokens are cleared and user is redirected to login

## 🛠 Error Handling

### Using Error Handler Utilities

```javascript
import { getErrorMessage, isNetworkError, isAuthError } from '../utils/errorHandler';

try {
  await artworkService.createArtwork(data);
} catch (error) {
  const message = getErrorMessage(error);

  if (isNetworkError(error)) {
    toast.error('No internet connection');
  } else if (isAuthError(error)) {
    toast.error('Please login again');
    navigate('/login');
  } else {
    toast.error(message);
  }
}
```

## 📤 File Uploads

### Single File Upload

```javascript
import { userService } from '../services';

const handleAvatarUpload = async (file) => {
  const result = await userService.uploadAvatar(
    file,
    (progressEvent) => {
      const percent = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total
      );
      setUploadProgress(percent);
    }
  );

  console.log('Upload complete:', result.url);
};
```

### Multiple Files (Artwork with Image)

```javascript
import { artworkService } from '../services';

const handleCreateArtwork = async (formData, imageFile) => {
  const artwork = await artworkService.createArtwork(
    {
      title: formData.title,
      description: formData.description,
      price: formData.price,
    },
    imageFile,
    (progressEvent) => {
      setUploadProgress(
        Math.round((progressEvent.loaded * 100) / progressEvent.total)
      );
    }
  );

  return artwork;
};
```

## 🔄 Updating Existing Components

### Example: Updating LoginPage

**Before:**
```javascript
const handleLogin = (e) => {
  e.preventDefault();
  // Mock login with hardcoded users
  const mockUser = mockUsers.find(u => u.email === email);
  if (mockUser && password === 'password') {
    login(mockUser);
  } else {
    toast.error('Invalid credentials');
  }
};
```

**After:**
```javascript
import { useApi } from '../hooks/useApi';
import { authService } from '../services';

const { loading, error, execute } = useApi(authService.login, {
  showSuccessToast: true,
  successMessage: 'Welcome back!',
  onSuccess: (data) => {
    login(data.user); // Update AuthContext
    navigate('/dashboard');
  },
});

const handleLogin = async (e) => {
  e.preventDefault();
  await execute(email, password);
};
```

## 🧪 Testing with Mock Backend

Until your backend is ready, you can:

1. **Use a mock API server** like [json-server](https://github.com/typicode/json-server)
2. **Intercept requests** with [MSW (Mock Service Worker)](https://mswjs.io/)
3. **Mock the services** in development:

```javascript
// For development only
if (import.meta.env.DEV && !import.meta.env.VITE_API_BASE_URL) {
  authService.login = async (email, password) => {
    // Return mock data
    return {
      user: { email, displayName: 'Test User' },
      token: 'mock-token',
      refreshToken: 'mock-refresh-token',
    };
  };
}
```

## 📝 Adding New Services

To add a new service (e.g., for exhibitions):

1. Create the service file:

```javascript
// src/services/exhibition.service.js
import { api } from './api.client';
import { API_ENDPOINTS } from '../config/api.config';

export const exhibitionService = {
  getExhibitions: async (params = {}) => {
    const response = await api.get(API_ENDPOINTS.exhibitions.list, { params });
    return response.data;
  },

  createExhibition: async (data) => {
    const response = await api.post(API_ENDPOINTS.exhibitions.create, data);
    return response.data;
  },

  // Add more methods...
};
```

2. Export from services/index.js:

```javascript
export { exhibitionService } from './exhibition.service';
```

3. Use in components:

```javascript
import { exhibitionService } from '../services';

const exhibitions = await exhibitionService.getExhibitions();
```

## 🎯 Next Steps

1. **Update your backend URL** in `.env`
2. **Start migrating pages** to use the new API infrastructure
3. **Replace mock data** with real API calls
4. **Add more service modules** as needed
5. **Implement real authentication** in AuthContext

## 📞 Support

For questions or issues with the API implementation, refer to:
- `/src/services/` - Service implementations
- `/src/hooks/useApi.js` - React hook documentation
- `/src/utils/errorHandler.js` - Error handling utilities

Happy coding! 🎨
