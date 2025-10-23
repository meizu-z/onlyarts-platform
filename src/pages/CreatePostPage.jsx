import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';
import MainLayout from '../components/layouts/MainLayout';

const CreatePostPage = () => {
  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center h-full">
        <h1 className="text-4xl font-bold mb-8">Create a New Post</h1>
        <div className="space-y-4">
          <Link to="/create-artwork">
            <Button className="w-64">Post Artwork</Button>
          </Link>
          <Link to="/host-exhibition">
            <Button className="w-64">Host an Exhibition</Button>
          </Link>
          <Link to="/start-live">
            <Button className="w-64">Start a Live</Button>
          </Link>
        </div>
      </div>
    </MainLayout>
  );
};

export default CreatePostPage;
