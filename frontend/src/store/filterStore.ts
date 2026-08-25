import { create } from 'zustand';

interface FilterState {
    cardType: string | null;
    regions: string[];
    paymentMethods: string[];
    industries: string[];
    trustScore: number | null;
    verifiedOnly: boolean;
    maxVolume: number;
    search: string;
    sort: string;
    page: number;
    setCardType: (t: string | null) => void;
    toggleRegion: (r: string) => void;
    togglePaymentMethod: (m: string) => void;
    toggleIndustry: (i: string) => void;
    setTrustScore: (s: number | null) => void;
    setVerifiedOnly: (v: boolean) => void;
    setMaxVolume: (v: number) => void;
    setSearch: (s: string) => void;
    setSort: (s: string) => void;
    setPage: (p: number) => void;
    resetFilters: () => void;
}

const initialState = {
    cardType: null,
    regions: [],
    paymentMethods: [],
    industries: [],
    trustScore: null,
    verifiedOnly: true,
    maxVolume: 500000,
    search: '',
    sort: 'newest',
    page: 1,
};

export const useFilterStore = create<FilterState>((set) => ({
    ...initialState,
    setCardType: (cardType) => set({ cardType, page: 1 }),
    toggleRegion: (r) => set((s) => ({
        regions: s.regions.includes(r) ? s.regions.filter((x) => x !== r) : [...s.regions, r],
        page: 1,
    })),
    togglePaymentMethod: (m) => set((s) => ({
        paymentMethods: s.paymentMethods.includes(m) ? s.paymentMethods.filter((x) => x !== m) : [...s.paymentMethods, m],
        page: 1,
    })),
    toggleIndustry: (i) => set((s) => ({
        industries: s.industries.includes(i) ? s.industries.filter((x) => x !== i) : [...s.industries, i],
        page: 1,
    })),
    setTrustScore: (trustScore) => set({ trustScore, page: 1 }),
    setVerifiedOnly: (verifiedOnly) => set({ verifiedOnly, page: 1 }),
    setMaxVolume: (maxVolume) => set({ maxVolume, page: 1 }),
    setSearch: (search) => set({ search, page: 1 }),
    setSort: (sort) => set({ sort, page: 1 }),
    setPage: (page) => set({ page }),
    resetFilters: () => set(initialState),
}));
