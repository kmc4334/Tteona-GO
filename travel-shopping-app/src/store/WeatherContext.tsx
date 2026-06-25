import React, { createContext, useState, useContext, ReactNode } from 'react';

export const CITIES = [
  { id: 'seoul', name: '서울', nx: 60, ny: 127, landCode: '11B00000', tempCode: '11B10101' },
  { id: 'busan', name: '부산', nx: 98, ny: 76, landCode: '11H20000', tempCode: '11H20201' },
  { id: 'incheon', name: '인천', nx: 55, ny: 124, landCode: '11B00000', tempCode: '11B20201' },
  { id: 'daegu', name: '대구', nx: 89, ny: 90, landCode: '11H10000', tempCode: '11H10701' },
  { id: 'daejeon', name: '대전', nx: 67, ny: 100, landCode: '11C20000', tempCode: '11C20401' },
  { id: 'gwangju', name: '광주', nx: 58, ny: 74, landCode: '11F20000', tempCode: '11F20501' },
  { id: 'ulsan', name: '울산', nx: 102, ny: 84, landCode: '11H20000', tempCode: '11H20101' },
  { id: 'sejong', name: '세종', nx: 66, ny: 103, landCode: '11C20000', tempCode: '11C20404' },
  { id: 'jeju', name: '제주', nx: 52, ny: 38, landCode: '11G00000', tempCode: '11G00201' },
  { id: 'suwon', name: '수원', nx: 60, ny: 121, landCode: '11B00000', tempCode: '11B20101' },
  { id: 'chuncheon', name: '춘천', nx: 73, ny: 134, landCode: '11D10000', tempCode: '11D10301' },
  { id: 'gangneung', name: '강릉', nx: 92, ny: 131, landCode: '11D10000', tempCode: '11D10502' },
  { id: 'cheongju', name: '청주', nx: 69, ny: 107, landCode: '11C10000', tempCode: '11C10301' },
  { id: 'jeonju', name: '전주', nx: 63, ny: 89, landCode: '11F10000', tempCode: '11F10201' },
  { id: 'pohang', name: '포항', nx: 102, ny: 94, landCode: '11H10000', tempCode: '11H10101' },
  { id: 'changwon', name: '창원', nx: 90, ny: 77, landCode: '11H20000', tempCode: '11H20301' },
  { id: 'gimhae', name: '김해', nx: 95, ny: 77, landCode: '11H20000', tempCode: '11H20304' },
  { id: 'mokpo', name: '목포', nx: 50, ny: 67, landCode: '11F20000', tempCode: '11F20301' },
  { id: 'yeosu', name: '여수', nx: 73, ny: 66, landCode: '11F20000', tempCode: '11F20401' },
  { id: 'wonju', name: '원주', nx: 76, ny: 122, landCode: '11D10000', tempCode: '11D10401' },
];

interface WeatherContextType {
  selectedCity: typeof CITIES[0];
  setSelectedCity: (city: typeof CITIES[0]) => void;
  isAutoLocation: boolean;
  setIsAutoLocation: (val: boolean) => void;
}

const WeatherContext = createContext<WeatherContextType | undefined>(undefined);

export const WeatherProvider = ({ children }: { children: ReactNode }) => {
  const [selectedCity, setSelectedCity] = useState(CITIES[0]);
  const [isAutoLocation, setIsAutoLocation] = useState(true);

  return (
    <WeatherContext.Provider value={{ selectedCity, setSelectedCity, isAutoLocation, setIsAutoLocation }}>
      {children}
    </WeatherContext.Provider>
  );
};

export const useWeather = () => {
  const context = useContext(WeatherContext);
  if (context === undefined) {
    throw new Error('useWeather must be used within a WeatherProvider');
  }
  return context;
};
