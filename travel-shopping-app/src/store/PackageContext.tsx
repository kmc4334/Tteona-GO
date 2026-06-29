import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useAuth, API_BASE } from './AuthContext';

export interface PackageItem {
  id: string;
  productId: string;
  day: number;
  title: string;
  timeSlot: string;
  image?: string;
  price?: number;
}

interface PackageContextType {
  packageItems: PackageItem[];
  addToPackage: (item: Omit<PackageItem, 'id'>) => void;
  removeFromPackage: (id: string) => void;
  updatePackageItem: (id: string, updates: Partial<PackageItem>) => void;
  clearPackage: () => void;
  packageName: string;
  setPackageName: (name: string) => void;
  savePackage: () => Promise<boolean>;
}

const PackageContext = createContext<PackageContextType | undefined>(undefined);

export const PackageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const [packageItems, setPackageItems] = useState<PackageItem[]>([]);
  const [packageName, setPackageName] = useState('나만의 특별한 여행 패키지');

  const addToPackage = (item: Omit<PackageItem, 'id'>) => {
    const newItem = {
      ...item,
      id: Math.random().toString(36).substr(2, 9),
    };
    setPackageItems((prev) => [...prev, newItem]);
  };

  const removeFromPackage = (id: string) => {
    setPackageItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updatePackageItem = (id: string, updates: Partial<PackageItem>) => {
    setPackageItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const clearPackage = () => {
    setPackageItems([]);
    setPackageName('나만의 특별한 여행 패키지');
  };

  const savePackage = async () => {
    if (!isAuthenticated || !token) return false;
    try {
      const response = await fetch(`${API_BASE}/packages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: packageName,
          items: packageItems,
          totalDays: Math.max(...packageItems.map(i => i.day), 1)
        })
      });
      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Failed to save package:', error);
      return false;
    }
  };

  return (
    <PackageContext.Provider
      value={{
        packageItems,
        addToPackage,
        removeFromPackage,
        updatePackageItem,
        clearPackage,
        packageName,
        setPackageName,
        savePackage
      }}
    >
      {children}
    </PackageContext.Provider>
  );
};

export const usePackage = () => {
  const context = useContext(PackageContext);
  if (!context) {
    throw new Error('usePackage must be used within a PackageProvider');
  }
  return context;
};

