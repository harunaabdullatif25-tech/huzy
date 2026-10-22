'use client';

// src/app/products/CatalogSearchWrapper.tsx
// Thin client island for the catalog search bar.

import { useRouter } from 'next/navigation';
import SearchBar from '@/components/SearchBar';

interface Props {
  defaultValue?: string;
}

export default function CatalogSearchWrapper({ defaultValue }: Props) {
  const router = useRouter();

  const handleSearch = (query: string) => {
    if (query) {
      router.push(`/products?q=${encodeURIComponent(query)}`);
    } else {
      router.push('/products');
    }
  };

  return (
    <SearchBar
      defaultValue={defaultValue}
      onSearch={handleSearch}
      placeholder="Search products…"
    />
  );
}
