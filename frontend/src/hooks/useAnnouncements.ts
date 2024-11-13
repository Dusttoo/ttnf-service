import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  getAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  getAnnouncementByPageId,
} from '../api/announcementApi';
import { AnnouncementUpdate, AnnouncementCreate, Announcement } from '../api/types/announcements';

// Fetch all announcements
export const useAnnouncements = () => {
  return useQuery<Announcement[], Error>('announcements', getAnnouncements, {
    staleTime: 0, // refetch data each time it becomes stale
    keepPreviousData: true, // retains previous data for smooth UI transitions
  });
};

// Fetch a single announcement by ID
export const useAnnouncement = (announcementId: number) => {
  return useQuery<Announcement, Error>(
    ['announcement', announcementId],
    () => getAnnouncementById(announcementId),
    {
      enabled: !!announcementId, // only fetch if ID is present
      staleTime: 0,
    }
  );
};

// Fetch announcements by page ID
export const useAnnouncementsByPageId = (pageId: string) => {
  return useQuery<Announcement[], Error>(
    ['announcements', pageId],
    () => getAnnouncementByPageId(pageId),
    {
      enabled: !!pageId, // Only fetch if pageId is present
      staleTime: 0,
    }
  );
};

// Create a new announcement
export const useCreateAnnouncement = () => {
  const queryClient = useQueryClient();

  return useMutation((newAnnouncement: AnnouncementCreate) => createAnnouncement(newAnnouncement), {
    onSuccess: () => {
      queryClient.invalidateQueries('announcements'); // refresh announcements list
    },
  });
};

// Update an existing announcement
export const useUpdateAnnouncement = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({ announcementId, announcementData }: { announcementId: number; announcementData: AnnouncementUpdate }) =>
      updateAnnouncement(announcementId, announcementData),
    {
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries('announcements');
        queryClient.invalidateQueries(['announcement', variables.announcementId]); // refresh specific announcement
      },
    }
  );
};

// Delete an announcement
export const useDeleteAnnouncement = () => {
  const queryClient = useQueryClient();

  return useMutation((announcementId: number) => deleteAnnouncement(announcementId), {
    onSuccess: () => {
      queryClient.invalidateQueries('announcements'); // refresh announcements list
    },
  });
};