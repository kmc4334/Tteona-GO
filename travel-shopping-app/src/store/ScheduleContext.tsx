import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useAuth, API_BASE } from './AuthContext';
import { Alert } from 'react-native';

export interface SlotItem {
  id?: string;
  productId?: string;
  name: string;
  city: string;
  category: string;
  duration?: number | null;
  start_time?: string;
  rating?: number;
  price?: number;
  img?: string;
  addedAt?: string;
}

export interface DaySchedule {
  day: number;
  date: string;
  slots: SlotItem[];
}

export interface PlanInfo {
  title: string;
  dest: string;
  start: string;
  end: string;
  days: number;
  people?: string;
  budget?: string;
  transport?: string;
  memo?: string;
  createdAt?: string;
}

export interface ScheduleState {
  info: PlanInfo | null;
  schedule: DaySchedule[];
}

interface ScheduleContextType {
  scheduleState: ScheduleState | null;
  loading: boolean;
  createSchedule: (formData: Omit<PlanInfo, 'days'>) => Promise<boolean>;
  addPlace: (dayIndex: number, place: SlotItem) => Promise<boolean>;
  addMultiplePlaces: (dayIndex: number, places: SlotItem[]) => Promise<boolean>;
  removePlace: (dayIndex: number, slotIndex: number) => Promise<boolean>;
  updatePlaceTime: (dayIndex: number, slotIndex: number, time: string) => Promise<boolean>;
  clearSchedule: () => Promise<boolean>;
  loadSchedule: () => Promise<void>;
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

export const ScheduleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const [scheduleState, setScheduleState] = useState<ScheduleState | null>(null);
  const [loading, setLoading] = useState(true);

  const loadSchedule = async () => {
    if (!isAuthenticated || !token) {
      setScheduleState(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/schedules`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success && data.schedule) {
        setScheduleState({
          info: data.schedule.info,
          schedule: data.schedule.schedule
        });
      } else {
        setScheduleState(null);
      }
    } catch (error) {
      console.error('Failed to load schedule:', error);
      setScheduleState(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchedule();
  }, [isAuthenticated, token]);

  const saveToBackend = async (info: PlanInfo, schedule: DaySchedule[]) => {
    if (!token) return false;
    try {
      const response = await fetch(`${API_BASE}/schedules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ info, schedule })
      });
      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Failed to save schedule to backend:', error);
      return false;
    }
  };

  const createSchedule = async (formData: Omit<PlanInfo, 'days'>) => {
    const { title, dest, start, end, people, budget, transport, memo } = formData;

    if (!title || !dest || !start || !end) {
      Alert.alert('오류', '여행 제목, 여행지, 출발일, 도착일을 입력해주세요.');
      return false;
    }

    const startDate = new Date(start);
    const endDate = new Date(end);

    if (endDate < startDate) {
      Alert.alert('오류', '도착일은 출발일 이후여야 합니다.');
      return false;
    }

    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / 86400000) + 1;

    const info: PlanInfo = {
      title,
      dest,
      start,
      end,
      days,
      people: people || '2',
      budget: budget || '',
      transport: transport || '자가용',
      memo: memo || '',
      createdAt: new Date().toISOString()
    };

    const schedule: DaySchedule[] = Array.from({ length: days }, (_, i) => {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      return {
        day: i + 1,
        date: d.toISOString().slice(0, 10),
        slots: []
      };
    });

    const success = await saveToBackend(info, schedule);
    if (success) {
      setScheduleState({ info, schedule });
      return true;
    } else {
      Alert.alert('오류', '일정을 저장하는 중 오류가 발생했습니다.');
      return false;
    }
  };

  const addPlace = async (dayIndex: number, place: SlotItem) => {
    if (!scheduleState || !scheduleState.info) return false;

    const updatedSchedule = scheduleState.schedule.map((day, idx) => {
      if (idx === dayIndex) {
        return {
          ...day,
          slots: [
            ...day.slots,
            {
              ...place,
              id: place.id || Math.random().toString(36).substr(2, 9),
              addedAt: new Date().toISOString()
            }
          ]
        };
      }
      return day;
    });

    const success = await saveToBackend(scheduleState.info, updatedSchedule);
    if (success) {
      setScheduleState({
        ...scheduleState,
        schedule: updatedSchedule
      });
      return true;
    }
    return false;
  };

  const addMultiplePlaces = async (dayIndex: number, places: SlotItem[]) => {
    if (!scheduleState || !scheduleState.info) return false;

    const updatedSchedule = scheduleState.schedule.map((day, idx) => {
      if (idx === dayIndex) {
        const newSlots = places.map(p => ({
          ...p,
          id: p.id || Math.random().toString(36).substr(2, 9),
          addedAt: new Date().toISOString()
        }));
        return {
          ...day,
          slots: [...day.slots, ...newSlots]
        };
      }
      return day;
    });

    const success = await saveToBackend(scheduleState.info, updatedSchedule);
    if (success) {
      setScheduleState({
        ...scheduleState,
        schedule: updatedSchedule
      });
      return true;
    }
    return false;
  };

  const removePlace = async (dayIndex: number, slotIndex: number) => {
    if (!scheduleState || !scheduleState.info) return false;

    const updatedSchedule = scheduleState.schedule.map((day, idx) => {
      if (idx === dayIndex) {
        const newSlots = [...day.slots];
        newSlots.splice(slotIndex, 1);
        return {
          ...day,
          slots: newSlots
        };
      }
      return day;
    });

    const success = await saveToBackend(scheduleState.info, updatedSchedule);
    if (success) {
      setScheduleState({
        ...scheduleState,
        schedule: updatedSchedule
      });
      return true;
    }
    return false;
  };

  const updatePlaceTime = async (dayIndex: number, slotIndex: number, time: string) => {
    if (!scheduleState || !scheduleState.info) return false;

    const updatedSchedule = scheduleState.schedule.map((day, idx) => {
      if (idx === dayIndex) {
        const newSlots = day.slots.map((slot, sIdx) => {
          if (sIdx === slotIndex) {
            return {
              ...slot,
              start_time: time
            };
          }
          return slot;
        });
        return {
          ...day,
          slots: newSlots
        };
      }
      return day;
    });

    const success = await saveToBackend(scheduleState.info, updatedSchedule);
    if (success) {
      setScheduleState({
        ...scheduleState,
        schedule: updatedSchedule
      });
      return true;
    }
    return false;
  };

  const clearSchedule = async () => {
    if (!token) return false;
    try {
      const response = await fetch(`${API_BASE}/schedules`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setScheduleState(null);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to clear schedule:', error);
      return false;
    }
  };

  return (
    <ScheduleContext.Provider
      value={{
        scheduleState,
        loading,
        createSchedule,
        addPlace,
        addMultiplePlaces,
        removePlace,
        updatePlaceTime,
        clearSchedule,
        loadSchedule
      }}
    >
      {children}
    </ScheduleContext.Provider>
  );
};

export const useSchedule = () => {
  const context = useContext(ScheduleContext);
  if (context === undefined) {
    throw new Error('useSchedule must be used within a ScheduleProvider');
  }
  return context;
};
