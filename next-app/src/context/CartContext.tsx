// src/context/CartContext.tsx
'use client';

import React, { createContext, useContext, useEffect, useReducer, useCallback } from 'react';

export interface BulkTier {
  minQuantity: number;
  unitPrice: number;
  discountPercentage?: number;
}

export interface CartItem {
  productId: string;
  slug?: string;
  title: string;
  variantSku: string;
  variantName: string;
  image?: string;
  unitPrice: number;
  quantity: number;
  minOrderQuantity?: number;
  bulkPricingTiers?: BulkTier[];
  subtotal?: number;
  customDimensions?: {
    length: number;
    width: number;
    height: number;
    unit: 'cm' | 'inches';
  };
  customColor?: string;
  printOption?: string;
  brandingNotes?: string;
  customLogoUrl?: string;
}

/**
 * Calculates the effective unit price for an item based on its quantity
 * and defined bulk pricing tiers.
 */
export function effectiveUnitPrice(item: CartItem): number {
  if (!item.bulkPricingTiers || item.bulkPricingTiers.length === 0) {
    return item.unitPrice;
  }
  const eligible = item.bulkPricingTiers
    .filter((t) => item.quantity >= t.minQuantity)
    .sort((a, b) => b.minQuantity - a.minQuantity);

  return eligible.length > 0 ? eligible[0].unitPrice : item.unitPrice;
}

export function computeLinePrice(item: CartItem): number {
  return Number((effectiveUnitPrice(item) * item.quantity).toFixed(2));
}

interface CartState {
  items: CartItem[];
}

type CartAction =
  | { type: 'LOAD_CART'; payload: CartItem[] }
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: { variantSku: string } }
  | { type: 'UPDATE_QTY'; payload: { variantSku: string; quantity: number } }
  | { type: 'CLEAR_CART' };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'LOAD_CART':
      return { items: action.payload };

    case 'ADD_ITEM': {
      const existing = state.items.find((i) => i.variantSku === action.payload.variantSku);
      if (existing) {
        const newQty = existing.quantity + action.payload.quantity;
        return {
          items: state.items.map((i) =>
            i.variantSku === action.payload.variantSku
              ? {
                  ...i,
                  quantity: newQty,
                  subtotal: computeLinePrice({ ...i, quantity: newQty }),
                }
              : i
          ),
        };
      }
      const itemWithSubtotal = {
        ...action.payload,
        subtotal: computeLinePrice(action.payload),
      };
      return { items: [...state.items, itemWithSubtotal] };
    }

    case 'REMOVE_ITEM':
      return { items: state.items.filter((i) => i.variantSku !== action.payload.variantSku) };

    case 'UPDATE_QTY':
      return {
        items: state.items.map((i) =>
          i.variantSku === action.payload.variantSku
            ? {
                ...i,
                quantity: action.payload.quantity,
                subtotal: computeLinePrice({ ...i, quantity: action.payload.quantity }),
              }
            : i
        ),
      };

    case 'CLEAR_CART':
      return { items: [] };

    default:
      return state;
  }
}

interface CartContextValue {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (variantSku: string) => void;
  updateQty: (variantSku: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = 'blossom_box_cart_v1';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          dispatch({ type: 'LOAD_CART', payload: parsed });
        }
      }
    } catch {
      // LocalStorage not available or parse error
    }
  }, []);

  // Sync to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
    } catch {
      // LocalStorage write failed
    }
  }, [state.items]);

  const addItem = useCallback((item: CartItem) => {
    dispatch({ type: 'ADD_ITEM', payload: item });
  }, []);

  const removeItem = useCallback((variantSku: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { variantSku } });
  }, []);

  const updateQty = useCallback((variantSku: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QTY', payload: { variantSku, quantity } });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' });
  }, []);

  const subtotal = state.items.reduce((sum, item) => sum + computeLinePrice(item), 0);
  const total = subtotal;
  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        addItem,
        removeItem,
        updateQty,
        clearCart,
        subtotal,
        total,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
