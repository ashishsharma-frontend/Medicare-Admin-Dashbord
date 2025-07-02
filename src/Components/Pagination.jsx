/* eslint-disable react/prop-types */

import ReactPaginate from "react-paginate";
import { Button, HStack, useColorMode, useStyleConfig } from "@chakra-ui/react";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const handlePageClick = (event) => {
    onPageChange(event.selected + 1);
  };
  
  

  const paginationStyle = useStyleConfig("Pagination");

  return (
    <HStack spacing={2} mt={4}>
      <ReactPaginate
        previousLabel={
          <Button variant="link" mr={5} size={"sm"}>
            Previous
          </Button>
        }
        nextLabel={
          <Button variant="link" ml={5} size={"sm"}>
            Next
          </Button>
        }
        breakLabel={"..."}
        breakClassName={"break-me"}
        pageCount={totalPages}
        marginPagesDisplayed={2}
        pageRangeDisplayed={5}
        onPageChange={handlePageClick}
        containerClassName={"pagination"}
        pageClassName={"page-item"}
        pageLinkClassName={"page-link"}
        previousClassName={"previous-item"}
        nextClassName={"next-item"}
        activeClassName={"active"}
        disabledClassName={"disabled"}
        renderOnZeroPageCount={null}
        style={paginationStyle}
        forcePage={currentPage - 1} 
      />
    </HStack>
  );
};

export default Pagination;
