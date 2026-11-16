import { Routes, Route } from 'react-router-dom';
import Layout, { Toasts } from './components/Layout';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Product from './pages/Product';
import Checkout, { CartPage } from './pages/Checkout';
import { OrderSuccess, TrackOrder } from './pages/Orders';
import { Offers, BookInstallation, Wishlist, Contact, NotFound } from './pages/Info';
import AdminLayout from './pages/admin/AdminLayout';
import { Dashboard, OrdersAdmin, BookingsAdmin, EnquiriesAdmin } from './pages/admin/AdminPages';
import { ProductsAdmin, OffersAdmin, ReelsAdmin } from './pages/admin/CatalogAdmin';

export default function App() {
  return (
    <>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="shop" element={<Shop />} />
          <Route path="product/:slug" element={<Product />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="order/:orderId" element={<OrderSuccess />} />
          <Route path="track-order" element={<TrackOrder />} />
          <Route path="offers" element={<Offers />} />
          <Route path="book-installation" element={<BookInstallation />} />
          <Route path="wishlist" element={<Wishlist />} />
          <Route path="contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path="admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="orders" element={<OrdersAdmin />} />
          <Route path="bookings" element={<BookingsAdmin />} />
          <Route path="products" element={<ProductsAdmin />} />
          <Route path="offers" element={<OffersAdmin />} />
          <Route path="reels" element={<ReelsAdmin />} />
          <Route path="enquiries" element={<EnquiriesAdmin />} />
        </Route>
      </Routes>
      <Toasts />
    </>
  );
}
