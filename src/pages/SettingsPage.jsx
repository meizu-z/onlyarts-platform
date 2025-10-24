import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import { useFormValidation, validators } from '../utils/formValidation';
import { InlineError } from '../components/ui/ErrorStates';
import { LoadingPaint } from '../components/ui/LoadingStates';
import { APIError } from '../components/ui/ErrorStates';
import { settingsService, mockSettings } from '../services/settings.service';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import { Moon, Sun, Monitor } from 'lucide-react';

// Demo mode flag - set to false when backend is ready
const USE_DEMO_MODE = true;

const SettingsPage = () => {
  const { user, logout } = useAuth();
  const toast = useToast();
  const [activeSection, setActiveSection] = useState('account');
  const [theme, setTheme] = useState('dark');

  // API state management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [settings, setSettings] = useState(null);
  const [privacySettings, setPrivacySettings] = useState({});
  const [notificationSettings, setNotificationSettings] = useState({});

  // Form validation for account settings
  const { values, errors, touched, handleChange, handleBlur, validateAll, setValues } = useFormValidation(
    {
      email: user?.email || '',
      username: user?.username || ''
    },
    {
      email: validators.email,
      username: validators.username
    }
  );

  // Fetch settings on mount
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      // DEMO MODE: Use mock data
      if (USE_DEMO_MODE) {
        await new Promise(resolve => setTimeout(resolve, 500));

        setSettings(mockSettings);
        setPrivacySettings(mockSettings.privacy);
        setNotificationSettings(mockSettings.notifications);
        setTheme(mockSettings.appearance.theme);

        setLoading(false);
        return;
      }

      // REAL API MODE: Call backend
      const response = await settingsService.getSettings();
      setSettings(response.settings);
      setPrivacySettings(response.settings.privacy || {});
      setNotificationSettings(response.settings.notifications || {});
      setTheme(response.settings.appearance?.theme || 'dark');
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError(err.message || 'Failed to load settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const root = document.documentElement;
    
    if (theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else if (theme === 'dark') {
      root.classList.remove('light');
      root.classList.add('dark');
    } else if (theme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.remove('light');
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
        root.classList.add('light');
      }
    }
    
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
  }, []);

  // Handle theme change with toast
  const handleThemeChange = async (newTheme) => {
    const oldTheme = theme;
    setTheme(newTheme);

    try {
      // DEMO MODE: Just show toast
      if (USE_DEMO_MODE) {
        toast.info(`Theme changed to ${newTheme} mode`);
        return;
      }

      // REAL API MODE: Call backend
      await settingsService.updateAppearance({ theme: newTheme });
      toast.info(`Theme changed to ${newTheme} mode`);
    } catch (error) {
      // Revert on error
      setTheme(oldTheme);
      toast.error('Failed to update theme. Please try again.');
    }
  };

  // Handle save account settings
  const handleSaveAccount = async () => {
    if (!validateAll()) {
      toast.error('Please fix the errors before saving');
      return;
    }

    try {
      // DEMO MODE: Just show toast
      if (USE_DEMO_MODE) {
        toast.success('Account settings saved successfully!');
        return;
      }

      // REAL API MODE: Call backend
      await settingsService.updateAccount({
        email: values.email,
        username: values.username,
      });
      toast.success('Account settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save account settings. Please try again.');
    }
  };

  // Handle save privacy settings
  const handleSavePrivacy = async () => {
    try {
      // DEMO MODE: Just show toast
      if (USE_DEMO_MODE) {
        toast.success('Privacy settings updated!');
        return;
      }

      // REAL API MODE: Call backend
      await settingsService.updatePrivacy(privacySettings);
      toast.success('Privacy settings updated!');
    } catch (error) {
      toast.error('Failed to update privacy settings. Please try again.');
    }
  };

  // Handle save notifications
  const handleSaveNotifications = async () => {
    try {
      // DEMO MODE: Just show toast
      if (USE_DEMO_MODE) {
        toast.success('Notification preferences saved!');
        return;
      }

      // REAL API MODE: Call backend
      await settingsService.updateNotifications(notificationSettings);
      toast.success('Notification preferences saved!');
    } catch (error) {
      toast.error('Failed to save notification preferences. Please try again.');
    }
  };

  const themeOptions = [
    {
      value: 'light',
      label: 'Light',
      icon: <Sun size={24} />,
      description: 'Always light mode'
    },
    {
      value: 'dark',
      label: 'Dark',
      icon: <Moon size={24} />,
      description: 'Always dark mode'
    },
    {
      value: 'auto',
      label: 'Auto',
      icon: <Monitor size={24} />,
      description: 'Matches system'
    }
  ];

  if (loading) {
    return (
      <div className="flex-1">
        <LoadingPaint message="Loading settings..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1">
        <APIError error={error} retry={fetchSettings} />
      </div>
    );
  }

  return (
    <div className="flex-1">
      <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#f2e9dd] mb-4 md:mb-8">Settings</h1>

      <div className="grid md:grid-cols-4 gap-4 md:gap-8">
        {/* Settings Nav */}
        <div className="flex md:flex-col overflow-x-auto md:overflow-x-visible space-x-2 md:space-x-0 md:space-y-2 pb-2 md:pb-0">
          {[
            { key: 'account', label: 'Account' },
            { key: 'privacy', label: 'Privacy' },
            { key: 'notifications', label: 'Notifications' },
            { key: 'appearance', label: 'Appearance' },
            { key: 'billing', label: 'Billing' },
          ].map((section, idx) => (
            <button
              key={section.key}
              onClick={() => setActiveSection(section.key)}
              className={`flex-shrink-0 md:w-full text-left px-3 md:px-4 py-2 md:py-3 rounded-lg transition-all duration-300 transform hover:scale-105 animate-fadeIn ${
                activeSection === section.key
                  ? 'bg-gradient-to-r from-[#7C5FFF]/20 to-[#FF5F9E]/20 text-[#f2e9dd] border border-[#7C5FFF]/30 shadow-lg shadow-[#7C5FFF]/20'
                  : 'text-[#f2e9dd]/70 hover:bg-white/5'
              }`}
              style={{ animationDelay: `${idx * 0.05}s` }}
            >
              {section.label}
            </button>
          ))}
        </div>

        {/* Settings Content */}
        <div className="md:col-span-3">
          <Card className="p-4 md:p-6 lg:p-8 animate-fadeIn">
            {activeSection === 'account' && (
              <div className="space-y-4 md:space-y-6">
                <h2 className="text-xl md:text-2xl font-bold text-[#f2e9dd] mb-4 md:mb-6">Account Settings</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-[#f2e9dd]/70 mb-2">Email</label>
                    <div className="flex flex-col md:flex-row gap-2 md:gap-3">
                      <div className="flex-1">
                        <Input
                          name="email"
                          value={values.email}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={touched.email && errors.email ? 'border-red-500' : ''}
                        />
                        {/* 🆕 Inline error */}
                        <InlineError message={touched.email ? errors.email : null} />
                      </div>
                      <Button
                        variant="secondary"
                        className="w-full md:w-auto transform hover:scale-105 transition-all duration-200"
                        onClick={() => toast.info('Email change feature coming soon!')}
                      >
                        Change
                      </Button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-[#f2e9dd]/70 mb-2">Username</label>
                    <div className="flex flex-col md:flex-row gap-2 md:gap-3">
                      <div className="flex-1">
                        <Input
                          name="username"
                          value={values.username}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={touched.username && errors.username ? 'border-red-500' : ''}
                        />
                        {/* 🆕 Inline error */}
                        <InlineError message={touched.username ? errors.username : null} />
                      </div>
                      <Button
                        variant="secondary"
                        className="w-full md:w-auto transform hover:scale-105 transition-all duration-200"
                        onClick={() => toast.info('Username change feature coming soon!')}
                      >
                        Change
                      </Button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-[#f2e9dd]/70 mb-2">Password</label>
                    <div className="flex flex-col md:flex-row gap-2 md:gap-3">
                      <Input type="password" value="••••••••" disabled className="flex-1" />
                      <Button
                        variant="secondary"
                        className="w-full md:w-auto transform hover:scale-105 transition-all duration-200"
                        onClick={() => toast.info('Password change feature coming soon!')}
                      >
                        Change
                      </Button>
                    </div>
                  </div>
                </div>

                {/* 🆕 Save button */}
                <Button
                  onClick={handleSaveAccount}
                  className="w-full md:w-auto bg-gradient-to-r from-[#7C5FFF] to-[#FF5F9E] shadow-lg shadow-[#7C5FFF]/30 hover:shadow-[#7C5FFF]/50 transform hover:scale-105 transition-all duration-300"
                >
                  Save Changes
                </Button>

                <div className="pt-6 border-t border-white/10">
                  <h3 className="text-red-400 font-bold mb-4">Danger Zone</h3>
                  <div className="space-y-3">
                    <Button 
                      variant="danger" 
                      className="w-full transform hover:scale-105 transition-all duration-200"
                      onClick={() => toast.error('Account deactivation coming soon')}
                    >
                      Deactivate Account
                    </Button>
                    <Button 
                      variant="danger" 
                      className="w-full transform hover:scale-105 transition-all duration-200"
                      onClick={() => toast.error('Account deletion requires verification')}
                    >
                      Delete Account
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'appearance' && (
              <div className="space-y-4 md:space-y-6">
                <h2 className="text-xl md:text-2xl font-bold text-[#f2e9dd] mb-4 md:mb-6">Appearance</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-[#f2e9dd]/70 mb-3">Theme</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {themeOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleThemeChange(option.value)}
                          className={`p-6 rounded-lg border transition-all duration-300 transform hover:scale-105 ${
                            theme === option.value
                              ? 'bg-gradient-to-br from-[#7C5FFF]/20 to-[#FF5F9E]/20 border-[#7C5FFF]/50 text-[#f2e9dd] shadow-lg shadow-[#7C5FFF]/20'
                              : 'border-white/10 text-[#f2e9dd]/50 hover:border-[#7C5FFF]/30'
                          }`}
                        >
                          <div className={`mb-3 ${theme === option.value ? 'text-[#B15FFF]' : ''}`}>
                            {option.icon}
                          </div>
                          <div className="font-bold mb-1">{option.label}</div>
                          <div className="text-xs opacity-70">{option.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-white/5 rounded-lg">
                    <p className="text-sm text-[#f2e9dd]/70 mb-2">Preview:</p>
                    <p className="text-[#f2e9dd]">Current theme: <span className="font-bold capitalize">{theme}</span></p>
                    {theme === 'auto' && (
                      <p className="text-xs text-[#f2e9dd]/50 mt-1">
                        Theme will change based on your system preferences
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'privacy' && (
              <div className="space-y-4 md:space-y-6">
                <h2 className="text-xl md:text-2xl font-bold text-[#f2e9dd] mb-4 md:mb-6">Privacy Settings</h2>
                <div className="space-y-4">
                  {[
                    { key: 'showProfile', label: 'Show profile to public' },
                    { key: 'allowMessages', label: 'Allow messages from non-followers' },
                    { key: 'showActivityStatus', label: 'Show activity status' },
                    { key: 'showInSearch', label: 'Show in search results' }
                  ].map((setting, idx) => (
                    <label key={idx} className="flex items-center justify-between p-4 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group">
                      <span className="text-[#f2e9dd] group-hover:text-[#B15FFF] transition-colors">{setting.label}</span>
                      <input
                        type="checkbox"
                        checked={privacySettings[setting.key] || false}
                        onChange={(e) => setPrivacySettings({ ...privacySettings, [setting.key]: e.target.checked })}
                        className="toggle"
                      />
                    </label>
                  ))}
                </div>
                <Button
                  onClick={handleSavePrivacy}
                  className="w-full md:w-auto bg-gradient-to-r from-[#7C5FFF] to-[#FF5F9E] shadow-lg shadow-[#7C5FFF]/30 hover:shadow-[#7C5FFF]/50 transform hover:scale-105 transition-all duration-300"
                >
                  Save Changes
                </Button>
              </div>
            )}

            {activeSection === 'notifications' && (
              <div className="space-y-4 md:space-y-6">
                <h2 className="text-xl md:text-2xl font-bold text-[#f2e9dd] mb-4 md:mb-6">Notification Settings</h2>
                <div className="space-y-4">
                  {[
                    { key: 'email', label: 'Email notifications' },
                    { key: 'push', label: 'Push notifications' },
                    { key: 'newFollowers', label: 'New followers' },
                    { key: 'commentsOnArtwork', label: 'Comments on artwork' },
                    { key: 'auctionUpdates', label: 'Auction updates' },
                    { key: 'marketingEmails', label: 'Marketing emails' }
                  ].map((setting, idx) => (
                    <label key={idx} className="flex items-center justify-between p-4 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group">
                      <span className="text-[#f2e9dd] group-hover:text-[#B15FFF] transition-colors">{setting.label}</span>
                      <input
                        type="checkbox"
                        checked={notificationSettings[setting.key] || false}
                        onChange={(e) => setNotificationSettings({ ...notificationSettings, [setting.key]: e.target.checked })}
                        className="toggle"
                      />
                    </label>
                  ))}
                </div>
                <Button
                  onClick={handleSaveNotifications}
                  className="w-full md:w-auto bg-gradient-to-r from-[#7C5FFF] to-[#FF5F9E] shadow-lg shadow-[#7C5FFF]/30 hover:shadow-[#7C5FFF]/50 transform hover:scale-105 transition-all duration-300"
                >
                  Save Changes
                </Button>
              </div>
            )}

            {activeSection === 'billing' && (
              <div className="space-y-4 md:space-y-6">
                <h2 className="text-xl md:text-2xl font-bold text-[#f2e9dd] mb-4 md:mb-6">Billing</h2>
                
                <Card className="p-4 md:p-6 bg-gradient-to-r from-[#7C5FFF]/10 to-[#FF5F9E]/10 border border-[#7C5FFF]/30">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <p className="text-sm text-[#f2e9dd]/70">Current Plan</p>
                      <p className="text-2xl font-bold bg-gradient-to-r from-[#7C5FFF] to-[#FF5F9E] bg-clip-text text-transparent capitalize">
                        {user?.subscription}
                      </p>
                      <p className="text-sm text-[#f2e9dd]/70">₱{user?.subscription === 'premium' ? '249' : '149'}/month</p>
                      <p className="text-sm text-[#f2e9dd]/50 mt-2">Next billing: Nov 19, 2025</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-full md:w-auto transform hover:scale-105 transition-all duration-200"
                        onClick={() => toast.info('Redirecting to subscription plans...')}
                      >
                        Change Plan
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full md:w-auto transform hover:scale-105 transition-all duration-200"
                        onClick={() => toast.error('Are you sure you want to cancel?')}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </Card>

                <div>
                  <h3 className="font-bold text-[#f2e9dd] mb-4">Payment Methods</h3>
                  <Card className="p-4 mb-3 hover:border-[#7C5FFF]/50 transition-all duration-300">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-8 bg-gradient-to-br from-[#7C5FFF] to-[#FF5F9E] rounded shadow-lg"></div>
                        <div>
                          <p className="text-[#f2e9dd]">•••• 4242</p>
                          <p className="text-sm text-[#f2e9dd]/50">Expires 12/2026</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="transform hover:scale-105 transition-all duration-200"
                          onClick={() => toast.info('Edit payment method')}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="transform hover:scale-105 transition-all duration-200"
                          onClick={() => toast.error('Remove payment method?')}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </Card>
                  <Button
                    variant="secondary"
                    className="w-full md:w-auto transform hover:scale-105 transition-all duration-300"
                    onClick={() => toast.info('Add payment method coming soon!')}
                  >
                    + Add Payment Method
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export { SettingsPage };