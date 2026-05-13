import React, { createContext, useState, useContext, ReactNode } from 'react';

interface BudgetContextType {
  totalBudget: number;
  setTotalBudget: (amount: number) => void;
  usedBudget: number;
  setUsedBudget: (amount: number) => void;
  remainingBudget: number;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export const BudgetProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [totalBudget, setTotalBudget] = useState<number>(0);
  const [usedBudget, setUsedBudget] = useState<number>(0);

  const remainingBudget = totalBudget - usedBudget;

  return (
    <BudgetContext.Provider value={{
      totalBudget,
      setTotalBudget,
      usedBudget,
      setUsedBudget,
      remainingBudget
    }}>
      {children}
    </BudgetContext.Provider>
  );
};

export const useBudget = () => {
  const context = useContext(BudgetContext);
  if (!context) {
    throw new Error('useBudget must be used within a BudgetProvider');
  }
  return context;
};
