import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Box,
  Flex,
  Stack,
  useColorModeValue,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Select,
  Divider,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Badge,
  useDisclosure,
  useToast,
  Text,
} from "@chakra-ui/react";
import useDoctorData from "../../Hooks/UseDoctorData";
import usePatientData from "../../Hooks/UsePatientsData";
import { useEffect, useState } from "react";
import UsersCombobox from "../../Components/UsersComboBox";
import { AppointmentTypes, ColorMapArray } from "../../Components/AppointmentContant";
import moment from "moment";
import { ChevronDownIcon } from "lucide-react";
import getStatusBadge from "../../Hooks/StatusBadge";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ADD, GET } from "../../Controllers/ApiControllers";
import admin from "../../Controllers/admin";
import ShowToast from "../../Controllers/ShowToast";
import AvailableTimeSlotes from "./AvailableTimeSlotes";
import AddPatients from "../Patients/AddPatients";

let defStatus = ["Pending", "Confirmed"];

const getTypeBadge = (type) => (
  <Badge colorScheme={ColorMapArray[type] || "blue"} p={"5px"} px={10}>
    {type}
  </Badge>
);

const getFee = (type, doct) => {
  switch (type) {
    case "OPD-WALK-IN":
      return doct?.opd_fee;
    case "TELEPHONE-APPOINTMENTS":
      return doct?.opd_fee;
    case "EMERGENCY":
      return doct?.emg_fee;
    case "FAST-CONSULTATION":
      return doct?.emg_fee;
    case "FOLLOW-UP":
      return 0;
    case "MEDICAL-REPRESENTATIVE":
      return 0;
    case "VIDEO-CONSULTATION":
      return doct?.video_fee;
    default:
      return 0;
  }
};

const paymentModes = [
  { id: 1, name: "Cash" },
  { id: 2, name: "Online" },
  { id: 3, name: "Other" },
  { id: 4, name: "Wallet" },
  { id: 5, name: "UPI" },
];

