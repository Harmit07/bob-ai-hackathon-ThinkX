'use client';

import React, { createContext, useContext, useState } from 'react';

interface RegionContextType {
  selectedRegion: string;
  setSelectedRegion: (regionId: string) => void;
}

const RegionContext = createContext<RegionContextType>({
  selectedRegion: 'ALL',
  setSelectedRegion: () => {},
});

export function RegionProvider({ children }: { children: React.ReactNode }) {
  const [selectedRegion, setSelectedRegion] = useState<string>('ALL');

  return (
    <RegionContext.Provider value={{ selectedRegion, setSelectedRegion }}>
      {children}
    </RegionContext.Provider>
  );
}

export function useRegion() {
  return useContext(RegionContext);
}
