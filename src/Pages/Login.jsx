import { AiFillEyeInvisible } from "react-icons/ai";
import { AiFillEye } from "react-icons/ai";
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
  InputRightElement,
  useColorModeValue,
} from "@chakra-ui/react";
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
          // Multiple roles, show role selection modal
          setRoles(loginData.data.role);
          setloginData({
            data: loginData.data,
            token: loginData.token,
          });
          onOpen();
        } else {
          // Single role, log in directly
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
      role: selectedRole, // Set selected role
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
    <>
      <Stack
        minH={"100vh"}
        direction={{ base: "column", md: "row" }}
        background={"url('/admin/loginbg.png')"}
        backgroundSize={"cover"}
        backgroundPosition={"center"}
      >
        {" "}
        <Flex
          p={8}
          flex={1}
          align={"center"}
          justify={"center"}
          flexDir={"column"}
        >
          <Stack
            spacing={4}
            w={"full"}
            maxW={"md"}
            as={"form"}
            onSubmit={handleSubmit(onSubmit)}
            bg={"gray.50"}
            padding={8}
            borderRadius={8}
            minW={"600px"}
            color={useColorModeValue("gray.800", "gray.800")}
          >
            <Heading fontSize={"2xl"}>Sign in to your account</Heading>
            <FormControl>
              <FormLabel>
                Email
                <Badge bg={"transparent"} color={"red"}>
                  *
                </Badge>
              </FormLabel>
              <Input
                type="email"
                isRequired
                isFocused
                placeholder="Email"
                {...register("email")}
              />
            </FormControl>
            <FormControl mt={5}>
              <FormLabel
                display={"flex"}
                alignItems={"center"}
                justifyContent={"space-between"}
              >
                <span>
                  Password
                  <Badge bg={"transparent"} color={"red"}>
                    *
                  </Badge>
                </span>
                <Link fontSize={14} color={"blue.500"} onClick={onPasswordOpen}>
                  Forget password?
                </Link>
              </FormLabel>
              <InputGroup size="md">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  isRequired
                  isFocused
                  {...register("password")}
                />
                <InputRightElement width="3rem">
                  <IconButton
                    variant={"ghost"}
                    h="1.75rem"
                    size="md"
                    onClick={handleTogglePassword}
                    icon={showPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    color={useColorModeValue("gray.800", "gray.800")}
                  />
                </InputRightElement>
              </InputGroup>
            </FormControl>
            <Button
              colorScheme="blue"
              w={"100%"}
              mt={10}
              type="submit"
              isLoading={isLoading}
            >
              Sign in
            </Button>
          </Stack>
        </Flex>
        <Flex flex={1}></Flex>
      </Stack>

      {/* Role Selection Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Login As - </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <RadioGroup onChange={setSelectedRole} value={selectedRole}>
              <Stack>
                {" "}
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
    </>
  );
}
