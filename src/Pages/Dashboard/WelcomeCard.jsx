/* eslint-disable react/prop-types */
import admin from "../../Controllers/admin";
import {
  Box, Flex,
  Heading,
  Image,
  Text,
  useColorModeValue
} from "@chakra-ui/react";

export default function WelcomeCard({ data }) {
  return (
    <Box
      w={"100%"}
      borderRadius={8}
      overflow={"hidden"}
      boxShadow={"lg"}
      minH={"100%"}
      bg={useColorModeValue("#fff", "gray.900")}
    >
      <Box padding={3} bg={"main.900"} pb={10} color={"#fff"}>
        <Heading fontSize={"md"}>Welcome Back!</Heading>
        <Text fontSize={"sm"}>
          {admin.role.name} - {admin.f_name} {admin.l_name}
        </Text>
      </Box>
      <Box p={3} pos={"relative"} bg={useColorModeValue("#fff", "gray.900")}>
        <Image src="/admin/profile.png" w={16} top={"-8"} pos={"absolute"} />
        <Heading fontSize={"sm"} mt={6} ml={1}>
          {admin.role.name}
        </Heading>
        <Text fontSize={"sm"} ml={1}>
          {admin.email}
        </Text>
        <Box mt={2} ml={1}>
          <Flex justify={"space-between"} gap={6}>
            <Box flex={1}>
              <Text fontSize={"sm"} fontWeight={500}>
                Total Active Doctors
              </Text>
              <Text fontSize={"xl"} color={"blue.600"} fontWeight={700}>
                {data?.total_active_doctors}
              </Text>
            </Box>
            <Box flex={1}>
              <Text fontSize={"sm"} fontWeight={500}>
                Total Appointments
              </Text>
              <Text fontSize={"xl"} color={"blue.600"} fontWeight={700}>
                {data?.total_appointments}
              </Text>
            </Box>
          </Flex>
          <Flex justify={"space-between"} gap={6} mt={2}>
            <Box flex={1}>
              <Text fontSize={"sm"} fontWeight={500}>
                Total Patients
              </Text>
              <Text fontSize={"xl"} color={"blue.600"} fontWeight={700}>
                {data?.total_patients}
              </Text>
            </Box>
            <Box flex={1}>
              <Text fontSize={"sm"} fontWeight={500}>
                Total Users
              </Text>
              <Text fontSize={"xl"} color={"blue.600"} fontWeight={700}>
                {data?.total_users}
              </Text>
            </Box>
          </Flex>
          {/* <Divider my={2} />
          <Flex justify={"space-between"} gap={6}>
            <Box flex={1}>
              <Text fontSize={"sm"} fontWeight={500}>
                Total Departments
              </Text>
              <Text fontSize={"xl"} color={"blue.600"} fontWeight={700}>
                {data?.total_departments}
              </Text>
            </Box>
            <Box flex={1}>
              <Text fontSize={"sm"} fontWeight={500}>
                Total Prescriptions
              </Text>
              <Text fontSize={"xl"} color={"blue.600"} fontWeight={700}>
                {data?.total_prescriptions}
              </Text>
            </Box>
          </Flex>
          <Flex justify={"space-between"} gap={6} mt={2}>
            <Box flex={1}>
              <Text fontSize={"sm"} fontWeight={500}>
                Total Medicine
              </Text>
              <Text fontSize={"xl"} color={"blue.600"} fontWeight={700}>
                {data?.total_medicine}
              </Text>
            </Box>
            <Box flex={1}>
              <Text fontSize={"sm"} fontWeight={500}>
                Doctor Reviews
              </Text>
              <Text fontSize={"xl"} color={"blue.600"} fontWeight={700}>
                {data?.total_doctors_review}
              </Text>
            </Box>
          </Flex> */}
        </Box>
      </Box>
    </Box>
  );
}
