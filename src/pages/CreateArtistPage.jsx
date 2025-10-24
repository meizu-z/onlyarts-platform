import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast'; // 🆕
import { useFormValidation, validators } from '../utils/formValidation'; // 🆕
import { InlineError } from '../components/ui/ErrorStates'; // 🆕
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { Upload } from 'lucide-react';

const CreateArtistPage = () => {
  const { user } = useAuth();
  const toast = useToast(); // 🆕
  const [step, setStep] = useState(1);

  // 🆕 Form validation for step 1
  const { values, errors, touched, handleChange, handleBlur, validateAll } = useFormValidation(
    { 
      artistName: '',
      username: user?.username || '',
      bio: ''
    },
    {
      artistName: validators.artistName,
      username: validators.username,
      bio: validators.bio
    }
  );

  // 🆕 Handle step 1 continue
  const handleStep1Continue = () => {
    if (!validateAll()) {
      toast.error('Please fill in all required fields correctly');
      return;
    }
    setStep(2);
    toast.info('Step 1 complete!');
  };

  // 🆕 Handle final submission
  const handleCreateArtist = () => {
    toast.success('Artist profile created successfully! 🎨');
    // Navigate to profile or dashboard
    setTimeout(() => {
      window.location.href = '/profile/' + values.username;
    }, 1500);
  };

  return (
    <div className="flex-1 max-w-4xl mx-auto">
      <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#f2e9dd] mb-2 md:mb-4">Create Your Artist Page</h1>
      <p className="text-sm md:text-base text-[#f2e9dd]/70 mb-4 md:mb-8">Showcase your artwork and connect with collectors</p>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-6 md:mb-12">
        {[1, 2, 3].map(num => (
          <div key={num} className="flex items-center flex-1">
            <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-sm md:text-base font-bold transition-all duration-300 transform ${
              step >= num
                ? 'bg-gradient-to-r from-[#7C5FFF] to-[#FF5F9E] text-white shadow-lg shadow-[#7C5FFF]/30 scale-110'
                : 'bg-[#121212] text-[#f2e9dd]/50 scale-100'
            }`}>
              {num}
            </div>
            {num < 3 && (
              <div className={`flex-1 h-0.5 md:h-1 mx-1 md:mx-2 transition-all duration-500 ${
                step > num
                  ? 'bg-gradient-to-r from-[#7C5FFF] to-[#FF5F9E] shadow-lg shadow-[#7C5FFF]/30'
                  : 'bg-[#121212]'
              }`}></div>
            )}
          </div>
        ))}
      </div>

      <Card className="p-4 md:p-6 lg:p-8 animate-fadeIn">
        {step === 1 && (
          <div className="space-y-4 md:space-y-6">
            <h2 className="text-xl md:text-2xl font-bold text-[#f2e9dd]">Basic Information</h2>
            
            <div>
              <Input 
                label="Artist Name *"
                name="artistName"
                value={values.artistName}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Your artist name"
                className={touched.artistName && errors.artistName ? 'border-red-500' : ''}
              />
              <InlineError message={touched.artistName ? errors.artistName : null} />
            </div>

            <div>
              <Input 
                label="Username *"
                name="username"
                value={values.username}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="@yourhandle"
                className={touched.username && errors.username ? 'border-red-500' : ''}
              />
              <InlineError message={touched.username ? errors.username : null} />
            </div>

            <div>
              <label className="block text-sm text-[#f2e9dd]/70 mb-2">Bio</label>
              <textarea
                name="bio"
                value={values.bio}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full bg-[#121212] border rounded-lg px-4 py-3 text-[#f2e9dd] focus:outline-none focus:border-[#7C5FFF] focus:ring-2 focus:ring-[#7C5FFF]/20 h-32 transition-all duration-200 ${
                  touched.bio && errors.bio ? 'border-red-500' : 'border-white/10'
                }`}
                placeholder="Tell us about your art..."
              />
              <div className="flex justify-between items-center mt-1">
                {touched.bio && errors.bio ? (
                  <InlineError message={errors.bio} />
                ) : (
                  <span className="text-sm text-[#f2e9dd]/50">{values.bio.length}/500</span>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
              <Button
                onClick={handleStep1Continue}
                className="w-full sm:w-auto bg-gradient-to-r from-[#7C5FFF] to-[#FF5F9E] shadow-lg shadow-[#7C5FFF]/30 hover:shadow-[#7C5FFF]/50 transform hover:scale-105 transition-all duration-300"
              >
                Continue
              </Button>
              <Button
                variant="ghost"
                className="w-full sm:w-auto transform hover:scale-105 transition-all duration-200"
                onClick={() => toast.info('Are you sure you want to cancel?')}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 md:space-y-6">
            <h2 className="text-xl md:text-2xl font-bold text-[#f2e9dd]">Upload Images</h2>

            <div>
              <label className="block text-xs md:text-sm text-[#f2e9dd]/70 mb-2">Profile Picture</label>
              <div
                className="border-2 border-dashed border-white/20 rounded-lg p-6 md:p-8 text-center hover:border-[#7C5FFF] transition-all duration-300 cursor-pointer group bg-gradient-to-br from-[#7C5FFF]/5 to-[#FF5F9E]/5 hover:from-[#7C5FFF]/10 hover:to-[#FF5F9E]/10"
                onClick={() => toast.info('File upload coming soon!')}
              >
                <Upload className="mx-auto mb-2 text-[#f2e9dd]/50 group-hover:text-[#B15FFF] transform group-hover:scale-110 group-hover:-rotate-12 transition-all duration-300" size={24} />
                <p className="text-sm md:text-base text-[#f2e9dd]/70 group-hover:text-[#f2e9dd] transition-colors">Click to upload or drag and drop</p>
                <p className="text-xs md:text-sm text-[#f2e9dd]/50">PNG, JPG up to 5MB</p>
              </div>
            </div>

            <div>
              <label className="block text-xs md:text-sm text-[#f2e9dd]/70 mb-2">Cover Image</label>
              <div
                className="border-2 border-dashed border-white/20 rounded-lg p-6 md:p-8 text-center hover:border-[#7C5FFF] transition-all duration-300 cursor-pointer group bg-gradient-to-br from-[#7C5FFF]/5 to-[#FF5F9E]/5 hover:from-[#7C5FFF]/10 hover:to-[#FF5F9E]/10"
                onClick={() => toast.info('File upload coming soon!')}
              >
                <Upload className="mx-auto mb-2 text-[#f2e9dd]/50 group-hover:text-[#B15FFF] transform group-hover:scale-110 group-hover:-rotate-12 transition-all duration-300" size={24} />
                <p className="text-sm md:text-base text-[#f2e9dd]/70 group-hover:text-[#f2e9dd] transition-colors">Click to upload or drag and drop</p>
                <p className="text-xs md:text-sm text-[#f2e9dd]/50">PNG, JPG up to 10MB (16:9 recommended)</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
              <Button
                onClick={() => {
                  setStep(3);
                  toast.info('Images uploaded!');
                }}
                className="w-full sm:w-auto bg-gradient-to-r from-[#7C5FFF] to-[#FF5F9E] shadow-lg shadow-[#7C5FFF]/30 hover:shadow-[#7C5FFF]/50 transform hover:scale-105 transition-all duration-300"
              >
                Continue
              </Button>
              <Button
                variant="secondary"
                onClick={() => setStep(1)}
                className="w-full sm:w-auto transform hover:scale-105 transition-all duration-200"
              >
                Back
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 md:space-y-6">
            <h2 className="text-xl md:text-2xl font-bold text-[#f2e9dd]">Commission Settings</h2>

            <label className="flex items-center gap-3 p-3 md:p-4 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group">
              <input type="checkbox" defaultChecked className="w-4 h-4 md:w-5 md:h-5 accent-[#7C5FFF]" />
              <span className="text-sm md:text-base text-[#f2e9dd] group-hover:text-[#B15FFF] transition-colors">Accept commission requests</span>
            </label>

            <div className="space-y-3 md:space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <Input label="Commission Type" placeholder="e.g., Portrait" />
                <Input label="Starting Price (PHP)" placeholder="e.g., 2000" />
              </div>
              <Button
                variant="secondary"
                size="sm"
                className="w-full sm:w-auto transform hover:scale-105 transition-all duration-200"
                onClick={() => toast.info('Add commission type feature coming soon!')}
              >
                + Add Another Type
              </Button>
            </div>

            <Input label="Average Turnaround" placeholder="e.g., 2-3 weeks" />

            <div className="border-t border-white/10 pt-4 md:pt-6 mt-4 md:mt-6">
              <h3 className="text-lg md:text-xl font-bold text-[#f2e9dd] mb-3 md:mb-4">Review & Create</h3>
              <p className="text-sm md:text-base text-[#f2e9dd]/70 mb-4 md:mb-6">
                Your artist page will be created and visible to the OnlyArts community.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
                <Button
                  size="lg"
                  onClick={handleCreateArtist}
                  className="w-full sm:w-auto bg-gradient-to-r from-[#7C5FFF] to-[#FF5F9E] shadow-lg shadow-[#7C5FFF]/30 hover:shadow-[#7C5FFF]/50 transform hover:scale-105 transition-all duration-300"
                >
                  Create Artist Page
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setStep(2)}
                  className="w-full sm:w-auto transform hover:scale-105 transition-all duration-200"
                >
                  Back
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export { CreateArtistPage };