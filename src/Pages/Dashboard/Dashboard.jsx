import { BiCheckShield } from "react-icons/bi";
/* eslint-disable react-hooks/rules-of-hooks */
import useAppointmentData from "../../Hooks/UseAppointmentData";
import useUserData from "../../Hooks/Users";
import useTransactionData from "../../Hooks/UseTransaction";
import {
  Box,
  Button,
  Flex,
  Skeleton,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import WelcomeCard from "./WelcomeCard";
import usePatientData from "../../Hooks/UsePatientsData";
import AppointmentChart from "./AppointmentChart";
import StatusPieChart from "./AppointmentStatusPieChart";
import TransactionChart from "./TransactionChart";
import TransactionPieChart from "./TransactionPieChart";
import { MdAddCircleOutline } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import AddMedicine from "../Medicines/AddMedicine";
import AddNewAppointment from "../Appointments/AddNewAppointment";
import UsersReg from "./UsersReg";
import PatientsReg from "./PatientsReg";
import AppointmentReg from "./AppointmentReg";
import AddPatients from "../Patients/AddPatients";
import { useQuery } from "@tanstack/react-query";
import { GET } from "../../Controllers/ApiControllers";
import admin from "../../Controllers/admin";
import ClockWithCountdown from "../../Components/LiveClock";
import useHasPermission from "../../Hooks/HasPermission";
import CancellationReqStatsics from "./CancellationReqStatsics";
import CancellationPieChart from "./CancelationReqChart";
import {
  AppointmentCardsOthers,
  AppointmentCardsTop,
} from "./AppointmentCards";
import AppointmentsCalendar from "./Calender";
import AddCheckin from "../Checkin/Add";

const getData = async () => {
  const res = await GET(admin.token, "get_dashboard_count");
  if (res.response !== 200) {
    throw new Error(res.message);
  }
  return res.data;
};
const getDataByDoct = async () => {
  const res = await GET(admin.token, `get_dashboard_count/doctor/${admin.id}`);
  if (res.response !== 200) {
    throw new Error(res.message);
  }
  return res.data;
};

export default function DashboardMain() {
  const { appointmentsData } = useAppointmentData();
  const { usersData } = useUserData();
  const { transactionsData } = useTransactionData();
  const { patientsData } = usePatientData();
  const { hasPermission } = useHasPermission();

  //
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: admin.role.name === "Doctor" ? getDataByDoct : getData,
  });

  // filter fn
  const completedAppointment = appointmentsData?.filter(
    (appointment) =>
      appointment.status === "Completed" || appointment.status === "Visited"
  );
  const CancelledAppointments = appointmentsData?.filter(
    (appointment) => appointment.status === "Cancelled"
  );
  const confirmAppointments = appointmentsData?.filter(
    (appointment) =>
      appointment.status != "Cancelled" ||
      appointment.status != "Rejected" ||
      appointment.status != "Pending"
  );

  // transaction
  const debitTxn = transactionsData?.filter(
    (item) => item.transaction_type === "Debited"
  );
  const creditTxn = transactionsData?.filter(
    (item) => item.transaction_type === "Credited"
  );

  return (
    <Box>
      <Buttons />
      <Flex gap={5} mt={5}>
        <Box width={"35%"} minH={"100%"} flex={1}>
          {isLoading ? (
            <Skeleton w={"100%"} h={240} />
          ) : (
            <WelcomeCard data={data} />
          )}
        </Box>
        <Box width={"70%"} flex={2}>
          {isLoading ? (
            <>
              <Flex gap={5}>
                {" "}
                <>
                  <Skeleton flex={1} w={"100%"} h={24}></Skeleton>
                  <Skeleton flex={1} w={"100%"} h={24}></Skeleton>
                </>
              </Flex>
              <Flex gap={5} mt={8}>
                {" "}
                <>
                  <Skeleton flex={1} w={"100%"} h={24}></Skeleton>
                  <Skeleton flex={1} w={"100%"} h={24}></Skeleton>
                </>
              </Flex>
            </>
          ) : (
            <>
              <AppointmentCardsTop data={data} />
            </>
          )}
        </Box>
      </Flex>
      <Box mt={5}>
        {isLoading ? (
          <>
            <Flex gap={5}>
              {" "}
              <>
                <Skeleton flex={1} w={"100%"} h={24}></Skeleton>
                <Skeleton flex={1} w={"100%"} h={24}></Skeleton>
              </>
            </Flex>
            <Flex gap={5} mt={8}>
              {" "}
              <>
                <Skeleton flex={1} w={"100%"} h={24}></Skeleton>
                <Skeleton flex={1} w={"100%"} h={24}></Skeleton>
              </>
            </Flex>
          </>
        ) : (
          <>
            <AppointmentCardsOthers data={data} />
          </>
        )}
      </Box>
      <Flex gap={2} mt={5}>
        {admin.role.name === "Admin" ? (
          <Box
            flex={1}
            bg={useColorModeValue("#fff", "gray.900")}
            borderRadius={8}
          >
            <UsersReg Users={usersData} />
          </Box>
        ) : hasPermission("USER_VIEW") ? (
          <Box
            flex={1}
            bg={useColorModeValue("#fff", "gray.900")}
            borderRadius={8}
          >
            <UsersReg Users={usersData} />
          </Box>
        ) : null}{" "}
        {admin.role.name === "Admin" ? (
          <Box
            flex={1}
            bg={useColorModeValue("#fff", "gray.900")}
            borderRadius={8}
          >
            <PatientsReg Patients={patientsData} />
          </Box>
        ) : hasPermission("PATIENT_VIEW") ? (
          <Box
            flex={1}
            bg={useColorModeValue("#fff", "gray.900")}
            borderRadius={8}
          >
            <PatientsReg Patients={patientsData} />
          </Box>
        ) : null}{" "}
      </Flex>
      {/* calender */}
      {hasPermission("APPOINTMENT_VIEW") && (
        <Box mt={5}>
          <AppointmentsCalendar appointmentData={appointmentsData} />
        </Box>
      )}
      {/* appointment in last 15 days */}
      {admin.role.name === "Admin" ? (
        <Box mt={5}>
          <AppointmentReg Appointments={appointmentsData} />
        </Box>
      ) : hasPermission("APPOINTMENT_VIEW") ? (
        <Box mt={5}>
          <AppointmentReg Appointments={appointmentsData} />
        </Box>
      ) : null}{" "}
      {/* charts */}
      {admin.role.name === "Admin" ? (
        <Flex gap={5} mt={5}>
          <Box
            maxW={"68%"}
            flex={2}
            bg={useColorModeValue("#fff", "gray.900")}
            borderRadius={8}
          >
            <AppointmentChart
              appointments={appointmentsData}
              cancelledAppointments={CancelledAppointments}
              compleatedAppointments={completedAppointment}
              confirmedAppointments={confirmAppointments}
            />
          </Box>
          <Box
            maxW={"30%"}
            flex={1}
            bg={useColorModeValue("#fff", "gray.900")}
            borderRadius={8}
          >
            <StatusPieChart appointments={appointmentsData} />
          </Box>
        </Flex>
      ) : hasPermission("APPOINTMENT_VIEW") ? (
        <Flex gap={5} mt={5}>
          <Box
            maxW={"68%"}
            flex={2}
            bg={useColorModeValue("#fff", "gray.900")}
            borderRadius={8}
          >
            <AppointmentChart
              appointments={appointmentsData}
              cancelledAppointments={CancelledAppointments}
              compleatedAppointments={completedAppointment}
              confirmedAppointments={confirmAppointments}
            />
          </Box>
          <Box
            maxW={"30%"}
            flex={1}
            bg={useColorModeValue("#fff", "gray.900")}
            borderRadius={8}
          >
            <StatusPieChart appointments={appointmentsData} />
          </Box>
        </Flex>
      ) : null}{" "}
      {admin.role.name === "Admin" ? (
        <Flex gap={5} mt={5}>
          <Box
            maxW={"68%"}
            flex={2}
            bg={useColorModeValue("#fff", "gray.900")}
            borderRadius={8}
          >
            <TransactionChart
              creditTransactions={creditTxn}
              debitTransactions={debitTxn}
            />
          </Box>
          <Box
            maxW={"30%"}
            flex={1}
            bg={useColorModeValue("#fff", "gray.900")}
            borderRadius={8}
          >
            <TransactionPieChart transactions={transactionsData} />
          </Box>
        </Flex>
      ) : hasPermission("ALL_TRANSACTION_VIEW") ? (
        <Flex gap={5} mt={5}>
          <Box
            maxW={"68%"}
            flex={2}
            bg={useColorModeValue("#fff", "gray.900")}
            borderRadius={8}
          >
            <TransactionChart
              creditTransactions={creditTxn}
              debitTransactions={debitTxn}
            />
          </Box>
          <Box
            maxW={"30%"}
            flex={1}
            bg={useColorModeValue("#fff", "gray.900")}
            borderRadius={8}
          >
            <TransactionPieChart transactions={transactionsData} />
          </Box>
        </Flex>
      ) : null}{" "}
      <Flex gap={5} mt={5}>
        <Box maxW={"68%"} flex={2}>
          <CancellationReqStatsics data={data} />
        </Box>
        <Box
          maxW={"30%"}
          flex={1}
          bg={useColorModeValue("#fff", "gray.900")}
          borderRadius={8}
          maxH={"fit-content"}
        >
          <CancellationPieChart cancelData={data} />
        </Box>
      </Flex>
    </Box>
  );
}

