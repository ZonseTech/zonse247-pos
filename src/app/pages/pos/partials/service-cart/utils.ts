export const getInitials = (name: string) =>
    name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

export const getStaffDisplayName = (s: Staff) =>
    s.user?.fullname || s.employeeCode || s.staffId;

export const getAvailableStock = (
    item: CartItem,
    inventory: InventoryItem[],
): number => {
    if (item.trackInventory === false) return 999;
    const inventoryItem = inventory.find(p => p.id === item.variantId);
    if (!inventoryItem) return 999;
    return parseInt(
        (inventoryItem.quantity || inventoryItem.availableQuantity || '0').toString(),
    ) + item.quantity;
};
