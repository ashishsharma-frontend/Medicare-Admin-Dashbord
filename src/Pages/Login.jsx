import { AiFillEyeInvisible, AiFillEye } from "react-icons/ai";
import {
  Badge,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Link,
  Stack,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Radio,
  RadioGroup,
  useDisclosure,
  IconButton,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  useColorModeValue,
  Text,
  Checkbox,
  Divider,
  Box,
  Image,
} from "@chakra-ui/react";
import { FaFingerprint, FaShieldAlt, FaUserShield, FaCog } from "react-icons/fa";
import { MdEmail, MdLock } from "react-icons/md";
import axios from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import api from "../Controllers/api";
import ForgetPassword from "../Components/ForgetPassword";
import moment from "moment";

function getExpTime() {
  const timestamp = moment().add(24, "hours").valueOf();
  return timestamp;
}

export default function Login() {
  const { register, handleSubmit } = useForm();
  const toast = useToast();
  const [isLoading, setisLoading] = useState(false);
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [loginData, setloginData] = useState();
  const [showPassword, setShowPassword] = useState(false);

  const {
    isOpen: isPsswordOpen,
    onOpen: onPasswordOpen,
    onClose: onPasswordClose,
  } = useDisclosure();

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const onSubmit = async (data) => {
    setisLoading(true);
    try {
      const response = await axios.post(`${api}/login`, data);
      const loginData = response.data;
      setisLoading(false);
      if (loginData.response === 200) {
        if (!loginData.data.role || loginData.data.role.length === 0) {
          toastError(
            "You do not have permission to access the admin panel. Please contact the administrator if you believe this is an error."
          );
        } else if (loginData.data.role.length > 1) {
          setRoles(loginData.data.role);
          setloginData({
            data: loginData.data,
            token: loginData.token,
          });
          onOpen();
        } else {
          loginUser(loginData.data, loginData.token, loginData.data.role[0]);
        }
      } else {
        toastError("Wrong Email Or Password.");
      }
    } catch (error) {
      setisLoading(false);
      toastError("An error occurred during login. Please try again.");
      console.error(error);
    }
  };

  const loginUser = (userData, token, selectedRole) => {
    const combinedObject = {
      ...userData,
      role: selectedRole,
      token: token,
      exp: getExpTime(),
    };
    localStorage.setItem("admin", JSON.stringify(combinedObject));
    toast({
      title: "Login Success.",
      status: "success",
      duration: 9000,
      isClosable: true,
      position: "top",
    });
    window.location.reload("/");
  };

  const toastError = (message) => {
    toast({
      title: message,
      status: "error",
      duration: 9000,
      isClosable: true,
      position: "top",
    });
  };

  const handleRoleSelection = () => {
    const selectedRoleObject = roles.find((role) => role.name === selectedRole);
    if (selectedRoleObject) {
      loginUser(loginData.data, loginData.token, selectedRoleObject);
      onClose();
    }
  };

  return (
    <Flex
      minH="100vh"
      direction={{ base: "column", md: "row" }}
      bg="gray.100"
    >
      {/* Left Side: Banner (Desktop) / Header+Banner (Mobile) */}
      <Flex
        flex={1}
        bg="#1A2250"
        direction="column"
        align="center"
        justify="center"
        py={{ base: 0, md: 12 }}
        px={{ base: 0, md: 8 }}
        display={{ base: "none", md: "flex" }}
      >
        {/* Desktop Header */}
        <Flex align="center" w="100%" maxW="400px" mb={8}>
          <Box fontSize="2xl" color="white" fontWeight="bold" mr={2}>
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
              <rect width="8" height="8" x="2" y="2" rx="2" fill="#fff"/>
              <rect width="8" height="8" x="14" y="2" rx="2" fill="#fff"/>
              <rect width="8" height="8" x="2" y="14" rx="2" fill="#fff"/>
              <rect width="8" height="8" x="14" y="14" rx="2" fill="#fff"/>
            </svg>
          </Box>
          <Text color="white" fontWeight="bold" fontSize="lg" letterSpacing="wide">
            MediDash
          </Text>
        </Flex>
        <Box
          w="100%"
          maxW="400px"
          bg="whiteAlpha.100"
          borderRadius="xl"
          overflow="hidden"
          mb={6}
        >
          <Image
            src="/admin/loginbg.png"
            alt="Healthcare"
            w="100%"
            h="180px"
            objectFit="cover"
          />
        </Box>
        <Heading
          color="white"
          fontSize="2xl"
          textAlign="center"
          fontWeight="extrabold"
          mb={6}
          letterSpacing="tight"
          lineHeight="short"
        >
          Healthcare Innovation<br />Starts Here
        </Heading>
        <Flex w="100%" maxW="400px" justify="space-between" mt={8}>
          <Stack align="center" spacing={1}>
            <Box as={FaShieldAlt} color="white" fontSize="2xl" mb={1} />
            <Text color="white" fontSize="xs">Secure Access</Text>
          </Stack>
          <Stack align="center" spacing={1}>
            <Box as={FaUserShield} color="white" fontSize="2xl" mb={1} />
            <Text color="white" fontSize="xs">Patient-Centered Care</Text>
          </Stack>
          <Stack align="center" spacing={1}>
            <Box as={FaCog} color="white" fontSize="2xl" mb={1} />
            <Text color="white" fontSize="xs">Seamless Integration</Text>
          </Stack>
        </Flex>
        <Text color="whiteAlpha.700" fontSize="xs" mt={12}>
          © 2023 MediDash Health Systems
        </Text>
      </Flex>

      {/* Mobile Header + Banner */}
      <Box
        w="100%"
        bg="#1A2250"
        py={3}
        px={4}
        display={{ base: "block", md: "none" }}
      >
        <Flex align="center" maxW="480px" mx="auto">
          <Box fontSize="2xl" color="white" fontWeight="bold" mr={2}>
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
              <rect width="8" height="8" x="2" y="2" rx="2" fill="#fff"/>
              <rect width="8" height="8" x="14" y="2" rx="2" fill="#fff"/>
              <rect width="8" height="8" x="2" y="14" rx="2" fill="#fff"/>
              <rect width="8" height="8" x="14" y="14" rx="2" fill="#fff"/>
            </svg>
          </Box>
          <Text color="white" fontWeight="bold" fontSize="lg" letterSpacing="wide">
            MediDash
          </Text>
        </Flex>
      </Box>
      <Box
        w="100%"
        maxW="480px"
        mx="auto"
        bg="#1A2250"
        pt={6}
        pb={8}
        px={4}
        borderBottomRadius="3xl"
        position="relative"
        zIndex={1}
        display={{ base: "block", md: "none" }}
      >
        <Image
          src="/admin/loginbg.png"
          alt="Healthcare"
          w="100%"
          h="120px"
          objectFit="cover"
          borderRadius="xl"
          mb={4}
        />
        <Heading
          color="white"
          fontSize="xl"
          textAlign="center"
          fontWeight="extrabold"
          mt={-12}
          mb={2}
          letterSpacing="tight"
          lineHeight="short"
        >
          Healthcare Innovation Starts Here
        </Heading>
      </Box>

      {/* Login Card */}
      <Flex
        flex={1}
        direction="column"
        align="center"
        justify="center"
        w="100%"
        maxW={{ base: "480px", md: "50%" }}
        mx="auto"
        px={{ base: 2, md: 8 }}
        py={{ base: 0, md: 12 }}
        zIndex={2}
        bg={{ base: "transparent", md: "white" }}
      >
        <Box
          bg="white"
          w="100%"
          borderRadius="2xl"
          boxShadow="lg"
          px={{ base: 4, sm: 8 }}
          py={{ base: 6, sm: 8 }}
        >
          <Stack spacing={2} mb={4} align="center">
            <Heading
              fontSize={{ base: "xl", sm: "2xl" }}
              color="#1A2250"
              fontWeight="bold"
              textAlign="center"
            >
              Welcome Back
            </Heading>
            <Text color="gray.500" fontSize="md" textAlign="center">
              Login to access your dashboard
            </Text>
          </Stack>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={4}>
              <FormControl>
                <FormLabel fontWeight="semibold" color="gray.700">
                  Email
                  <Badge bg="transparent" color="red">
                    *
                  </Badge>
                </FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none" color="gray.400">
                    <MdEmail />
                  </InputLeftElement>
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    {...register("email")}
                    isRequired
                    bg="gray.50"
                    borderColor="gray.200"
                    fontSize="md"
                    _focus={{ borderColor: "#1A2250", bg: "white" }}
                  />
                </InputGroup>
              </FormControl>
              <FormControl>
                <FormLabel
                  fontWeight="semibold"
                  color="gray.700"
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <span>
                    Password
                    <Badge bg="transparent" color="red">
                      *
                    </Badge>
                  </span>
                  <Link fontSize="sm" color="#2563eb" onClick={onPasswordOpen}>
                    Forgot Password?
                  </Link>
                </FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none" color="gray.400">
                    <MdLock />
                  </InputLeftElement>
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    {...register("password")}
                    isRequired
                    bg="gray.50"
                    borderColor="gray.200"
                    fontSize="md"
                    _focus={{ borderColor: "#1A2250", bg: "white" }}
                  />
                  <InputRightElement width="3rem">
                    <IconButton
                      variant="ghost"
                      h="1.75rem"
                      size="md"
                      onClick={handleTogglePassword}
                      icon={showPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      color="gray.600"
                    />
                  </InputRightElement>
                </InputGroup>
              </FormControl>
              <Flex align="center" justify="space-between">
                <Checkbox colorScheme="blue" fontSize="sm">
                  Remember me
                </Checkbox>
                <Box flex="1" />
              </Flex>
              <Button
                leftIcon={<FaFingerprint />}
                variant="ghost"
                color="#1A2250"
                fontWeight="medium"
                fontSize="md"
                justifyContent="flex-start"
                _hover={{ bg: "gray.100" }}
                mb={2}
              >
                Login with biometrics
              </Button>
              <Button
                bgGradient="linear(to-r, #2563eb, #3b82f6)"
                color="white"
                w="100%"
                mt={2}
                type="submit"
                isLoading={isLoading}
                fontSize={{ base: "md", md: "lg" }}
                borderRadius="lg"
                boxShadow="sm"
                _hover={{ bgGradient: "linear(to-r, #1d4ed8, #2563eb)" }}
              >
                Login
              </Button>
            </Stack>
          </form>
          <Stack align="center" mt={4} spacing={1}>
            <Text fontSize="sm" color="gray.500">
              Don&apos;t have an account?{" "}
              <Link color="#2563eb" fontWeight="semibold">
                Sign Up
              </Link>
            </Text>
          </Stack>
          <Divider my={4} />
          <Flex align="center" justify="center" direction="column" gap={2}>
            <Text fontSize="xs" color="gray.400" mb={1}>
              <Box as="span" mr={1}>
                <FaShieldAlt />
              </Box>
              Protected by 256-bit encryption
            </Text>
            <Flex gap={4} mt={1}>
              <Box as={FaShieldAlt} color="gray.400" fontSize="2xl" />
              <Box as={FaUserShield} color="gray.400" fontSize="2xl" />
              <Box as={FaCog} color="gray.400" fontSize="2xl" />
            </Flex>
          </Flex>
        </Box>
      </Flex>

      {/* Role Selection Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Login As - </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <RadioGroup onChange={setSelectedRole} value={selectedRole}>
              <Stack>
                {roles.map((role) => (
                  <Radio key={role.id} value={role.name}>
                    {role.name}
                  </Radio>
                ))}
              </Stack>
            </RadioGroup>
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="blue"
              mr={3}
              onClick={handleRoleSelection}
              isDisabled={!selectedRole}
            >
              Continue
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* reset password */}
      <ForgetPassword isOpen={isPsswordOpen} onClose={onPasswordClose} />
    </Flex>
  );
}