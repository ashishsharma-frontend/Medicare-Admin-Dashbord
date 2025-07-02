/* eslint-disable react/prop-types */
import {
  Box,
  Button,
  Flex,
  Input,
  Skeleton,
  Tooltip,
  useToast,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { GET } from "../../Controllers/ApiControllers";
import admin from "../../Controllers/admin";
import DynamicTable from "../../Components/DataTable";
import { useNavigate } from "react-router-dom";
import getFile from "./getfile";
import printPrescription from "./getPrescription";
import Pagination from "../../Components/Pagination";
import DateRangeCalender from "../../Components/DateRangeCalender";
import useDebounce from "../../Hooks/UseDebounce";
import moment from "moment";
import { useState } from "react";


const getPageIndices = (currentPage, itemsPerPage) => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  let endIndex = startIndex + itemsPerPage - 1;
  return { startIndex, endIndex };
};

export default function DoctorNotification({ currentTab, activeTab }) {
  const navigate = useNavigate();
  const toast = useToast();
  const id = "Errortoast";
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 1000);
  const { startIndex, endIndex } = getPageIndices(page, 50);
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

  const getData = async () => {
    const url =
      admin.role.name === "Doctor"
        ? `get_doctor_notification_page?doctor_id=${admin.id}`
        : `get_doctor_notification_page`;
    const res = await GET(
      admin.token,
      `${url}?start=${startIndex}&end=${endIndex}&search=${debouncedSearchQuery}&start_date=${start_date}&end_date=${end_date}`
    );

    const newData = res.data.map((item) => {
      const {
        id,
        title,
        appointment_id,
        file_id,
        prescription_id,
        image,
        updated_at,
      } = item;

      return {
        id,
        title: (
          <Tooltip
            label={title}
            placement="top"
            hasArrow
            bg="gray.600"
            color="white"
            transition="all 0.1s"
            borderRadius="md"
            cursor={"pointer"}
            size={"sm"}
          >
            {title}
          </Tooltip>
        ),
        appointment_id: appointment_id ? (
          <Button
            colorScheme="blue"
            onClick={() => navigate(`/appointment/${appointment_id}`)}
            size="xs"
            mt={2}
          >
            Go to Appointment
          </Button>
        ) : (
          "N/A"
        ),
        file_id: file_id ? (
          <Button
            colorScheme="green"
            onClick={() => {
              getFile(file_id);
            }}
            size="xs"
            mt={2}
          >
            Go to File
          </Button>
        ) : (
          "N/A"
        ),
        prescription_id: prescription_id ? (
          <Button
            colorScheme="green"
            onClick={() => {
              printPrescription(prescription_id);
            }}
            size="xs"
            mt={2}
          >
            Go to Prescription
          </Button>
        ) : (
          "N/A"
        ),
        image,
        updated_at,
      };
    });

    return {
      data: newData,
      total_record: res.total_record,
    };
  };

  const { isLoading, data, error } = useQuery({
    queryKey: [
      "notification-doctor",
      debouncedSearchQuery,
      page,
      start_date,
      end_date,
    ],
    queryFn: getData,
    enabled: currentTab === activeTab,
  });

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const totalPage = Math.ceil(data?.total_record / 50);

  if (error) {
    if (!toast.isActive(id)) {
      toast({
        id,
        title: "Oops!",
        description: "Something bad happened.",
        status: "error",
        duration: 2000,
        isClosable: true,
        position: "top",
      });
    }
  }

  return (
    <Box>
      {isLoading || !data ? (
        <Box>
          <Flex mb={5} justify={"space-between"}>
            <Skeleton w={400} h={8} />
            <Skeleton w={50} h={8} />
          </Flex>
          <Skeleton h={300} w={"100%"} />
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
          </Flex>
          <DynamicTable minPad={"8px 8px"} data={data.data} />
        </Box>
      )}

      <Flex justify={"center"} mt={4}>
        <Pagination
          currentPage={page}
          onPageChange={handlePageChange}
          totalPages={totalPage}
        />
      </Flex>
    </Box>
  );
}
