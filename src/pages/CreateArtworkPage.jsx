import React, { useState } from 'react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import MainLayout from '../components/layouts/MainLayout';
import { useToast } from '../components/ui/Toast';

const CreateArtworkPage = () => {
  const [isForSale, setIsForSale] = useState(false);
  const [price, setPrice] = useState('');
  const toast = useToast();

  const handlePostArtwork = () => {
    if (isForSale) {
      toast.success('Your artwork has been posted for sale!');
    } else {
      toast.success('Your artwork has been posted!');
    }
    // Here you would typically handle the form submission
  };

  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center h-full">
        <h1 className="text-4xl font-bold mb-8">Post Artwork</h1>
        <div className="w-full max-w-md">
          <Input type="file" label="Upload Artwork" />
          <div className="flex items-center my-4">
            <input
              type="radio"
              id="normal"
              name="artworkType"
              value="normal"
              checked={!isForSale}
              onChange={() => setIsForSale(false)}
              className="mr-2"
            />
            <label htmlFor="normal">Normal Artwork</label>
          </div>
          <div className="flex items-center my-4">
            <input
              type="radio"
              id="forSale"
              name="artworkType"
              value="forSale"
              checked={isForSale}
              onChange={() => setIsForSale(true)}
              className="mr-2"
            />
            <label htmlFor="forSale">For Sale</label>
          </div>
          {isForSale && (
            <Input
              type="number"
              label="Price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Enter price"
            />
          )}
          <Button onClick={handlePostArtwork} className="w-full mt-4">Post Artwork</Button>
        </div>
      </div>
    </MainLayout>
  );
};

export default CreateArtworkPage;
