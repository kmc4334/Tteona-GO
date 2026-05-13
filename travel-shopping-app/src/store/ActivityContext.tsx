import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { TravelProduct } from '../types/travelTypes';
import { useAuth, API_BASE } from './AuthContext';

export interface Booking extends TravelProduct {
  _id?: string; // MongoDB ID
  bookingDate: string;
  status: 'confirmed' | 'pending' | 'cancelled';
}

interface ActivityContextType {
  bookings: Booking[];
  likedItems: TravelProduct[];
  addBooking: (product: TravelProduct) => Promise<void>;
  toggleLike: (product: TravelProduct) => Promise<void>;
  isLiked: (productId: string) => boolean;
  cancelBooking: (bookingId: string) => Promise<void>;
  refreshActivity: () => Promise<void>;
}

const ActivityContext = createContext<ActivityContextType | undefined>(undefined);

export const ActivityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { token, isAuthenticated, logout } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [likedItems, setLikedItems] = useState<TravelProduct[]>([]);

  const fetchActivity = async () => {
    if (!token) return;
    try {
      const [bookingsRes, likesRes] = await Promise.all([
        fetch(`${API_BASE}/activity/bookings`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE}/activity/likes`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (bookingsRes.status === 401 || likesRes.status === 401) {
        logout();
        return;
      }

      const bookingsData = await bookingsRes.json();
      const likesData = await likesRes.json();

      if (bookingsData.success) setBookings(bookingsData.bookings);
      if (likesData.success) {
        // Convert Like model to TravelProduct format
        const formattedLikes = likesData.likes.map((like: any) => ({
          id: like.productId,
          title: like.title,
          price: like.price,
          image: like.image,
          category: like.category,
        }));
        setLikedItems(formattedLikes);
      }
    } catch (error) {
      console.error('Failed to fetch activity:', error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchActivity();
    } else {
      setBookings([]);
      setLikedItems([]);
    }
  }, [isAuthenticated, token]);

  const addBooking = async (product: TravelProduct) => {
    try {
      const response = await fetch(`${API_BASE}/activity/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: product.id,
          title: product.title,
          price: product.price,
          image: product.image,
          checkInDate: product.checkInDate || null,
          checkOutDate: product.checkOutDate || null,
          guests: product.guests || 1,
          platform: product.platform || null,
          platformPrice: product.platformPrice || null,
        })
      });
      const data = await response.json();
      if (data.success) {
        setBookings(prev => [data.booking, ...prev]);
      }
    } catch (error) {
      console.error('Failed to add booking:', error);
    }
  };

  const toggleLike = async (product: TravelProduct) => {
    try {
      const response = await fetch(`${API_BASE}/activity/likes/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: product.id,
          title: product.title,
          price: product.price,
          image: product.image,
          category: product.category
        })
      });
      const data = await response.json();
      if (data.success) {
        if (data.liked) {
          setLikedItems(prev => [product, ...prev]);
        } else {
          setLikedItems(prev => prev.filter(item => item.id !== product.id));
        }
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  const isLiked = (productId: string) => {
    return likedItems.some((item) => item.id === productId);
  };

  const cancelBooking = async (bookingId: string) => {
    try {
      const response = await fetch(`${API_BASE}/activity/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setBookings(prev => prev.filter(b => (b._id || (b as any).id) !== bookingId));
      }
    } catch (error) {
      console.error('Failed to cancel booking:', error);
    }
  };

  return (
    <ActivityContext.Provider
      value={{
        bookings,
        likedItems,
        addBooking,
        toggleLike,
        isLiked,
        cancelBooking,
        refreshActivity: fetchActivity
      }}
    >
      {children}
    </ActivityContext.Provider>
  );
};


export const useActivity = () => {
  const context = useContext(ActivityContext);
  if (!context) {
    throw new Error('useActivity must be used within an ActivityProvider');
  }
  return context;
};

