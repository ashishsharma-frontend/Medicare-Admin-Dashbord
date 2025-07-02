import { BiLinkExternal } from "react-icons/bi";
/* eslint-disable react/prop-types */
import {
  Box,
  Button,
  Flex,
  IconButton,
  Input,
  Skeleton,
  theme,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useRef, useState } from "react";
import { FaTrash } from "react-icons/fa";
import { FiEdit } from "react-icons/fi";
import { useQuery } from "@tanstack/react-query";
import DynamicTable from "../../Components/DataTable";
import { GET } from "../../Controllers/ApiControllers";
import admin from "../../Controllers/admin";
import { Link, useNavigate } from "react-router-dom";
import useHasPermission from "../../Hooks/HasPermission";
import NotAuth from "../../Components/NotAuth";
import AddCheckin from "./Add";
import UpdateCheckin from "./Update";
import DeleteCheckin from "./Delete";
import moment from "moment";
import useDebounce from "../../Hooks/UseDebounce";
import DateRangeCalender from "../../Components/DateRangeCalender";
import Pagination from "../../Components/Pagination";
import { daysBack } from "../../Controllers/dateConfig";

const sevenDaysBack = moment().subtract(daysBack, "days").format("YYYY-MM-DD");
const today = moment().format("YYYY-MM-DD");

