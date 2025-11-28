import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Slot {
  time: string;
}

interface UserInfo {
  name: string;
  email: string;
}

interface BookingContextType {
  selectedSlot: Slot | null;
  setSelectedSlot: (slot: Slot | null) => void;
  userName: string;
  setUserName: (name: string) => void;
  userEmail: string;
  setUserEmail: (email: string) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider = ({ children }: { children: ReactNode }) => {
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().slice(0, 10));

  return (
    <BookingContext.Provider value={{ selectedSlot, setSelectedSlot, userName, setUserName, userEmail, setUserEmail, selectedDate, setSelectedDate }}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};
