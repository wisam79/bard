import { useState, useCallback, useEffect, useRef } from 'react';
import { CartItem, Product } from '@/types';

interface UseCartOptions {
  onCartRestored?: () => void;
}

export function useCart(options?: UseCartOptions) {
  void options;
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedCustomerName, setSelectedCustomerName] = useState('');
  const [discount, setDiscount] = useState(0);
  const [receivedAmount, setReceivedAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<string>('cash');
  const [isZenMode, setIsZenMode] = useState(false);
  const [justAddedId, setJustAddedId] = useState<string | null>(null);
  const justAddedTimerRef = useRef<number | null>(null);

  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
  const total = subtotal - discount;
  const change = receivedAmount > total ? receivedAmount - total : 0;
  const itemsCount = cart.reduce((sum, item) => sum + item.qty, 0);

  const addToCart = useCallback((product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, qty: item.qty + 1, total: (item.qty + 1) * item.product.price }
            : item
        );
      }
      return [...prev, { product, qty: 1, discount: 0, total: product.price }];
    });
    setJustAddedId(product.id);
    if (justAddedTimerRef.current !== null) {
      clearTimeout(justAddedTimerRef.current);
    }
    justAddedTimerRef.current = window.setTimeout(() => {
      setJustAddedId(null);
      justAddedTimerRef.current = null;
    }, 300);
  }, []);

  useEffect(() => {
    return () => {
      if (justAddedTimerRef.current !== null) {
        clearTimeout(justAddedTimerRef.current);
      }
    };
  }, []);

  const updateQty = useCallback((productId: string, qty: number) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((item) => item.product.id !== productId));
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId
          ? { ...item, qty, total: qty * item.product.price }
          : item
      )
    );
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    setDiscount(0);
    setReceivedAmount(0);
    setSelectedCustomerId('');
    setSelectedCustomerName('');
  }, []);

  const setSelectedCustomer = useCallback((id: string, name: string) => {
    setSelectedCustomerId(id);
    setSelectedCustomerName(name);
  }, []);

  return {
    cart,
    setCart,
    selectedCustomerId,
    selectedCustomerName,
    setSelectedCustomer,
    discount,
    setDiscount,
    receivedAmount,
    setReceivedAmount,
    paymentMethod,
    setPaymentMethod,
    subtotal,
    total,
    change,
    itemsCount,
    addToCart,
    updateQty,
    removeFromCart,
    clearCart,
    justAddedId,
    isZenMode,
    setIsZenMode,
  };
}
