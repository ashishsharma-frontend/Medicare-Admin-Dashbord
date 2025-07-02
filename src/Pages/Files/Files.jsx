import { FiExternalLink } from "react-icons/fi";
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react/prop-types */
import {
  Box,
  Button,
  Flex,
  IconButton,
  Input,
  Link,
  Skeleton,
  theme,
  useDisclosure,
} from "@chakra-ui/react";
import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { GET } from "../../Controllers/ApiControllers";
import admin from "../../Controllers/admin";
import { FaTrash } from "react-icons/fa";

import useHasPermission from "../../Hooks/HasPermission";
import NotAuth from "../../Components/NotAuth";
import DynamicTable from "../../Components/DataTable";
import { FiEdit } from "react-icons/fi";
import UpdatePatientFiles from "../Patients/UpdatePatientFiles";
import useDebounce from "../../Hooks/UseDebounce"; // Use debounce for search
import Pagination from "../../Components/Pagination"; // Pagination component
import DateRangeCalender from "../../Components/DateRangeCalender"; // Date range filtering component
import imageBaseURL from "../../Controllers/image";
import ErrorPage from "../../Components/ErrorPage";
import AddPatientsFiles from "./AddFile";
import DeletePatientFiles from "../Patients/DeletePatientFile";
import moment from "moment"; // For date manipulation

const getPageIndices = (currentPage, itemsPerPage) => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  let endIndex = startIndex + itemsPerPage - 1;
  return { startIndex, endIndex };
};

export default function Files() {
  const [selectedData, setselectedData] = useState();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { hasPermission } = useHasPermission();
  const {
    isOpen: EditisOpen,
    onOpen: EditonOpen,
    onClose: EditonClose,
  } = useDisclosure();
  const {
    isOpen: DeleteisOpen,
    onOpen: DeleteonOpen,
    onClose: DeleteonClose,
  } = useDisclosure();

  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 1000); // Debounce search query
  const [dateRange, setdateRange] = useState({
    startDate: null,
    endDate: null,
  });

  const start_date = dateRange.startDate
    ? moment(dateRange.startDate).format("YYYY-MM-DD")
    : "";
  const end_date = dateRange.endDate
    ? moment(dateRange.endDate).format("YYYY-MM-DD")
    : "";

  const { startIndex, endIndex } = getPageIndices(page, 50);
  const boxRef = useRef(null);

  const handleActionClick = (rowData) => {
    setselectedData(rowData);
  };

  const getPatientFiles = async () => {
    const res = await GET(
      admin.token,
      `get_patient_file_page?start=${startIndex}&end=${endIndex}&search=${debouncedSearchQuery}&start_date=${start_date}&end_date=${end_date}`
    );
    const rearrangedArray = res?.data.map((item) => {
      const {
        id,
        patient_id,
        file_name,
        file,
        f_name,
        l_name,
        phone,
        isd_code,
        updated_at,
        created_at,
      } = item;

      return {
        id: id,
        patient_id,
        "file name": (
          <Link
            isExternal
            href={`${imageBaseURL}/${file}`}
            display={"flex"}
            alignItems={"center"}
            gap={3}
          >
            {file_name} <FiExternalLink />
          </Link>
        ),
        patient_Name: `${f_name} ${l_name}`,
        phone: `${isd_code}${phone}`,
        created_at,
        updated_at,
      };
    });
    return {
      data: rearrangedArray,
      total_record: res.total_record,
    };
  };

  const {
    data,
    isLoading: patientFilesLoading,
    error,
  } = useQuery({
    queryKey: ["all-files", debouncedSearchQuery, page, start_date, end_date],
    queryFn: getPatientFiles,
  });

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const totalPage = Math.ceil(data?.total_record / 50);

  useEffect(() => {
    if (boxRef.current) {
      boxRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [page]);

  if (error) return <ErrorPage errorCode={error.name} />;
  if (!hasPermission("FILE_VIEW")) return <NotAuth />;

  return (
    <Box ref={boxRef}>
      {patientFilesLoading || !data ? (
        <Box>
          <Flex mb={5} justify={"space-between"}>
            <Skeleton w={400} h={8} />
            <Skeleton w={200} h={8} />
          </Flex>
          {[...Array(10)].map((_, index) => (
            <Skeleton key={index} h={10} w={"100%"} mt={2} />
          ))}
        </Box>
      ) : (
        <Box>
          <Flex mb={5} justify={"space-between"} align={"center"}>
            <Flex align={"center"} gap={4}>
              <Input
                size={"md"}
                placeholder="Search"
                w={400}
                maxW={"50vw"}
                onChange={(e) => setSearchQuery(e.target.value)}
                value={searchQuery}
              />
              <DateRangeCalender
                dateRange={dateRange}
                setDateRange={setdateRange}
                size={"md"}
              />
            </Flex>
            <Box>
              <Button
                isDisabled={!hasPermission("FILE_ADD")}
                size={"sm"}
                colorScheme="blue"
                onClick={onOpen}
              >
                Add New
              </Button>
            </Box>
          </Flex>

          <DynamicTable
            minPad={"8px 8px"}
            data={data.data}
            onActionClick={
              <YourActionButton
                onClick={handleActionClick}
                DeleteonOpen={DeleteonOpen}
                EditonOpen={EditonOpen}
              />
            }
          />
          <Flex justify={"center"} mt={4}>
            <Pagination
              currentPage={page}
              onPageChange={handlePageChange}
              totalPages={totalPage}
            />
          </Flex>
        </Box>
      )}
      {isOpen && <AddPatientsFiles isOpen={isOpen} onClose={onClose} />}
      {EditisOpen && (
        <UpdatePatientFiles
          isOpen={EditisOpen}
          onClose={EditonClose}
          data={selectedData}
        />
      )}
      {DeleteisOpen && (
        <DeletePatientFiles
          isOpen={DeleteisOpen}
          onClose={DeleteonClose}
          data={selectedData}
        />
      )}
    </Box>
  );
}

const YourActionButton = ({ onClick, rowData, DeleteonOpen, EditonOpen }) => {
  const { hasPermission } = useHasPermission();
  return (
    <Flex justify={"center"}>
      {hasPermission("FILE_UPDATE") && (
        <IconButton
          size={"sm"}
          variant={"ghost"}
          _hover={{
            background: "none",
          }}
          onClick={() => {
            onClick(rowData);
            EditonOpen();
          }}
          icon={<FiEdit fontSize={18} color={theme.colors.blue[500]} />}
        />
      )}
      {hasPermission("FILE_DELETE") && (
        <IconButton
          size={"sm"}
          variant={"ghost"}
          _hover={{
            background: "none",
          }}
          onClick={() => {
            onClick(rowData);
            DeleteonOpen();
          }}
          icon={<FaTrash fontSize={18} color={theme.colors.red[500]} />}
        />
      )}
    </Flex>
  );
};
