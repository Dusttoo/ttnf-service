export type SortOrder = 'asc' | 'desc';

export function sortByKey<T>(array: T[], key: keyof T, order: SortOrder = 'desc'): T[] {
    return array.sort((a, b) => {
        const valueA = a[key];
        const valueB = b[key];

        if (typeof valueA === 'string' && typeof valueB === 'string') {
            const comparison = valueA.localeCompare(valueB);
            return order === 'asc' ? comparison : -comparison;
        }

        // Assuming date strings for birthDate
        if (typeof valueA === 'string' && typeof valueB === 'string' && Date.parse(valueA) && Date.parse(valueB)) {
            const comparison = new Date(valueA).getTime() - new Date(valueB).getTime();
            return order === 'asc' ? comparison : -comparison;
        }

        return 0;
    });
}