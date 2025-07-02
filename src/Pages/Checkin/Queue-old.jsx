import {
  Box,
  Grid,
  Text,
  List,
  Image,
  Flex,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Input,
} from "@chakra-ui/react";
import { GET } from "../../Controllers/ApiControllers";
import admin from "../../Controllers/admin";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import moment from "moment";
import useSettingsData from "../../Hooks/SettingData";
import imageBaseURL from "../../Controllers/image";
import Loading from "../../Components/Loading";
import { useSearchParams } from "react-router-dom";
import todayDate from "../../Controllers/today";

// Fetch Appointments Function

// get doctors
const getData = async () => {
  const res = await GET(admin.token, "get_doctor");
  return res.data;
};

const QueueList = () => {
  const { settingsData } = useSettingsData();
  const logo = settingsData?.find((value) => value.id_name === "logo");
  const [time, setTime] = useState(moment().format("MMMM D YYYY, h:mm:ss a"));
  const [selectDoc, setselectDoc] = useState(false);
  const [selectedDate, setselectedDate] = useState(
    moment().format("YYYY-MM-DD")
  );
  const [isLOad, setisLOad] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const doctID = searchParams.get("doct");
  const doctname = searchParams.get("name");

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(moment().format("MMMM D YYYY, h:mm:ss a"));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // doctors
  const { isLoading: doctorsLoading, data: doctors } = useQuery({
    queryKey: ["doctors"],
    queryFn: getData,
  });

  useEffect(() => {
    if (doctors) {
      const firstDoct = doctors[0];
      if (!doctID || !doctname) {
        setSearchParams({
          doct: firstDoct.user_id,
          name: `${firstDoct.f_name} ${firstDoct.l_name}`,
        });
      }
    }
  }, [doctID, doctname, doctors, setSearchParams]);

  const fetchAppointments = async () => {
    setisLOad(true);
    const res = await GET(
      admin?.token,
      `get_appointment_check_in_doct_date/${doctID}/${selectedDate}`
    );
    setisLOad(false);
    return res.data;
  };
  // Query to fetch appointments
  const { data, error, isLoading } = useQuery({
    queryKey: ["appointments-queue", doctID, selectedDate],
    queryFn: fetchAppointments,
    refetchInterval: 30000, // Refetch every 30 seconds
    enabled: !!doctID,
  });

  if (isLoading || doctorsLoading || isLOad) return <Loading />;
  if (error) return <Text color="red.500">Failed to load appointments</Text>;

  const appointments = data || [];

  // Separate current and next appointments
  const currentAppointment = appointments[0] || null;
  const nextAppointments = appointments.slice(1); // All but the first one

  return (
    <Box p={4} bg="blackAlpha.800" minH="100vh" color="white">
      <Grid
        templateColumns="1fr 3fr 1fr"
        gap={6}
        bg={"#fff"}
        p={3}
        borderRadius={5}
        alignContent={"center"}
        alignItems={"center"}
      >
        {/* Left side - Logo */}
        <Box>
          <Image
            w={20}
            src={`${imageBaseURL}/${logo?.value}`}
            fallbackSrc={"/vite.svg"}
          />
        </Box>

        {/* Middle - Doctor label */}
        <Flex
          textAlign="center"
          w={"100%"}
          justifyContent={"center"}
          gap={4}
          alignItems={"center"}
        >
          <Text
            fontSize="2xl"
            fontWeight="bold"
            color="blue.600"
            cursor={"pointer"}
            onClick={() => {
              setselectDoc(!selectDoc);
            }}
          >
            Doctor {doctname}
          </Text>
          {selectDoc && (
            <>
              {" "}
              <Select
                placeholder={doctname ? doctname : "Select option"}
                w={60}
                color={"#000"}
                value={selectDoc}
                onChange={(e) => {
                  const doct = JSON.parse(e.target.value);
                  setSearchParams({
                    doct: doct.user_id,
                    name: `${doct.f_name} ${doct.l_name}`,
                  });
                  setselectDoc(false);
                }}
              >
                {doctors.map((doct) => (
                  <option
                    color={"#000"}
                    key={doct.id}
                    value={JSON.stringify(doct)}
                  >
                    Dr. {doct.f_name} {doct.l_name}
                  </option>
                ))}
              </Select>
              <Input
                placeholder={"Select Date"}
                w={60}
                color={"#000"}
                value={selectedDate}
                type="date"
                max={todayDate()}
                onChange={(e) => {
                  const date = moment(e.target.value).format("YYYY-MM-DD");
                  setselectedDate(date);
                  setselectDoc(false);
                }}
              />
            </>
          )}
        </Flex>

        {/* Right side - Date and Time */}
      </Grid>

      {/* Main Content */}
      <Grid templateColumns="1fr 2fr" gap={6} mt={6} minH={"87vh"}>
        {/* Left - Next Appointments */}
        <Box
          bg="blackAlpha.900"
          p={4}
          borderRadius="md"
          minH={"70vh"}
          px={2}
          pt={2}
          borderRight={"sm"}
          color={"#000"}
        >
          <Text
            fontSize="2xl"
            fontWeight="bold"
            mb={4}
            textAlign={"center"}
            bg={"#fff"}
          >
            Next Patients
          </Text>
          <List spacing={3}>
            {nextAppointments.length > 0 ? (
              <Table variant="simple">
                <Thead>
                  <Tr>
                    {" "}
                    <Th color="#fff">S No.</Th>
                    <Th color="#fff">ID</Th>
                    <Th color="#fff">Patient Name</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {nextAppointments.map((appointment, index) => (
                    <Tr key={appointment.id} color={"#fff"} fontWeight={600}>
                      {" "}
                      <Td>#{index + 2}</Td>
                      <Td>#{appointment.appointment_id}</Td>
                      <Td fontWeight="bold">
                        {" "}
                        {appointment.patient_f_name}{" "}
                        {appointment.patient_l_name}
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            ) : (
              <Text color={"#fff"}>No upcoming patients</Text>
            )}
          </List>
        </Box>

        <Box>
          {" "}
          <Box textAlign="center" bg="#fff" p={4} borderRadius="md" mb={5}>
            <Text fontSize="3xl" fontWeight={700} py={3} color={"blue.600"}>
              {time}
            </Text>
          </Box>
          <Box bg="blackAlpha.900" borderRadius="md" pb={4} p={2}>
            <Text
              fontSize="2xl"
              fontWeight="bold"
              mb={4}
              px={2}
              py={2}
              bg={"#fff"}
              borderRadius={"sm"}
              color={"#000"}
              textAlign={"center"}
            >
              Now
            </Text>
            {currentAppointment ? (
              <Box
                bg="gray.900"
                height="full"
                p={4}
                m={4}
                color="white"
                borderRadius={"sm"}
              >
                <Text fontSize={"3xl"} fontWeight={700} textAlign={"center"}>
                  Appointment ID: #{currentAppointment.appointment_id}
                </Text>
                <Text fontWeight="bold" fontSize="2xl" textAlign={"center"}>
                  Name - {currentAppointment.patient_f_name}{" "}
                  {currentAppointment.patient_l_name}
                </Text>

                <Text textAlign={"center"} fontSize={"xl"}>
                  Time:{" "}
                  {moment(currentAppointment.time, "hh:mm:ss").format(
                    "hh:mm A"
                  )}
                </Text>
                <Text textAlign={"center"} fontSize={"xl"}>
                  Date: {currentAppointment.date}
                </Text>
              </Box>
            ) : (
              <Text>No patient is currently being seen</Text>
            )}
          </Box>
        </Box>
        {/* Right - Current Appointment */}
      </Grid>
    </Box>
  );
};

export default QueueList;
