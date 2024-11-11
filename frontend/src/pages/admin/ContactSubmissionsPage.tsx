import React, { useState } from 'react';
import ReusableTable from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import { useContactSubmissions } from '../../hooks/useAdmin';
import { ContactSubmission } from '../../api/types/admin';
import { ColumnDefinition } from '../../components/common/Table';

const ContactSubmissionsPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading, isError, error } = useContactSubmissions({ page, pageSize });

  const columns: ColumnDefinition<ContactSubmission>[] = [
    // { header: 'ID', accessor: 'id' },
    { header: 'Name', accessor: 'name' },
    { header: 'Email', accessor: 'email' },
    { header: 'Phone', accessor: 'phone' },
    { header: 'Message', accessor: 'message' },
    // { header: 'Submitted At', accessor: 'createdAt' },
  ];

  const handlePageChange = (newPage: number, newPageSize: number) => {
    setPage(newPage);
    setPageSize(newPageSize);
  };

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Error loading contact submissions: {error?.message}</p>;

  return (
    <div>
      <h2>Contact Submissions</h2>
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

export default ContactSubmissionsPage;