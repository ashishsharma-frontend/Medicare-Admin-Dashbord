/* eslint-disable react/prop-types */
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
  useColorModeValue,
  Heading,
  FormControl,
  FormLabel,
  Input,
  CardBody,
  Card,
  Divider,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Badge,
  Select,
  useDisclosure,
  useToast,
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

const getTypeBadge = (type) => {
  return (
    <Badge colorScheme={ColorMapArray[type] || "blue"} p={"5px"} px={10}>
      {type}
    </Badge>
  );
};
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
  {
    id: 1,
    name: "Cash",
  },
  {
    id: 2,
    name: "Online",
  },
  {
    id: 3,
    name: "Other",
  },
  {
    id: 4,
    name: "Wallet",
  },
  {
    id: 5,
    name: "UPI",
  },
];

// add appointemmnt
const addAppointment = async (data) => {
  const res = await ADD(admin.token, "add_appointment", data);
  if (res.response !== 200) {
    throw new Error(res.message);
  }
  return res;
};
const addAppointmentCheckin = async (data) => {
  const res = await ADD(admin.token, "add_appointment_checkin", data);
  if (res.response !== 200) {
    throw new Error(res.message);
  }
  return res;
};

function AddNewAppointment({ isOpen, onClose, PatientID }) {
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

  //   doctorDetails
  const { data: doctorDetails, isLoading: isDoctLoading } = useQuery({
    queryKey: ["doctor", doct?.user_id],
    queryFn: async () => {
      const res = await GET(admin.token, `get_doctor/${doct?.user_id}`);
      return res.data;
    },
    enabled: !!doct,
  });

  //
  const checkMissingValues = () => {
    if (!patient) return "patient";
    if (!doct) return "doctor";
    if (!type) return "Appointment Type";
    if (!selectedDate) return "Date";
    if (!selectedSlot) return "Time Slot";
    if (!status) return "Appointment status";
    if (!paymentStatus) return "Payment Status";
    if (paymentStatus === "Paid" && !paymentMathod) return "Payment Method";
    return null; // All values are present
  };
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
        const res = await addAppointment(formData);

        if (type === "EMERGENCY"
          || type === "OPD-WALK-IN"
          || type === "TELEPHONE-APPOINTMENTS"
          || type === "FAST-CONSULTATION"
          || type === "FOLLOW-UP"
          || type === "MEDICAL-REPRESENTATIVE") {
          let formDataCheckin = {
            appointment_id: res.id,
            date: selectedDate,
            time: `${selectedSlot.time_start}:00`,
          };
          await addAppointmentCheckin(formDataCheckin);
        };
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

  // get time slotes
  const getDayName = (dateString) => {
    const date = moment(dateString, "YYYYMMDD");
    return date.format("dddd");
  };
  //const [count, setCount] = useState(0)
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
        /*
        for (var bs = 0; bs < resBooked.data.length; bs++) {
          if (
            res?.data[ts]?.time_start === resBooked?.data[bs]?.time_slots &&
            resBooked?.data[bs]?.date === selectedDate
          ) {
            slotAvailable = false;
          }
        }
        */
        if( res?.data[ts]?.time_end < moment().format("HH:mm") && selectedDate==moment().format("YYYY-MM-DD")){
          slotAvailable = false;
        }else{        
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
    }
    drData(selectedDate); 
  }, [selectedDate, doct, type]);
  return (
    <Box>
      {" "}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size={"2xl"}
        onOverlayClick={false}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add New Appointment</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex gap={10}>
              {" "}
              <Flex flex={3} gap={4} align={"center"}>
                <UsersCombobox
                  data={patientsData}
                  name={"Patient"}
                  setState={setpatient}
                  defaultData={defalutDataForPationt}
                  addNew={true}
                  addOpen={AddPatientonOpen}
                />
                Or
                <Button
                  size={"xs"}
                  w={120}
                  colorScheme={"blue"}
                  onClick={() => {
                    AddPatientonOpen();
                  }}
                >
                  Add patient
                </Button>
              </Flex>
              <Flex flex={2}>
                <UsersCombobox
                  data={doctorsData}
                  defaultData={'1'}
                  name={"Doctor"}
                  setState={setdoct}
                />
              </Flex>
            </Flex>
            <Card mt={5} bg={useColorModeValue("white", "gray.700")}>
              <CardBody p={3} as={"form"}>
                {" "}
                <Heading as={"h3"} size={"sm"}>
                  Appointment Details -{" "}
                </Heading>{" "}
                <Divider mt={2} mb={5} />
                <Flex gap={5}>
                  <FormControl id="doct_specialization" size={"sm"}>
                    <FormLabel
                      fontSize={"sm"}
                      mb={0}
                      color={useColorModeValue("gray.600", "gray.300")}
                    >
                      Appointment Type
                    </FormLabel>
                    <Menu>
                      <MenuButton
                        as={Button}
                        rightIcon={<ChevronDownIcon />}
                        bg={"transparent"}
                        w={"100%"}
                        textAlign={"left"}
                        pl={0}
                        pt={0}
                        h={8}
                        _hover={{
                          bg: "transparent",
                        }}
                        _focus={{
                          bg: "transparent",
                        }}
                        borderBottom={"1px solid"}
                        borderBottomRadius={0}
                        borderColor={useColorModeValue("gray.200", "gray.600")}
                      >
                        {type ? getTypeBadge(type) : "Select Appointment Type"}
                      </MenuButton>
                      <MenuList>
                        {AppointmentTypes?.map(
                          (option) => {
                            if (option === "MEDICAL-REPRESENTATIVE" && patient?.is_mr !== 1) {
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
                                    setselectedDate(
                                      moment().format("YYYY-MM-DD")
                                    );
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
                    <FormLabel
                      fontSize={"sm"}
                      mb={0}
                      color={useColorModeValue("gray.600", "gray.300")}
                    >
                      Appointment Date
                    </FormLabel>
                    <Input
                      size={"sm"}
                      fontWeight={600}
                      variant="flushed"
                      value={moment(selectedDate).format("DD-MM-YYYY")}
                      onClick={() => {
                        if (!doct) {
                          return ShowToast(
                            toast,
                            "error",
                            "Please Select Doctor"
                          );
                        }
                        if (!type) {
                          return ShowToast(
                            toast,
                            "error",
                            "Please Select Appointment Type"
                          );
                        }
                        timeSlotonOpen();
                      }}
                      cursor={"pointer"}
                    />
                  </FormControl>
                </Flex>
                <Flex gap={5} mt={2}>
                  <FormControl>
                    <FormLabel
                      fontSize={"sm"}
                      mb={0}
                      color={useColorModeValue("gray.600", "gray.300")}
                    >
                      Appointment Time Slot
                    </FormLabel>
                    <Input
                      size={"sm"}
                      fontWeight={600}
                      variant="flushed"
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
                      cursor={"pointer"}
                      isReadOnly
                    />
                  </FormControl>
                  <FormControl id="status" size={"sm"}>
                    <FormLabel
                      fontSize={"sm"}
                      mb={0}
                      color={useColorModeValue("gray.600", "gray.300")}
                    >
                      Status
                    </FormLabel>
                    <Menu>
                      <MenuButton
                        as={Button}
                        rightIcon={<ChevronDownIcon />}
                        bg={"transparent"}
                        w={"100%"}
                        textAlign={"left"}
                        pl={0}
                        pt={0}
                        h={8}
                        _hover={{
                          bg: "transparent",
                        }}
                        _focus={{
                          bg: "transparent",
                        }}
                        borderBottom={"1px solid"}
                        borderBottomRadius={0}
                        borderColor={useColorModeValue("gray.200", "gray.600")}
                      >
                        {status ? getStatusBadge(status) : "Select Status"}
                      </MenuButton>
                      <MenuList>
                        {defStatus.map((option) => (
                          <MenuItem
                            key={option}
                            onClick={() => {
                              setstatus(option);
                            }}
                          >
                            <Box display="flex" alignItems="center">
                              {getStatusBadge(option)}
                            </Box>
                          </MenuItem>
                        ))}
                      </MenuList>
                    </Menu>
                  </FormControl>
                </Flex>
              </CardBody>
            </Card>
            <Card mt={5} bg={useColorModeValue("white", "gray.700")}>
              <CardBody p={3} as={"form"}>
                {" "}
                <Heading as={"h3"} size={"sm"}>
                  Payment Details -{" "}
                </Heading>{" "}
                <Divider mt={2} mb={5} />
                <Flex gap={5}>
                  <FormControl>
                    <FormLabel
                      fontSize={"sm"}
                      mb={0}
                      color={useColorModeValue("gray.600", "gray.300")}
                    >
                      Payment Status
                    </FormLabel>
                    <Select
                      placeholder="Select paymemnt status"
                      variant="flushed"
                      onChange={(e) => {
                        setpaymentStatus(e.target.value);
                      }}
                      value={paymentStatus}
                    >
                      <option value="Paid">Paid</option>
                      {type === "OPD" && (
                        <option value="Unpaid">Not Paid</option>
                      )}
                    </Select>
                  </FormControl>
                  <FormControl>
                    <FormLabel
                      fontSize={"sm"}
                      mb={0}
                      color={useColorModeValue("gray.600", "gray.300")}
                    >
                      Payment Method
                    </FormLabel>
                    <Select
                      placeholder="Select paymemnt Method"
                      variant="flushed"
                      onChange={(e) => {
                        setpaymentMathod(e.target.value);
                      }}
                      value={paymentMathod}
                    >
                      {paymentModes.map((item) => (
                        <option value={item.name} key={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                </Flex>
                <Flex gap={5} mt={4}>
                  <FormControl w={"50%"}>
                    <FormLabel
                      fontSize={"sm"}
                      mb={0}
                      color={useColorModeValue("gray.600", "gray.300")}
                    >
                      Fee
                    </FormLabel>
                    <Input
                      fontWeight={600}
                      variant="flushed"
                      size={"sm"}
                      isReadOnly
                      value={doct && type ? getFee(type, doct) : 0}
                    />
                  </FormControl>
                  <FormControl w={"50%"}>
                    <FormLabel
                      fontSize={"sm"}
                      mb={0}
                      color={useColorModeValue("gray.600", "gray.300")}
                    >
                      Total Amount
                    </FormLabel>
                    <Input
                      fontWeight={600}
                      variant="flushed"
                      size={"sm"}
                      isReadOnly
                      value={doct && type ? getFee(type, doct) : 0}
                    />
                  </FormControl>
                </Flex>
              </CardBody>
            </Card>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="gray" mr={3} onClick={onClose} size={"sm"}>
              Close
            </Button>
            <Button
              colorScheme={"blue"}
              size={"sm"}
              onClick={() => {
                mutation.mutate();
              }}
              isLoading={mutation.isPending}
            >
              Add Appointment
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      {timeSlotisOpen ? (
        <AvailableTimeSlotes
          isOpen={timeSlotisOpen}
          onClose={timeSlotonClose}
          doctID={doct.user_id}
          selectedDate={selectedDate}
          setselectedDate={setselectedDate}
          selectedSlot={selectedSlot}
          setselectedSlot={setselectedSlot}
          type={type}
        />
      ) : null}
      {AddPatientisOpen ? (
        <AddPatients
          nextFn={(data) => {
            setdefalutDataForPationt(data);
          }}
          isOpen={AddPatientisOpen}
          onClose={AddPatientonClose}
        />
      ) : null}
    </Box>
  );
}

export default AddNewAppointment;
