'use client';

// src/app/HomeSearchWrapper.tsx
// Thin client island: wraps SearchBar and handles router navigation.

import { useRouter } from 'next/navigation';
import SearchBar from '@/components/SearchBar';

export default function HomeSearchWrapper() {
  const router = useRouter();

  const handleSearch = (query: string) => {
    if (query) {
      router.push(`/products?q=${encodeURIComponent(query)}`);
    } else {
      router.push('/products');
    }
  };

  return <SearchBar onSearch={handleSearch} placeholder="Search boxes, mailers, gift boxes…" />;
}
