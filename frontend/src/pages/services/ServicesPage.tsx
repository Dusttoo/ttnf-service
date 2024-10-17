import React, { useState } from 'react';
import ServicesList from '../../components/services/ServiceList';
import Pagination from '../../components/common/Pagination';

const ServicesPage: React.FC = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);

    const handlePageChange = (page: number, itemsPerPage: number) => {
        setCurrentPage(page);
        setItemsPerPage(itemsPerPage);
    };

    return (
        <div>
            <ServicesList
                page={currentPage}
                pageSize={itemsPerPage}
                onTotalItemsChange={(total) => setTotalItems(total)}
            />
            <Pagination
                totalItems={totalItems}
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
            />
        </div>
    );
};

export default ServicesPage;
