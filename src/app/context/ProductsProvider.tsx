import { type ReactNode, createContext, useContext, useEffect, useState } from "react";
import productsService from "../services/products.service";
import categoriesSerive from "../services/category.service";
import customerSerive from "../services/customers.service";
import { Notify } from "notiflix";
import paymentMethodService from "../services/payment-method.service";
import { DEFAULT_SEED_KEY } from "../constants";

interface ProductsContextType {
    products: Product[];
    cart: CartItem[];
    categories: Category[];
    customers: Customer[];
    paymentMethods: Array<PaymentMethod>;
    user: User | null;
    till: Till | null;
    selectedCustomer: Customer;
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
    setCart: (items: CartItem[]) => void;
    setTotal: (amount: number) => void;
    setSelectedCustomer: (customer: Customer) => void;
    addToCart: (product: Product) => void;
    removeFromCart: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    setDiscount: (amount: number) => void;
    reloadProducts: () => void;
    updateCustomPrice: (productId: string, newPrice: number) => void;
    setCategories: (category: Category[]) => void;
    setCustomers: (customers: Customer[]) => void;
    fetchCustomers: () => Promise<void>;
}

interface ProductsProviderProps {
    children: ReactNode;
    initialProducts?: Product[];
    initialCart?: CartItem[];
    currencyPrefix?: string;
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

export const useProducts = () => {
    const context = useContext(ProductsContext);

    if (context === undefined) {
        throw new Error('useProducts must be used within a ProductsProvider');
    }
    return context;
};

export const ProductsProvider: React.FC<ProductsProviderProps> = ({
    children,
    initialCart = [],
}) => {
    const [tax] = useState<number>(0);
    const [total, setTotal] = useState<number>(0);
    const [discount, setDiscount] = useState<number>(0);
    const [subtotal, setSubtotal] = useState<number>(0);
    const [user, setUser] = useState<User | null>(null);
    const [till, setTill] = useState<Till | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [cart, setCart] = useState<CartItem[]>(initialCart);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [paymentMethods, setPaymentMethods] = useState<Array<PaymentMethod>>([]);
    const [selectedCustomer, setSelectedCustomer] = useState({} as Customer);

    const fetchCategories = async () => {
        try {
            const data = await categoriesSerive.list();
            setCategories(data);
        } catch (error) {
            Notify.failure('Error fetching categories' + error);
        }
    }

    const fetchPaymentMethods = async () => {
        try {
            const data = await paymentMethodService.list();
            setPaymentMethods(data);
        } catch (error) {
            Notify.failure('Error fetching payment services' + error);
        }
    }

    const fetchCustomers = async () => {
        try {
            const response = await customerSerive.list();

            if (response) {
                setSelectedCustomer(response[0])
                setCustomers(response);
            }
        } catch (error) {
            Notify.failure('Error fetching customers' + error);
        }
    }

    const fetchProducts = async () => {
        try {
            const data = await productsService.index();
            setProducts(data);
        } catch (error) {
            Notify.failure('Error fetching products' + error);
        }
    }

    const reloadProducts = async () => {
        await fetchCategories();
        await fetchProducts();
    }

    useEffect(() => {
        const fetchData = async () => {
            await fetchCategories();
            await fetchProducts();
            await fetchCustomers();
            await fetchPaymentMethods();
        };

        fetchData();

        const fetchUserAndTill = async () => {
            try {
                // const userResponse = await axios.get('/api/auth/current-user');
                setUser({} as User);

                // const tillResponse = await axios.get('/api/tills/active');
                setTill({} as Till);
            } catch (error) {
                Notify.failure('Error fetching user/till info:' + error);
            }
        };

        fetchUserAndTill();
    }, []);

    useEffect(() => {
        let totalPrice = 0.00
        const newTotal = cart.reduce((sum, item) => {
            if (item.quantity === 0)
                totalPrice = item.sellPrice
            else totalPrice = item.sellPrice * item.quantity

            return sum + totalPrice;
        }, 0);

        setSubtotal(newTotal)
        setTotal(newTotal - discount);
    }, [cart, discount]);

    const addToCart = (product: Product) => {
        const quantity = parseInt(product?.orderItems?.toString() || '0') || 1
        const existingItem = cart.find(item => item.productId === product.uuid);

        if (existingItem) {
            updateQuantity((product.uuid.toString()), existingItem.quantity + quantity);
        } else {
            const isConsumableProduct = product.categoryId.toString() === DEFAULT_SEED_KEY;
            const price = isConsumableProduct
                ? parseFloat(product.customPrice || product.sellPrice as string)
                : parseFloat(product.sellPrice || '0');


            setCart(prev => [...prev, {
                barcode: product.barcode,
                productId: (product.uuid.toString()),
                name: product.name,
                purchasePrice: parseFloat(product.costPrice || '0'),
                sellPrice: price,
                quantity: isConsumableProduct ? 0 : quantity,
                categoryId: product.categoryId.toString(),
            }]);

            if (!isConsumableProduct)
                updateProductStock((product.uuid.toString()), parseInt((product.quantity || 0).toString()) - quantity);
        }
    };

    const removeFromCart = (id: string) => {
        const itemToRemove = cart.find(item => item.productId === id);

        setCart(prev => prev.filter(item => item.productId !== id));

        if (itemToRemove) {
            const product = products.find(p => p.uuid === id);
            if (product) {
                updateProductStock(id, parseInt((product.quantity || 0).toString()) + itemToRemove.quantity);
            }
        }
    };

    const updateCustomPrice = (productId: string, newPrice: number) => {
        setCart(prev =>
            prev.map(item =>
                item.productId === productId
                    ? { ...item, sellPrice: newPrice }
                    : item
            )
        );
    };

    const updateQuantity = (id: string, quantity: number) => {
        const prevItem = cart.find(item => item.productId === id) as CartItem;
        const isConsumable = prevItem.categoryId === DEFAULT_SEED_KEY

        if (isConsumable && quantity < 0)
            return
        if (quantity < 1) return;

        setCart(prev => prev.map(item =>
            item.productId === id ? { ...item, quantity } : item
        ));

        if (prevItem) {
            const difference = prevItem.quantity - quantity;
            const product = products.find(p => p.uuid === id);
            if (product) {
                updateProductStock(id, parseInt((product.quantity || 0).toString()) + difference);
            }
        }
    };

    const clearCart = () => {
        cart.forEach(item => {
            const product = products.find(p => p.uuid === item.productId);
            if (product) {
                updateProductStock(item.productId, parseInt((product.quantity || 0).toString()) + item.quantity);
            }
        });

        setCart([]);
        setTotal(0);
    };

    const updateProductStock = (id: string, newStock: number) => {
        setProducts(prev => prev.map(product =>
            product.uuid === id ? { ...product, quantity: newStock } : product
        ));
    };

    const value: ProductsContextType = {
        products,
        cart,
        categories,
        customers,
        paymentMethods,
        user,
        till,
        selectedCustomer,
        subtotal,
        discount,
        tax,
        total,
        setCart,
        setTotal,
        setSelectedCustomer,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        setDiscount,
        reloadProducts,
        updateCustomPrice,
        setCategories,
        setCustomers,
        fetchCustomers
    };

    return (
        <ProductsContext.Provider value={value}>
            {children}
        </ProductsContext.Provider>
    );
}

export default ProductsProvider