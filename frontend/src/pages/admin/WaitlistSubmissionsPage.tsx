import React, { useState } from 'react';
import ReusableTable from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import { useWaitlistSubmissions } from '../../hooks/useAdmin';
import { WaitlistEntry } from '../../api/types/admin';
import { ColumnDefinition } from '../../components/common/Table';

const WaitlistPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading, isError, error } = useWaitlistSubmissions({ page, pageSize });

  const columns: ColumnDefinition<WaitlistEntry>[] = [
    { header: 'ID', accessor: 'id' },
    { header: 'Name', accessor: 'name' },
    { header: 'Email', accessor: 'email' },
    { header: 'Gender Preference', accessor: 'gender_preference' },
    { header: 'Color Preference', accessor: 'color_preference' },
    { header: 'Additional Info', accessor: 'additional_info' },
  ];

  const handlePageChange = (newPage: number, newPageSize: number) => {
    setPage(newPage);
    setPageSize(newPageSize);
  };

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Error loading waitlist submissions: {error?.message}</p>;

  return (
    <div>
      <h2>Waitlist Submissions</h2>
      <ReusableTable columns={columns} data={data?.items || []} />
      <Pagination
        totalItems={data?.totalCount || 0}
        currentPage={page}
        itemsPerPage={pageSize}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default WaitlistPage;