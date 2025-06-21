import { InventoryService } from './inventory.service';

export class TransactionService {
    async decrementInventory(products: CartItem[], auth: AuthContext): Promise<void> {
        return InventoryService.decrementInventory(products, auth);
    }
}

export async function decrementInventory(products: CartItem[], auth: AuthContext): Promise<void> {
    const transactionService = new TransactionService();
    return transactionService.decrementInventory(products, auth);
}