import React, { useState } from 'react';
import Button from '../components/common/Button';
import MainLayout from '../components/layouts/MainLayout';
import { useToast } from '../components/ui/Toast';

const StartLivePage = () => {
  const [liveType, setLiveType] = useState('normal');
  const toast = useToast();

  const handleStartLive = () => {
    toast.success(`Your ${liveType} live stream is starting now!`);
    // Here you would typically handle the form submission
  };

  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center h-full">
        <h1 className="text-4xl font-bold mb-8">Start a Live</h1>
        <div className="w-full max-w-md">
          <div className="flex items-center my-4">
            <input
              type="radio"
              id="normal"
              name="liveType"
              value="normal"
              checked={liveType === 'normal'}
              onChange={() => setLiveType('normal')}
              className="mr-2"
            />
            <label htmlFor="normal">Normal Live</label>
          </div>
          <div className="flex items-center my-4">
            <input
              type="radio"
              id="auction"
              name="liveType"
              value="auction"
              checked={liveType === 'auction'}
              onChange={() => setLiveType('auction')}
              className="mr-2"
            />
            <label htmlFor="auction">Auction</label>
          </div>
          <Button onClick={handleStartLive} className="w-full mt-4">Start Live</Button>
        </div>
      </div>
    </MainLayout>
  );
};

export default StartLivePage;
