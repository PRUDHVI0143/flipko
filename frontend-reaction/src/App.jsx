import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import AIChatbot from './components/AIChatbot';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import CartPage from './pages/CartPage';
import Login from './pages/Login';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import OrderSuccess from './pages/OrderSuccess';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/order-success/:id" element={<OrderSuccess />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </main>
        <Footer />
        <AIChatbot />
      </div>
    </Router>
  );
}

export default App;
