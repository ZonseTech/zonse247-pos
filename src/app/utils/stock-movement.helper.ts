/**
 * Stock movement helper utilities
 *
 * The API stores stock counts and manual removals as ADJUSTMENT / DAMAGE movements with the same
 * reference type as real damage, so the note prefix is the only way to tell them apart. These are
 * the prefixes the API writes by default; user notes are prefixed the same way when saving.
 */

export const STOCK_COUNT_NOTE_PREFIX = 'Stock count';
export const STOCK_ADJUSTMENT_NOTE_PREFIX = 'Stock adjustment';
// Corrections written by the API; COMPENSATING MOVEMENT is the older format
const CORRECTION_NOTE_PREFIXES = ['CORRECTION', 'COMPENSATING MOVEMENT'];

// A movement type, or STOCK_COUNT / CORRECTION (both stored as ADJUSTMENT or DAMAGE)
export type StockMovementDisplayType = StockMovementType | 'STOCK_COUNT' | 'CORRECTION';

export const isCorrectionMovement = (movement: Pick<StockMovement, 'notes'>): boolean =>
    CORRECTION_NOTE_PREFIXES.some((prefix) => (movement.notes ?? '').startsWith(prefix));

// Manual movements (adjust, count, damage, expiry) can be reversed; sales, receipts, returns and
// transfers have their own flows, and corrections are not corrected again
export const isCorrectableMovement = (movement: Pick<StockMovement, 'referenceType' | 'notes'>): boolean =>
    movement.referenceType === 'ADJUSTMENT' && !isCorrectionMovement(movement);

export const getMovementDisplayType = (movement: Pick<StockMovement, 'movementType' | 'notes'>): StockMovementDisplayType => {
    const notes = movement.notes ?? '';
    if (isCorrectionMovement(movement)) return 'CORRECTION';
    if (notes.startsWith(STOCK_COUNT_NOTE_PREFIX)) return 'STOCK_COUNT';
    if (movement.movementType === 'DAMAGE' && notes.startsWith(STOCK_ADJUSTMENT_NOTE_PREFIX)) return 'ADJUSTMENT';
    return movement.movementType;
};

// With no note the API writes "Stock count: Expected X, Counted Y, Variance Z"; a user note replaces it
export const buildStockCountNote = (countedQuantity: number, note?: string): string | undefined =>
    note?.trim() ? `${STOCK_COUNT_NOTE_PREFIX}: counted ${countedQuantity}. ${note.trim()}` : undefined;

// Removals are stored as DAMAGE; the prefix keeps them from being shown as real damage
export const buildStockRemovalNote = (note: string): string => `${STOCK_ADJUSTMENT_NOTE_PREFIX}: ${note.trim()}`;
