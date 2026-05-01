import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './Home';
import Checkout from './Checkout';
import Tracking from './Tracking';
import Courier from './Courier';
import Profile from './Profile';
import { AnimatePresence } from 'framer-motion';

function App() {
  return (
    <AnimatePresence mode="wait">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/tracking/:id" element={<Tracking />} />
        <Route path="/courier" element={<Courier />} />
        <Route path="/profile" element={<Profile />} /> 
      </Routes>
    </AnimatePresence>
  );
}

export default App;