import type { Venue } from '@/types';
import { devtools } from 'zustand/middleware';
import fetchApi from '@/lib/api.ts';
import { create } from 'zustand/react';
import type { CreateVenueRequest, UpdateVenueRequest } from '@/types/venue.ts';

interface VenueStore {
  venue: Venue | null;
  isLoading: boolean;

  // ====== Venue ======
  fetchVenue: () => Promise<void>; // 최초 렌더링시 1회만 호출용
  getTotalSeatCount: () => number; // 총 좌석
  addVenue: (req: CreateVenueRequest) => Promise<void>;
  updateVenue: (venueId: number, req: UpdateVenueRequest) => Promise<void>;
}

const VENUE_API_PREFIX = '/venue';

const useVenueStore = create<VenueStore>()(
  devtools((set, get) => ({
    venue: null,

    fetchVenue: async () => {
      set({ isLoading: true });
      const data = await fetchApi<Venue>(`${VENUE_API_PREFIX}/first`);
      set({
        venue: data,
        isLoading: false,
      });
    },
    getTotalSeatCount: () => get().venue?.totalSeats ?? 0,

    addVenue: async (req) => {
      set({ isLoading: true });
      try {
        const newVenue = await fetchApi<Venue>(`${VENUE_API_PREFIX}`, {
          method: 'POST',
          body: JSON.stringify(req),
        });
        set({ venue: newVenue });
      } finally {
        set({ isLoading: false });
      }
    },
    updateVenue: async (venueId, req) => {
      set({ isLoading: true });
      try {
        const updateVenue = await fetchApi<Venue>(`${VENUE_API_PREFIX}/${venueId}`, {
          method: 'PATCH',
          body: JSON.stringify(req),
        });
        set({ venue: updateVenue });
      } finally {
        set({ isLoading: false });
      }
    },
  })),
);

export default useVenueStore;
