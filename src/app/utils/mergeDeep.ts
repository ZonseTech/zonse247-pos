export function isObject(item: any): boolean {
    return item && typeof item === 'object' && !Array.isArray(item)
}

export function mergeDeep(target: any, ...sources: any[]): any {
    if (sources.length === 0) return target
    const source = sources.shift()

    if (isObject(target) && isObject(source)) {
        for (const key in source) {
            if (isObject(source[key])) {
                if (!target[key]) Object.assign(target, { [key]: {} })
                mergeDeep(target[key], source[key])
            } else {
                Object.assign(target, { [key]: source[key] })
            }
        }
    }

    return mergeDeep(target, ...sources)
}

export function getInitialFormValues<T extends Record<string, any>>(
    defaults: T,
    data?: Partial<T>,
    primaryKey: keyof T = 'id' as keyof T
): T {
    // Check if primary key exists and has a valid value
    const primaryValue = data?.[primaryKey];
    const hasPrimaryId =
        typeof primaryValue === 'string'
            ? primaryValue.trim().length > 0
            : primaryValue !== undefined && primaryValue !== null;

    // If no valid primary key, return defaults with __isEditMode = false
    if (!hasPrimaryId) {
        return {
            ...defaults,
            __isEditMode: false
        } as T;
    }

    // Otherwise, merge data with defaults
    const merged = { ...defaults, ...data };
    (merged as any).__isEditMode = true;

    return merged;
}