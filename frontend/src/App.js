import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Home from './pages/Home/Home';
import Cart from './pages/Cart/Cart';
import ProductDetails from './pages/ProductDetails/ProductDetails'
import Login from './pages/Login/Login'
import Register from './pages/Register/Register'
import Favorites from './pages/Favorites/Favorites'
import PurchaseHistory from './pages/PurchaseHistory/PurchaseHistory'
import { FilterProvider } from './context/FilterContext';
import { ThemeProvider } from './context/ThemeContext';
import { FavoriteProvider } from './context/FavoriteContext';
import About from './pages/About/About';
import Contact from './pages/Contact/Contact';


function App() {
  return (
    <ThemeProvider>
      <CartProvider>
        <FilterProvider>
          <FavoriteProvider>
            <Router>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/produto" element={<ProductDetails />} />
                <Route path="/favorite" element={<Favorites />} />
                <Route path="/sales" element={<PurchaseHistory />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
              </Routes>
            </Router>
          </FavoriteProvider>
        </FilterProvider>
      </CartProvider>
    </ThemeProvider>
  );
}

export default App;