const Buttons = () => {
  const { hasPermission } = useHasPermission();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: appointmentisOpen,
    onOpen: appointmentonOpen,
    onClose: appointmentonClose,
  } = useDisclosure();
  const {
    isOpen: patientisOpen,
    onOpen: patientonOpen,
    onClose: patientonClose,
  } = useDisclosure();
  const {
    isOpen: checkinisOpen,
    onOpen: checkinonOpen,
    onClose: checkinonClose,
  } = useDisclosure();
  return (
    <>
      {admin.role.name === "Admin" ? (
        <Flex gap={5} justify={"space-between"}>
          <Flex gap={5} justify={"start"}>
            {" "}
            <Button
              size={"xs"}
              colorScheme={"blue"}
              bg={"blue.700"}
              _hover={{
                bg: "blue.700",
              }}
              color={"#fff"}
              leftIcon={<MdAddCircleOutline fontSize={18} />}
              onClick={() => {
                appointmentonOpen();
              }}
              borderRadius={0}
            >
              Add New Appointment
            </Button>
            <Button
              size={"xs"}
              colorScheme={"blue"}
              bg={"blue.700"}
              _hover={{
                bg: "blue.700",
              }}
              color={"#fff"}
              leftIcon={<MdAddCircleOutline fontSize={18} />}
              onClick={() => {
                navigate("/doctors/add");
              }}
              borderRadius={0}
            >
              Add Doctor
            </Button>
            <Button
              size={"xs"}
              colorScheme={"blue"}
              bg={"blue.700"}
              _hover={{
                bg: "blue.700",
              }}
              color={"#fff"}
              leftIcon={<MdAddCircleOutline fontSize={18} />}
              onClick={() => {
                patientonOpen();
              }}
              borderRadius={0}
            >
              Add Patient
            </Button>
            <Button
              size={"xs"}
              colorScheme={"blue"}
              bg={"blue.700"}
              _hover={{
                bg: "blue.700",
              }}
              color={"#fff"}
              leftIcon={<MdAddCircleOutline fontSize={18} />}
              onClick={() => {
                onOpen();
              }}
              borderRadius={0}
            >
              Add Medicine
            </Button>
            <Button
              size={"xs"}
              colorScheme={"blue"}
              bg={"blue.700"}
              _hover={{
                bg: "blue.700",
              }}
              color={"#fff"}
              leftIcon={<BiCheckShield fontSize={18} />}
              onClick={() => {
                checkinonOpen();
              }}
              borderRadius={0}
            >
              New checkin
            </Button>
          </Flex>
          <ClockWithCountdown />
        </Flex>
      ) : (
        <Flex gap={5} justify={"space-between"}>
          <Flex gap={5} justify={"start"}>
            {hasPermission("APPOINTMENT_ADD") && (
              <Button
                size={"xs"}
                colorScheme={"blue"}
                bg={"blue.700"}
                _hover={{
                  bg: "blue.700",
                }}
                color={"#fff"}
                leftIcon={<MdAddCircleOutline fontSize={18} />}
                onClick={() => {
                  appointmentonOpen();
                }}
                borderRadius={0}
              >
                Add New Appointment
              </Button>
            )}
            {hasPermission("DOCTOR_ADD") && (
              <Button
                size={"xs"}
                colorScheme={"blue"}
                bg={"blue.700"}
                _hover={{
                  bg: "blue.700",
                }}
                color={"#fff"}
                leftIcon={<MdAddCircleOutline fontSize={18} />}
                onClick={() => {
                  navigate("/doctors/add");
                }}
                borderRadius={0}
              >
                Add Doctor
              </Button>
            )}
            {hasPermission("PATIENT_ADD") && (
              <Button
                size={"xs"}
                colorScheme={"blue"}
                bg={"blue.700"}
                _hover={{
                  bg: "blue.700",
                }}
                color={"#fff"}
                leftIcon={<MdAddCircleOutline fontSize={18} />}
                onClick={() => {
                  patientonOpen();
                }}
                borderRadius={0}
              >
                Add Patient
              </Button>
            )}
            {hasPermission("MEDICINE_ADD") && (
              <Button
                size={"xs"}
                colorScheme={"blue"}
                bg={"blue.700"}
                _hover={{
                  bg: "blue.700",
                }}
                color={"#fff"}
                leftIcon={<MdAddCircleOutline fontSize={18} />}
                onClick={() => {
                  onOpen();
                }}
                borderRadius={0}
              >
                Add Medicine
              </Button>
            )}
            {hasPermission("CHECKIN_ADD") && (
              <Button
                size={"xs"}
                colorScheme={"blue"}
                bg={"blue.700"}
                _hover={{
                  bg: "blue.700",
                }}
                color={"#fff"}
                leftIcon={<BiCheckShield fontSize={18} />}
                onClick={() => {
                  onOpen();
                }}
                borderRadius={0}
              >
                Add Medicine
              </Button>
            )}
          </Flex>
          <ClockWithCountdown />
        </Flex>
      )}{" "}
      <AddMedicine isOpen={isOpen} onClose={onClose} />
      <AddNewAppointment
        isOpen={appointmentisOpen}
        onClose={appointmentonClose}
      />
      <AddPatients
        nextFn={() => {}}
        onClose={patientonClose}
        isOpen={patientisOpen}
      />
      <AddCheckin isOpen={checkinisOpen} onClose={checkinonClose} />
    </>
  );
};
