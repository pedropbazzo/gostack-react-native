import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

export interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const data = await AsyncStorage.getItem('products');
      if (data) {
        setProducts([...JSON.parse(data)]);
      }
    }

    loadProducts();
  }, []);

  const increment = useCallback(
    async id => {
      const newProducts = products.map(item => {
        if (item.id === id) {
          return { ...item, quantity: item.quantity + 1 };
        }
        return item;
      });

      setProducts(newProducts);

      await AsyncStorage.setItem('Products', JSON.stringify(newProducts));
    },
    [products],
  );

  const addToCart = useCallback(
    async product => {
      const findProduct = products.find(p => p.id === product.id);

      if (findProduct) {
        return increment(product.id);
      }

      setProducts([...products, { ...product, quantity: 1 }]);

      await AsyncStorage.setItem('products', JSON.stringify(products));
    },
    [products, increment],
  );

  const decrement = useCallback(
    async id => {
      const findProduct = products.map(item => {
        if (item.id === id) {
          return { ...item, quantity: item.quantity - 1 };
        }
        return item;
      });

      setProducts(findProduct);

      await AsyncStorage.setItem('products', JSON.stringify(findProduct));
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
