import { AiFillEye } from "react-icons/ai";
/* eslint-disable react/prop-types */
import {
  Box,
  Button,
  Checkbox,
  CheckboxGroup,
  Flex,
  IconButton,
  Input,
  Skeleton,
  theme,
  Tooltip,
  useToast,
} from "@chakra-ui/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import DynamicTable from "../../Components/DataTable";
import { GET } from "../../Controllers/ApiControllers";
import admin from "../../Controllers/admin";
import { useNavigate } from "react-router-dom";
import getStatusBadge from "../../Hooks/StatusBadge";
import { useEffect, useRef, useState } from "react";
import Pagination from "../../Components/Pagination";
import useDebounce from "../../Hooks/UseDebounce";
import ErrorPage from "../../Components/ErrorPage";
import useHasPermission from "../../Hooks/HasPermission";
import NotAuth from "../../Components/NotAuth";
import moment from "moment";
import { RefreshCwIcon } from "lucide-react";
import DateRangeCalender from "../../Components/DateRangeCalender";

const getPageIndices = (currentPage, itemsPerPage) => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  let endIndex = startIndex + itemsPerPage - 1;
  return { startIndex, endIndex };
};

export default function AppointmentStatusLog() {
  const navigate = useNavigate();
  const toast = useToast();
  const id = "Errortoast";
  const [page, setPage] = useState(1);
  const boxRef = useRef(null);
  const [searchQuery, setsearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 1000);
  const [statusFilters, setStatusFilters] = useState([]); // Track status filters
  const { startIndex, endIndex } = getPageIndices(page, 50);
  const { hasPermission } = useHasPermission();
  const queryClient = useQueryClient();

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

  const handleStatusChange = (selectedStatuses) => {
    setStatusFilters(selectedStatuses); // Update the state when checkboxes change
  };

  const getData = async () => {
    const url =
      admin.role.name === "Doctor"
        ? `get_appointment_status_log_page?start=${startIndex}&end=${endIndex}&search=${debouncedSearchQuery}&start_date=${start_date}&end_date=${end_date}&status=${statusFilters.join(
            ", "
          )}&&doctor_id=${admin.id}`
        : `get_appointment_status_log_page?start=${startIndex}&end=${endIndex}&search=${debouncedSearchQuery}&start_date=${start_date}&end_date=${end_date}&status=${statusFilters.join(
            ", "
          )}`;
    const res = await GET(admin.token, url);
    const rearrangedArray = res?.data.map((item) => {
      const {
        id,
        patient_id,
        status,
        created_at,
        f_name,
        l_name,
        notes,
        appointment_id,
      } = item;
      return {
        id: id,
        appointment_id: appointment_id,
        PatientID: `#${patient_id}`,
        Patient: `${f_name} ${l_name}`,
        Status: getStatusBadge(status),
        Date: moment(created_at).format("DD MMM YYYY"),
        Time: moment(created_at).format("hh:mm A"),
        Notes: (
          <Tooltip
            label={notes || "No notes available"}
            aria-label="Notes Tooltip"
          >
            <span>{notes || "No notes available"}</span>
          </Tooltip>
        ),
        filterStatus: status,
      };
    });

    // Filter based on selected statuses
    const filteredData = statusFilters.length
      ? rearrangedArray.filter((item) => {
          return (
            statusFilters.includes(item.filterStatus) ||
            (statusFilters.includes("Cancellation") &&
              item.current_cancel_req_status !== null)
          );
        })
      : rearrangedArray;

    return {
      data: filteredData.sort((a, b) => b.id - a.id),
      total_record: res.total_record,
    };
  };

  const { isLoading, data, error, isFetching, isRefetching } = useQuery({
    queryKey: [
      "appointment-status-log",
      page,
      debouncedSearchQuery,
      statusFilters,
      dateRange,
    ],
    queryFn: getData,
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
    return <ErrorPage errorCode={error.name} />;
  }

  if (!hasPermission("APPOINTMENT_VIEW")) return <NotAuth />;

  return (
    <Box ref={boxRef}>
      {isLoading || !data ? (
        <Box>
          <Flex mb={5} justify={"space-between"}>
            <Skeleton w={400} h={8} />
            <Skeleton w={200} h={8} />
          </Flex>
          {/* Loading skeletons */}
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
                onChange={(e) => setsearchQuery(e.target.value)}
                value={searchQuery}
              />
              <DateRangeCalender
                dateRange={dateRange}
                setDateRange={setdateRange}
                size={"md"}
              />
            </Flex>
          </Flex>

          {/* Status checkboxes */}
          <Flex alignItems={"top"} justifyContent={"space-between"}>
            {" "}
            <CheckboxGroup
              colorScheme="blue"
              onChange={handleStatusChange}
              value={statusFilters}
            >
              <Flex mb={5} gap={4} alignItems={"center"}>
                <Checkbox value="Confirmed">Confirmed</Checkbox>
                <Checkbox value="Visited">Visited</Checkbox>
                <Checkbox value="Completed">Completed</Checkbox>
                <Checkbox value="Pending">Pending</Checkbox>
                <Checkbox value="Cancelled">Cancelled</Checkbox>
                <Checkbox value="Rejected">Rejected</Checkbox>
                <Checkbox value="Cancellation">Cancellation Initiated</Checkbox>
              </Flex>
            </CheckboxGroup>{" "}
            <Button
              isLoading={isFetching || isRefetching}
              size={"sm"}
              colorScheme="blue"
              onClick={() => {
                queryClient.invalidateQueries(
                  [
                    "appointment-status-log",
                    page,
                    debouncedSearchQuery,
                    statusFilters,
                  ],
                  { refetchInactive: true }
                );
              }}
              rightIcon={<RefreshCwIcon size={14} />}
            >
              Refresh Table
            </Button>
          </Flex>

          <DynamicTable
            minPad={"1px 10px"}
            data={data?.data}
            onActionClick={
              <YourActionButton onClick={() => {}} navigate={navigate} />
            }
          />
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

const YourActionButton = ({ onClick, rowData, navigate }) => {
  const { hasPermission } = useHasPermission();
  return (
    <Flex justify={"center"}>
      {hasPermission("APPOINTMENT_VIEW") && (
        <IconButton
          size={"sm"}
          variant={"ghost"}
          onClick={() => {
            onClick(rowData);
            navigate(`/appointment/${rowData.appointment_id}`);
          }}
          icon={<AiFillEye fontSize={18} color={theme.colors.blue[500]} />}
        />
      )}
    </Flex>
  );
};
