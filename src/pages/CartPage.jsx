import React from 'react';
import { useCart } from '../context/CartContext';
import MainLayout from '../components/layouts/MainLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

const CartPage = () => {
  const { cartItems } = useCart();

  return (
    <MainLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-[#f2e9dd] mb-6">Your Cart</h1>
        {cartItems.length === 0 ? (
          <p className="text-[#f2e9dd]/70">Your cart is empty.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cartItems.map((item, index) => (
              <Card key={index}>
                <h2 className="text-xl font-bold text-[#f2e9dd]">{item.title}</h2>
                <p className="text-[#f2e9dd]/70">{item.artistName}</p>
                <p className="text-[#f2e9dd] mt-4">{item.price}</p>
              </Card>
            ))}
          </div>
        )}
        {cartItems.length > 0 && (
          <div className="mt-8">
            <Button>Proceed to Checkout</Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default CartPage;
