export const formatDate = (date: string | Date | null | undefined): string => {
    if (!date) return 'Never';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

export const formatRoleName = (role: string | null | undefined, snake = '_'): string => {
    if (!role) return 'User';
    return role
        .split(snake)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
};

export const groupPermissions = (permissions: string[] | null | undefined): Record<string, string[]> => {
    if (!permissions) return {};
    return permissions.reduce(
        (acc, perm) => {
            const [category] = perm.split('.');
            if (!acc[category]) acc[category] = [];
            acc[category].push(perm);
            return acc;
        },
        {} as Record<string, string[]>
    );
};
