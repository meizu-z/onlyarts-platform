import React from 'react';
import { useCart } from '../context/CartContext';
import MainLayout from '../components/layouts/MainLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

const CartPage = () => {
  const { cartItems } = useCart();

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl md:text-4xl font-bold text-[#f2e9dd] mb-4 md:mb-6 px-3 md:px-6">Your Cart</h1>
        {cartItems.length === 0 ? (
          <p className="text-[#f2e9dd]/70 px-3 md:px-6">Your cart is empty.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 px-3 md:px-6">
            {cartItems.map((item, index) => (
              <Card key={index} className="p-3 md:p-4">
                <h2 className="text-xl font-bold text-[#f2e9dd]">{item.title}</h2>
                <p className="text-[#f2e9dd]/70">{item.artistName}</p>
                <p className="text-[#f2e9dd] mt-4">{item.price}</p>
              </Card>
            ))}
          </div>
        )}
        {cartItems.length > 0 && (
          <div className="mt-6 md:mt-8 px-3 md:px-6">
            <Button className="w-full sm:w-auto">Proceed to Checkout</Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default CartPage;