const AddNewAppointment = ({ isOpen, onClose, PatientID }) => {
  const toast = useToast();
  const {
    isOpen: timeSlotisOpen,
    onOpen: timeSlotonOpen,
    onClose: timeSlotonClose,
  } = useDisclosure();
  const {
    isOpen: AddPatientisOpen,
    onOpen: AddPatientonOpen,
    onClose: AddPatientonClose,
  } = useDisclosure();
  const { doctorsData } = useDoctorData();
  const { patientsData } = usePatientData();
  const [patient, setpatient] = useState();
  const [doct, setdoct] = useState(doctorsData?.[0] || null);
  const [selectedDate, setselectedDate] = useState(moment().format("YYYY-MM-DD"));
  const [selectedSlot, setselectedSlot] = useState();
  const [status, setstatus] = useState("Confirmed");
  const [type, settype] = useState("OPD-WALK-IN");
  const [paymentStatus, setpaymentStatus] = useState("Paid");
  const [paymentMathod, setpaymentMathod] = useState("Cash");
  const queryClient = useQueryClient();
  const [defalutDataForPationt, setdefalutDataForPationt] = useState(PatientID);

  // doctorDetails
  const { data: doctorDetails, isLoading: isDoctLoading } = useQuery({
    queryKey: ["doctor", doct?.user_id],
    queryFn: async () => {
      const res = await GET(admin.token, `get_doctor/${doct?.user_id}`);
      return res.data;
    },
    enabled: !!doct,
  });

  // Validation
  const checkMissingValues = () => {
    if (!patient) return "patient";
    if (!doct) return "doctor";
    if (!type) return "Appointment Type";
    if (!selectedDate) return "Date";
    if (!selectedSlot) return "Time Slot";
    if (!status) return "Appointment status";
    if (!paymentStatus) return "Payment Status";
    if (paymentStatus === "Paid" && !paymentMathod) return "Payment Method";
    return null;
  };

  // Add appointment mutation
  const mutation = useMutation({
    mutationFn: async () => {
      const missingField = checkMissingValues();
      if (missingField) {
        throw new Error(`Please select ${missingField}`);
      } else if (isDoctLoading || !doctorDetails) {
        throw new Error(`Unable to fetch doctor details`);
      }
      if (!missingField) {
        let formData = {
          patient_id: patient.id,
          status: status,
          date: selectedDate,
          time_slots: selectedSlot.time_start,
          doct_id: doct.user_id,
          dept_id: doctorDetails.department,
          type: type,
          fee: getFee(type, doct),
          total_amount: getFee(type, doct),
          unit_total_amount: getFee(type, doct),
          invoice_description: type,
          payment_method: paymentMathod || null,
          service_charge: 0,
          payment_transaction_id:
            paymentStatus === "Paid" ? "Pay at Hospital" : null,
          is_wallet_txn: 0,
          payment_status: paymentStatus,
          source: "Admin",
        };
        const res = await ADD(admin.token, "add_appointment", formData);

        if (
          type === "EMERGENCY" ||
          type === "OPD-WALK-IN" ||
          type === "TELEPHONE-APPOINTMENTS" ||
          type === "FAST-CONSULTATION" ||
          type === "FOLLOW-UP" ||
          type === "MEDICAL-REPRESENTATIVE"
        ) {
          let formDataCheckin = {
            appointment_id: res.id,
            date: selectedDate,
            time: `${selectedSlot.time_start}:00`,
          };
          await ADD(admin.token, "add_appointment_checkin", formDataCheckin);
        }
      }
    },
    onError: (error) => {
      ShowToast(toast, "error", error.message);
    },
    onSuccess: () => {
      ShowToast(toast, "success", "Success");
      queryClient.invalidateQueries("appointments");
      queryClient.invalidateQueries("main-appointments");
      queryClient.invalidateQueries("checkins");
      onClose();
    },
  });

  // get time slots
  const getDayName = (dateString) => {
    const date = moment(dateString, "YYYYMMDD");
    return date.format("dddd");
  };

  useEffect(() => {
    const drData = async (date) => {
      const url =
        type === "OPD-WALK-IN"
          ? `get_doctor_time_interval/${doct?.user_id}/${getDayName(date)}`
          : type === "VIDEO-CONSULTATION"
          ? `get_doctor_video_time_interval/${doct?.user_id}/${getDayName(date)}`
          : `get_doctor_time_interval/${doct?.user_id}/${getDayName(date)}`;
      const res = await GET(admin.token, url);
      const resBooked = await GET(
        admin.token,
        `get_booked_time_slots?doct_id=${doct?.user_id}&date=${date}&type=${type}`
      );
      for (var ts = 0; ts < res?.data?.length; ts++) {
        var slotAvailable = true;
        if (
          res?.data[ts]?.time_end < moment().format("HH:mm") &&
          date === moment().format("YYYY-MM-DD")
        ) {
          slotAvailable = false;
        } else {
          for (var bs = 0; bs < resBooked.data.length; bs++) {
            if (
              res?.data[ts]?.time_start === resBooked?.data[bs]?.time_slots &&
              resBooked?.data[bs]?.date === selectedDate
            ) {
              slotAvailable = false;
            }
          }
        }
        if (slotAvailable) {
          slotAvailable = true;
          setselectedSlot(res?.data[ts]);
          break;
        }
      }
    };
    drData(selectedDate);
    // eslint-disable-next-line
  }, [selectedDate, doct, type]);

  // Responsive design starts here
  return (
    <Box>
      <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
        <ModalOverlay />
        <ModalContent borderRadius="2xl" p={{ base: 2, md: 4 }}>
          <ModalHeader fontWeight="bold" fontSize={{ base: "lg", md: "2xl" }}>
            Add New Appointment
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={4}>
              {/* Patient & Doctor Selection */}
              <Stack
                direction={{ base: "column", md: "row" }}
                spacing={4}
                align={{ base: "stretch", md: "center" }}
              >
                <Flex flex={2} gap={2} align="center">
                  <UsersCombobox
                    data={patientsData}
                    name="Patient"
                    setState={setpatient}
                    defaultData={defalutDataForPationt}
                    addNew={true}
                    addOpen={AddPatientonOpen}
                  />
                  <Text color="gray.500" fontWeight="semibold" fontSize="sm">
                    Or
                  </Text>
                  <Button
                    size="sm"
                    colorScheme="blue"
                    px={4}
                    onClick={AddPatientonOpen}
                    fontWeight="semibold"
                  >
                    Add Patient
                  </Button>
                </Flex>
                <Flex flex={1}>
                  <UsersCombobox
                    data={doctorsData}
                    defaultData={"1"}
                    name="Doctor"
                    setState={setdoct}
                  />
                </Flex>
              </Stack>

              {/* Appointment Details */}
              <Box>
                <Heading size="sm" mt={4} mb={2}>
                  Appointment Details
                </Heading>
                <Divider mb={4} />
                <Stack
                  direction={{ base: "column", md: "row" }}
                  spacing={4}
                  mb={2}
                >
                  <FormControl>
                    <FormLabel fontSize="sm">Appointment Type</FormLabel>
                    <Menu>
                      <MenuButton
                        as={Button}
                        rightIcon={<ChevronDownIcon />}
                        bg="gray.50"
                        w="100%"
                        textAlign="left"
                        fontWeight="semibold"
                        borderRadius="md"
                        borderWidth="1px"
                        borderColor="gray.200"
                        _hover={{ bg: "gray.100" }}
                        _focus={{ bg: "gray.100" }}
                        py={2}
                      >
                        {type ? getTypeBadge(type) : "Select Appointment Type"}
                      </MenuButton>
                      <MenuList>
                        {AppointmentTypes?.map((option) => {
                          if (
                            option === "MEDICAL-REPRESENTATIVE" &&
                            patient?.is_mr !== 1
                          ) {
                            return null;
                          }
                          return (
                            <MenuItem
                              key={option}
                              onClick={() => {
                                if (option !== "OPD-WALK-IN") {
                                  setpaymentStatus("Paid");
                                }
                                if (option === "EMERGENCY") {
                                  settype(option);
                                  setselectedDate(moment().format("YYYY-MM-DD"));
                                  setselectedSlot({
                                    time_start: moment().format("HH:mm"),
                                  });
                                } else {
                                  setselectedDate();
                                  setselectedSlot();
                                  settype(option);
                                }
                              }}
                            >
                              <Box display="flex" alignItems="center">
                                {getTypeBadge(option)}
                              </Box>
                            </MenuItem>
                          );
                        })}
                      </MenuList>
                    </Menu>
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize="sm">Appointment Date</FormLabel>
                    <Input
                      type="date"
                      size="sm"
                      fontWeight="semibold"
                      value={selectedDate}
                      onChange={(e) => setselectedDate(e.target.value)}
                      bg="gray.50"
                    />
                  </FormControl>
                </Stack>
                <Stack
                  direction={{ base: "column", md: "row" }}
                  spacing={4}
                  mb={2}
                >
                  <FormControl>
                    <FormLabel fontSize="sm">Time Slot</FormLabel>
                    <Input
                      size="sm"
                      fontWeight="semibold"
                      value={
                        selectedSlot
                          ? moment(selectedSlot.time_start, "hh:mm").format(
                              "hh:mm A"
                            )
                          : "Select Time Slot"
                      }
                      onClick={() => {
                        if (!doct) {
                          return ShowToast(
                            toast,
                            "error",
                            "Please Select Doctor"
                          );
                        }
                        timeSlotonOpen();
                      }}
                      cursor="pointer"
                      isReadOnly
                      bg="gray.50"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize="sm">Status</FormLabel>
                    <Menu>
                      <MenuButton
                        as={Button}
                        rightIcon={<ChevronDownIcon />}
                        bg="gray.50"
                        w="100%"
                        textAlign="left"
                        fontWeight="semibold"
                        borderRadius="md"
                        borderWidth="1px"
                        borderColor="gray.200"
                        _hover={{ bg: "gray.100" }}
                        _focus={{ bg: "gray.100" }}
                        py={2}
                      >
                        {status ? getStatusBadge(status) : "Select Status"}
                      </MenuButton>
                      <MenuList>
                        {defStatus.map((option) => (
                          <MenuItem
                            key={option}
                            onClick={() => setstatus(option)}
                          >
                            <Box display="flex" alignItems="center">
                              {getStatusBadge(option)}
                            </Box>
                          </MenuItem>
                        ))}
                      </MenuList>
                    </Menu>
                  </FormControl>
                </Stack>
              </Box>

              {/* Payment Details */}
              <Box>
                <Heading size="sm" mt={4} mb={2}>
                  Payment Details
                </Heading>
                <Divider mb={4} />
                <Stack
                  direction={{ base: "column", md: "row" }}
                  spacing={4}
                  mb={2}
                >
                  <FormControl>
                    <FormLabel fontSize="sm">Payment Status</FormLabel>
                    <Select
                      value={paymentStatus}
                      onChange={(e) => setpaymentStatus(e.target.value)}
                      fontWeight="semibold"
                      bg="gray.50"
                    >
                      <option value="Paid">Paid</option>
                      <option value="Unpaid">Unpaid</option>
                    </Select>
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize="sm">Payment Method</FormLabel>
                    <Select
                      value={paymentMathod}
                      onChange={(e) => setpaymentMathod(e.target.value)}
                      fontWeight="semibold"
                      bg="gray.50"
                    >
                      {paymentModes.map((item) => (
                        <option value={item.name} key={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>
                <Stack
                  direction={{ base: "column", md: "row" }}
                  spacing={4}
                  mb={2}
                >
                  <FormControl>
                    <FormLabel fontSize="sm">Fee</FormLabel>
                    <Input
                      fontWeight="semibold"
                      size="sm"
                      isReadOnly
                      value={doct && type ? getFee(type, doct) : 0}
                      bg="gray.50"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize="sm">Total Amount</FormLabel>
                    <Input
                      fontWeight="semibold"
                      size="sm"
                      isReadOnly
                      value={doct && type ? getFee(type, doct) : 0}
                      bg="gray.50"
                    />
                  </FormControl>
                </Stack>
              </Box>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Flex w="100%" gap={2} flexWrap="wrap">
              <Button
                colorScheme="blue"
                flex={2}
                fontWeight="semibold"
                onClick={() => {
                  // Add with checkin logic here if needed
                  mutation.mutate();
                }}
                isLoading={mutation.isPending}
              >
                Add Appointment
              </Button>
              <Button
                colorScheme="gray"
                flex={1}
                onClick={onClose}
                fontWeight="semibold"
              >
                Close
              </Button>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Modal>
      {/* Time Slot Modal */}
      {timeSlotisOpen && (
        <AvailableTimeSlotes
          isOpen={timeSlotisOpen}
          onClose={timeSlotonClose}
          doctID={doct?.user_id}
          selectedDate={selectedDate}
          setselectedDate={setselectedDate}
          selectedSlot={selectedSlot}
          setselectedSlot={setselectedSlot}
          type={type}
        />
      )}
      {/* Add Patient Modal */}
      {AddPatientisOpen && (
        <AddPatients
          nextFn={(data) => setdefalutDataForPationt(data)}
          isOpen={AddPatientisOpen}
          onClose={AddPatientonClose}
        />
      )}
    </Box>
  );
};

export default AddNewAppointment;