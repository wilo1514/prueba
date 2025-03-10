// src/App.tsx
import React from 'react';
import Header from './components/HeaderPresentation';
import OrdersPage from './pages/OrdersPage';

const App: React.FC = () => {
  return (
    <div>
      <Header />
      <OrdersPage />
    </div>
  );
};

export default App;