const getPageIndices = (currentPage, itemsPerPage) => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  let endIndex = startIndex + itemsPerPage - 1;
  return { startIndex, endIndex };
};
export default function Checkin() {
  const { hasPermission } = useHasPermission();
  const [SelectedData, setSelectedData] = useState();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [page, setPage] = useState(1);
  const { startIndex, endIndex } = getPageIndices(page, 50);
  const boxRef = useRef(null);
  const [searchQuery, setsearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 1000);
  const [dateRange, setdateRange] = useState({
    startDate: sevenDaysBack,
    endDate: today,
  });
  const start_date = moment(dateRange.startDate).format("YYYY-MM-DD");
  const end_date = moment(dateRange.endDate).format("YYYY-MM-DD");

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
  const navigate = useNavigate();

  const toast = useToast();
  const id = "Errortoast";

  const { isLoading: isAtpriorityLoading, data: atPriority } = useQuery({
    queryKey: ["doct_id", admin.id],
    queryFn: async () => {
      const res = await GET(admin.token, `get_queue_data/${admin.id}`);
      //console.log(res.data);
      return res.data;
    },
  });

  const getData = async () => {
    const url =
      admin.role.name === "Doctor"
        ? `get_appointment_check_in_page?start=${startIndex}&end=${endIndex}&search=${debouncedSearchQuery}&start_date=${start_date}&end_date=${end_date}&doctor_id=${admin.id}`
        : `get_appointment_check_in_page?start=${startIndex}&end=${endIndex}&search=${debouncedSearchQuery}&start_date=${start_date}&end_date=${end_date}`;
    const res = await GET(admin.token, url);

    //console.log(res);
    const rearrangedArray = res?.data.map((doctor) => {
      const {
        id,
        appointment_id,
        time,
        date,
        type,
        created_at,
        updated_at,
        doct_f_name,
        doct_l_name,
        patient_f_name,
        patient_l_name,
      } = doctor;
      return {
        id,
        app_id: (
          <Link to={`/appointment/${appointment_id}`}>
            <Flex gap={1} align={"center"}>
              {appointment_id} <BiLinkExternal />
            </Flex>
          </Link>
        ),
        doctor: `${doct_f_name} ${doct_l_name}`,
        patient: `${patient_f_name} ${patient_l_name}`,
        Date: moment(date).format("DD MMM YYYY"),
        Time: moment(time, "HH:mm:ss").format("hh:mm A"),
        type:type,
        created_at,
        updated_at,
      };
    });

    // Group appointments by type
    const groupedAppointments = rearrangedArray.reduce((acc, appointment) => {
      if (!acc[appointment.type]) acc[appointment.type] = [];
      acc[appointment.type].push(appointment);
      return acc;
    }, {});

    // Final new appointments array
    const newAppointments = [];
    //console.log('GROUPED :', groupedAppointments);

    //let newAppointments = [];

    // Determine the maximum number of iterations required based on appointment distribution
    let maxLength = 0;
    for (const property in groupedAppointments) {
      for (const item of atPriority) {
        if (property === item.type && item.no > 0) {
          const tempLength = Math.ceil(groupedAppointments[property].length / item.no);
          if (tempLength > maxLength) {
            maxLength = tempLength;
          }
        }
      }
    }
    //console.log('LENGTH', maxLength);
    // Process appointments based on sortdep priority
    for (let i = 0; i < maxLength; i++) {
      for (const item of atPriority) {
        const type = item.type;
        const appointmentsList = groupedAppointments[type] || [];

        // Add appointments if available
        var j = item.no;
        while (j > 0 && appointmentsList.length > 0) {
          newAppointments.push(appointmentsList.shift());
          j--;
        }
        //console.log(i);
        //console.log(newAppointments);
      }


    }
    if (admin.role.name === "Doctor") {
      return { data: newAppointments, total_record: res.total_record };
    } else {
      return { data: rearrangedArray, total_record: res.total_record };
    }

    // return { data: rearrangedArray, total_record: res.total_record };
  };

  const handleActionClick = (rowData) => {
    setSelectedData(rowData);
  };

  const { isLoading, data, error } = useQuery({
    queryKey: ["checkins", page, debouncedSearchQuery, dateRange],
    queryFn: getData,
  });

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };
  const totalPage = Math.ceil(data?.total_record / 50);

  if (error) {
    if (!toast.isActive(id)) {
      toast({
        id,
        title: "oops!.",
        description: "Something bad happens.",
        status: "error",
        duration: 2000,
        isClosable: true,
        position: "top",
      });
    }
  }

  if (!hasPermission("CHECKIN_VIEW")) return <NotAuth />;

  return (
    <Box ref={boxRef}>
      {isLoading || !data ? (
        <Box>
          <Flex mb={5} justify={"space-between"}>
            <Skeleton w={400} h={8} />
            <Skeleton w={200} h={8} />
          </Flex>
          <Skeleton h={10} w={"100%"} mt={2} />
          <Skeleton h={10} w={"100%"} mt={2} />
          <Skeleton h={10} w={"100%"} mt={2} />
          <Skeleton h={10} w={"100%"} mt={2} />
          <Skeleton h={10} w={"100%"} mt={2} />
          <Skeleton h={10} w={"100%"} mt={2} />
          <Skeleton h={10} w={"100%"} mt={2} />
          <Skeleton h={10} w={"100%"} mt={2} />
          <Skeleton h={10} w={"100%"} mt={2} />
          <Skeleton h={10} w={"100%"} mt={2} />
        </Box>
      ) : (
        <Box>
          <Flex mb={5} justify={"space-between"} align={"center"}>
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
            <Box>
              <Flex align={"center"} gap={5}>
                {" "}
                <Button
                  size={"sm"}
                  colorScheme="blue"
                  onClick={() => {
                    const baseUrl = `${window.location.protocol}//${window.location.host}`;
                    window.open(`${baseUrl}/admin/queue`, "_blank");
                  }}
                  rightIcon={<BiLinkExternal />}
                >
                  Show Checkin Display
                </Button>
                <Button
                  isDisabled={!hasPermission("CHECKIN_ADD")}
                  size={"sm"}
                  colorScheme="blue"
                  onClick={() => {
                    onOpen();
                  }}
                >
                  New Checkin
                </Button>
              </Flex>
            </Box>
          </Flex>
          <DynamicTable
            data={data.data}
            onActionClick={
              <YourActionButton
                onClick={handleActionClick}
                navigate={navigate}
                EditonOpen={EditonOpen}
                DeleteonOpen={DeleteonOpen}
              />
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

      {isOpen && <AddCheckin isOpen={isOpen} onClose={onClose} />}
      {EditisOpen && (
        <UpdateCheckin
          data={SelectedData}
          isOpen={EditisOpen}
          onClose={EditonClose}
        />
      )}

      {DeleteisOpen && (
        <DeleteCheckin
          isOpen={DeleteisOpen}
          onClose={DeleteonClose}
          data={SelectedData}
        />
      )}
    </Box>
  );
}

const YourActionButton = ({ onClick, rowData, DeleteonOpen, EditonOpen }) => {
  const { hasPermission } = useHasPermission();
  return (
    <Flex justify={"center"}>
      <IconButton
        isDisabled={!hasPermission("CHECKIN_UPDATE")}
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
      <IconButton
        isDisabled={!hasPermission("CHECKIN_DELETE")}
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
    </Flex>
  );
};
