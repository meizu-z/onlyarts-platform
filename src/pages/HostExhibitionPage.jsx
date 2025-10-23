import React, { useState } from 'react';
import Button from '../components/common/Button';
import MainLayout from '../components/layouts/MainLayout';
import { useToast } from '../components/ui/Toast';

const HostExhibitionPage = () => {
  const [exhibitionType, setExhibitionType] = useState('solo');
  const toast = useToast();

  const handleHostExhibition = () => {
    toast.success(`Your ${exhibitionType} exhibition has been scheduled!`);
    // Here you would typically handle the form submission
  };

  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center h-full">
        <h1 className="text-4xl font-bold mb-8">Host an Exhibition</h1>
        <div className="w-full max-w-md">
          <div className="flex items-center my-4">
            <input
              type="radio"
              id="solo"
              name="exhibitionType"
              value="solo"
              checked={exhibitionType === 'solo'}
              onChange={() => setExhibitionType('solo')}
              className="mr-2"
            />
            <label htmlFor="solo">Solo Exhibition</label>
          </div>
          <div className="flex items-center my-4">
            <input
              type="radio"
              id="collab"
              name="exhibitionType"
              value="collab"
              checked={exhibitionType === 'collab'}
              onChange={() => setExhibitionType('collab')}
              className="mr-2"
            />
            <label htmlFor="collab">Collaboration</label>
          </div>
          <Button onClick={handleHostExhibition} className="w-full mt-4">Host Exhibition</Button>
        </div>
      </div>
    </MainLayout>
  );
};

export default HostExhibitionPage;
