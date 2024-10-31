import axiosWithTimeout from './axiosInstance';
import {
    WaitlistEntry,
    WaitlistCreate,
    WaitlistUpdate,
} from './types/waitlist';

export const fetchWaitlistEntries = async (page: number, pageSize: number) => {
    const response = await axiosWithTimeout.get<{
        items: WaitlistEntry[];
        total_count: number;
    }>(`/waitlist?page=${page}&page_size=${pageSize}`, {
        headers: {
            isBackgroundRequest: 'true', // Set as background request
        }, // Marked as background
    });
    return response.data;
};

export const fetchWaitlistEntryById = async (id: number) => {
    const response = await axiosWithTimeout.get<WaitlistEntry>(`/waitlist/${id}`, {
        headers: {
            isBackgroundRequest: 'true', // Set as background request
        },
    });
    return response.data;
};

export const createWaitlistEntry = async (waitlistEntry: WaitlistCreate) => {
    const response = await axiosWithTimeout.post<WaitlistEntry>(
        '/waitlist',
        waitlistEntry,
    );
    return response.data;
};

export const updateWaitlistEntry = async (
    id: number,
    waitlistEntry: WaitlistUpdate,
) => {
    const response = await axiosWithTimeout.put<WaitlistEntry>(
        `/waitlist/${id}`,
        waitlistEntry,
    );
    return response.data;
};

export const deleteWaitlistEntry = async (id: number) => {
    const response = await axiosWithTimeout.delete(`/waitlist/${id}`);
    return response.data;
};

export const filterWaitlistEntries = async ({
                                                sire_ids,
                                                dam_ids,
                                                color,
                                                page = 1,
                                                pageSize = 10,
                                            }: {
    sire_ids?: number[];
    dam_ids?: number[];
    color?: string;
    page?: number;
    pageSize?: number;
}) => {
    const response = await axiosWithTimeout.get<{
        items: WaitlistEntry[];
        total_count: number;
    }>(
        `/waitlist/filter?page=${page}&page_size=${pageSize}&sire_ids=${sire_ids?.join(',')}&dam_ids=${dam_ids?.join(',')}&color=${color}`,
        {
            headers: {
                isBackgroundRequest: 'true', // Set as background request
            },
        },
    );
    return response.data;
};