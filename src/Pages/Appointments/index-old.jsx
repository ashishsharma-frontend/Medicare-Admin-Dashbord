/* eslint-disable react/prop-types */
import {
  Badge,
  Box,
  Button,
  Checkbox,
  CheckboxGroup,
  Flex,
  IconButton,
  Input,
  Skeleton,
  theme,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { FiEdit } from "react-icons/fi";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import DynamicTable from "../../Components/DataTable";
import { GET } from "../../Controllers/ApiControllers";
import admin from "../../Controllers/admin";
import { useNavigate } from "react-router-dom";
import getStatusBadge from "../../Hooks/StatusBadge";
import getCancellationStatusBadge from "../../Hooks/CancellationReqBadge";
import AddNewAppointment from "./AddNewAppointment";
import { useEffect, useRef, useState } from "react";
import Pagination from "../../Components/Pagination";
import useDebounce from "../../Hooks/UseDebounce";
import ErrorPage from "../../Components/ErrorPage";
import useHasPermission from "../../Hooks/HasPermission";
import NotAuth from "../../Components/NotAuth";
import moment from "moment";
import { RefreshCwIcon } from "lucide-react";
import t from "../../Controllers/configs";
import DateRangeCalender from "../../Components/DateRangeCalender";

const getPageIndices = (currentPage, itemsPerPage) => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  let endIndex = startIndex + itemsPerPage - 1;
  return { startIndex, endIndex };
};


export default function Appointments() {
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
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
        ? `get_appointments/doctor_id/page?start=${startIndex}&end=${endIndex}&doctor_id=${
            admin.id
          }&search=${debouncedSearchQuery}&start_date=${start_date}&end_date=${end_date}&status=${statusFilters.join(
            ", "
          )}`
        : `get_appointments/page?start=${startIndex}&end=${endIndex}&search=${debouncedSearchQuery}&start_date=${start_date}&end_date=${end_date}&status=${statusFilters.join(
            ", "
          )}`;
    await t();
    const res = await GET(admin.token, url);
    const rearrangedArray = res?.data.map((item) => {
      const {
        id,
        patient_id,
        status,
        date,
        time_slots,
        type,
        payment_status,
        current_cancel_req_status,
        patient_f_name,
        patient_l_name,
        patient_phone,
        doct_f_name,
        doct_l_name,
        doct_image,
        source,
      } = item;

      return {
        id: id,
        image: doct_image,
        Doctor: `${doct_f_name} ${doct_l_name}`,
        Patient: `${patient_f_name} ${patient_l_name} - #${patient_id}`,
        phone: patient_phone,
        Status: getStatusBadge(status),
        Date: moment(date).format("DD MMM YYYY"),
        "Time Slots": moment(time_slots, "HH:mm:ss").format("hh:mm A"),
        Type:
          type === "OPD" ? (
            <Badge colorScheme="blue">{type} - Walk in/Telephone</Badge>
          ) : type === "Emergency" ? (
            <Badge colorScheme="red">{type}</Badge>
          ) : (
            <Badge colorScheme="green">{type}</Badge>
          ),
        "Payment Status":
          payment_status === "Paid" ? (
            <Badge colorScheme="green">{payment_status}</Badge>
          ) : payment_status === "Refunded" ? (
            <Badge colorScheme="blue">{payment_status}</Badge>
          ) : (
            <Badge colorScheme="red">{"Not Paid"}</Badge>
          ),
        "Cancellation Status": getCancellationStatusBadge(
          current_cancel_req_status
        ),
        source,
        filterStatus: status,
        current_cancel_req_status: current_cancel_req_status,
      };
    });

    return {
      data: rearrangedArray,
      total_record: res.total_record,
    };
  };

  const { isLoading, data, error, isFetching, isRefetching } = useQuery({
    queryKey: [
      "appointments",
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
            <Box>
              <Button
                size={"sm"}
                colorScheme="blue"
                onClick={() => {
                  onOpen();
                }}
                isDisabled={!hasPermission("APPOINTMENT_ADD")}
              >
                Add New
              </Button>
            </Box>
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
                  ["appointments", page, debouncedSearchQuery, statusFilters],
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

      {/* Add New Appointment */}
      {isOpen && <AddNewAppointment isOpen={isOpen} onClose={onClose} />}
    </Box>
  );
}

const YourActionButton = ({ onClick, rowData, navigate }) => {
  const { hasPermission } = useHasPermission();
  return (
    <Flex justify={"center"}>
      {hasPermission("APPOINTMENT_UPDATE") && (
        <IconButton
          size={"sm"}
          variant={"ghost"}
          _hover={{ background: "none" }}
          onClick={() => {
            onClick(rowData);
            navigate(`/appointment/${rowData.id}`);
          }}
          icon={<FiEdit fontSize={18} color={theme.colors.blue[500]} />}
        />
      )}
    </Flex>
  );
};
