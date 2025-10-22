import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './sidebar';
import Footer from './footer';
import { useAuth } from '../../context/AuthContext';

const MainLayout = ({ showSidebar = true, showFooter = false }) => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex flex-col">
      <Navbar />
      
      <div className="flex flex-1 max-w-[1920px] mx-auto w-full">
        {showSidebar && isAuthenticated && <Sidebar />}
        
        <main className="flex-1 w-full p-6 md:p-8">
          <Outlet />
        </main>
      </div>

      {showFooter && <Footer />}
    </div>
  );
};

export default MainLayout;
