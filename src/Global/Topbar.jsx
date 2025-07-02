import { BiCamera } from "react-icons/bi";
import { AiFillSetting } from "react-icons/ai";
import { FiLogOut } from "react-icons/fi";
import { RiLockPasswordLine } from "react-icons/ri";
import {
  Flex,
  IconButton,
  useColorModeValue,
  Text,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Box,
  ModalOverlay,
  ModalContent,
  ModalBody,
  Modal,
  Avatar,
  Image,
  useColorMode,
  Divider,
  Heading,
  Center,
  Stack,
  FormControl,
  FormLabel,
  InputGroup,
  InputLeftElement,
  Input,
  VStack,
  useMediaQuery,
  Button,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { FiSun, FiMoon, FiUser } from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";
import admin from "../Controllers/admin";
import moment from "moment";
import { useForm } from "react-hook-form";
import { BsEnvelopeAt, BsPersonAdd, BsPhone } from "react-icons/bs";
import NotificationIcon from "../Components/Notification";
import UpdateAdminPassword from "../Components/UpdatePassword";
import useSettingsData from "../Hooks/SettingData";
import imageBaseURL from "../Controllers/image";
import useHasPermission from "../Hooks/HasPermission";
import { ADD } from "../Controllers/ApiControllers";
import { useMutation } from "@tanstack/react-query";
import ShowToast from "../Controllers/ShowToast";
import Logout from "../Controllers/logout";

const updateUser = async (data) => {
  const res = await ADD(admin.token, "update_user", data);
  if (res.response !== 200) {
    throw new Error(res.message);
  }
  return res;
};
export default function Topbar() {
  const [isModalOpen, setModalOpen] = useState(false);
  const { colorMode, toggleColorMode } = useColorMode();
  const Uselocation = useLocation();
  const location = Uselocation.pathname.split("/")[1];
  const { register, handleSubmit } = useForm();
  const [isMobile] = useMediaQuery("(max-width: 600px)");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();
  const { settingsData } = useSettingsData();
  const { hasPermission } = useHasPermission();
  const toast = useToast();
  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  useEffect(() => {
    colorMode === "dark"
      ? document.body.classList.add("dark")
      : document.body.classList.remove("dark");
  }, [colorMode]);

  // update  user
  const logo = settingsData?.find((value) => value.id_name === "logo");

  // handle updateMutation
  const mutation = useMutation({
    mutationFn: async (data) => {
      await updateUser(data);
    },
    onError: (error) => {
      ShowToast(toast, "error", error.message);
    },
    onSuccess: () => {
      ShowToast(toast, "success", "updated!");
      closeModal();
    },
  });

  const handleUpdate = (data) => {
    const formData = { ...data, id: admin.id };
    mutation.mutate(formData);
  };

  return (
    <Flex
      as="header"
      align="center"
      justify="space-between"
      px="4"
      py="2"
      bg={useColorModeValue("white", "gray.800")}
      boxShadow="none"
      zIndex="sticky"
      top="0"
      position={"sticky"}
      borderBottom={"1px solid"}
      borderColor={useColorModeValue("gray.200", "gray.600")}
    >
      <Box display={"flex"} alignItems={"center"} gap={5}>
        <Image 
            w={12} 
            src={`${imageBaseURL}/${logo?.value}`} 
            fallbackSrc="/admin/logo.png" 
          />
        <Text
          fontSize="xl"
          fontWeight="500"
          mb={0}
          textTransform={"capitalize"}
        >
          {location ? location : "Dashboard"}
        </Text>
      </Box>

      <Flex>
        <NotificationIcon />
        <IconButton
          aria-label="Toggle color mode"
          icon={colorMode === "light" ? <FiMoon /> : <FiSun />}
          onClick={() => {
            toggleColorMode();
            colorMode === "light"
              ? document.body.classList.add("dark")
              : document.body.classList.remove("dark");
          }}
          variant="ghost"
          colorScheme="black"
        />{" "}
        <Menu>
          <MenuButton
            as={IconButton}
            variant="ghost"
            colorScheme="black"
            icon={<FiUser />}
          />

          <MenuList>
            <Box p={2} w={300}>
              <Flex justify={"center"}>
                <Avatar
                  src={`${imageBaseURL}/${admin.image}`}
                  fallbackSrc="/admin/profile.png"
                  w={16}
                />
              </Flex>
              <Text textAlign={"center"} mt={2} fontSize={"lg"}>
                {admin.f_name} {admin.l_name}
              </Text>
              <Text textAlign={"center"} fontSize={"md"} fontWeight={600}>
                {admin.role.name}
              </Text>
            </Box>
            <Divider mb={3} />
            <MenuItem onClick={openModal} icon={<FiUser />}>
              Account
            </MenuItem>
            <MenuItem onClick={onOpen} icon={<RiLockPasswordLine />}>
              Change Password
            </MenuItem>
            {hasPermission("SETTING_VIEW") && (
              <MenuItem
                onClick={() => {
                  navigate("/settings");
                }}
                icon={<AiFillSetting />}
              >
                Settings
              </MenuItem>
            )}

            <MenuItem
              icon={<FiLogOut />}
              onClick={() => {
                Logout();
              }}
            >
              Logout
            </MenuItem>
          </MenuList>
        </Menu>
      </Flex>
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        isCentered
        scrollBehavior={isMobile ? "outside" : "inside"}
        size={"xl"}
      >
        <ModalOverlay />
        <ModalContent p={0} m={2} bg={"transparent"}>
          {" "}
          <ModalBody
            p={0}
            sx={{
              "&::-webkit-scrollbar": {
                display: "none",
              },
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
            as={"form"}
            onSubmit={handleSubmit(handleUpdate)}
          >
            {" "}
            <Center py={0} width={"100%"} minHeight={!isMobile && "80vh"}>
              <Box
                maxW={"100%"}
                w={"full"}
                bg={useColorModeValue("white", "gray.800")}
                boxShadow={"2xl"}
                rounded={"md"}
                overflow={"hidden"}
              >
                <Image
                  h={"120px"}
                  w={"full"}
                  src={
                    "https://images.unsplash.com/photo-1612865547334-09cb8cb455da?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80"
                  }
                  objectFit="cover"
                  alt="#"
                />
                <Flex justify={"center"} mt={-12} pos={"relative"}>
                  <Avatar
                    size={"xl"}
                    name={`${admin?.f_name} ${admin?.l_name}`}
                    src={`${imageBaseURL}/${admin.image}`}
                    fallbackSrc={"/vite.svg"}
                  />

                  <FileUploadButton />
                </Flex>

                <Box p={6}>
                  <Stack spacing={0} align={"center"} mb={5}>
                    <Heading
                      fontSize={"lg"}
                      fontWeight={500}
                      fontFamily={"body"}
                    >
                      {admin?.f_name} {admin?.l_name}
                    </Heading>
                    <Text color={"gray.500"} fontSize={"xs"}>
                      Member Since{" "}
                      {moment(admin?.created_at).format("MMM DD YYYY")}
                    </Text>
                  </Stack>

                  <VStack direction={"row"} justify={"center"} spacing={6}>
                    <Flex gap={4}>
                      {" "}
                      <FormControl id="name">
                        <FormLabel>First Name</FormLabel>
                        <InputGroup borderColor="#E0E1E7">
                          <InputLeftElement pointerEvents="none">
                            <BsPersonAdd color="gray.800" />
                          </InputLeftElement>
                          <Input
                            type="text"
                            size="md"
                            defaultValue={admin?.f_name}
                            {...register("f_name", { required: true })}
                          />
                        </InputGroup>
                      </FormControl>{" "}
                      <FormControl id="name">
                        <FormLabel>Name</FormLabel>
                        <InputGroup borderColor="#E0E1E7">
                          <InputLeftElement pointerEvents="none">
                            <BsPersonAdd color="gray.800" />
                          </InputLeftElement>
                          <Input
                            type="text"
                            size="md"
                            defaultValue={admin?.l_name}
                            {...register("l_name", { required: true })}
                          />
                        </InputGroup>
                      </FormControl>
                    </Flex>

                    <FormControl id="email">
                      <FormLabel>Email</FormLabel>
                      <InputGroup borderColor="#E0E1E7">
                        <InputLeftElement pointerEvents="none">
                          <BsEnvelopeAt color="gray.800" />
                        </InputLeftElement>
                        <Input
                          type="email"
                          size="md"
                          defaultValue={admin?.email}
                          {...register("email", {
                            required: false,
                            pattern:
                              "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$",
                          })}
                        />
                      </InputGroup>
                    </FormControl>
                    <FormControl id="Phone">
                      <FormLabel>Phone</FormLabel>
                      <InputGroup borderColor="#E0E1E7">
                        <InputLeftElement pointerEvents="none">
                          <BsPhone color="gray.800" />
                        </InputLeftElement>
                        <Input
                          isDisabled
                          type="tel"
                          size="md"
                          value={admin?.phone}
                        />
                      </InputGroup>
                    </FormControl>
                  </VStack>

                  <Button
                    size={"sm"}
                    w={"full"}
                    mt={8}
                    colorScheme={"blue"}
                    color={"white"}
                    rounded={"md"}
                    _hover={{
                      transform: "translateY(-2px)",
                      boxShadow: "lg",
                    }}
                    type="submit"
                    isLoading={mutation.isPending}
                  >
                    Update
                  </Button>
                  <Button
                    mt={2}
                    size={"sm"}
                    w={"full"}
                    bg={useColorModeValue("gray.600", "gray.600")}
                    color={"white"}
                    rounded={"md"}
                    _hover={{
                      transform: "translateY(-2px)",
                      boxShadow: "lg",
                    }}
                    onClick={closeModal}
                  >
                    Close
                  </Button>
                </Box>
              </Box>
            </Center>
          </ModalBody>
        </ModalContent>
      </Modal>

      <UpdateAdminPassword isOpen={isOpen} onClose={onClose} />
    </Flex>
  );
}

const FileUploadButton = () => {
  const inputRef = useRef(null);

  const handleButtonClick = () => {
    inputRef.current.click(); // Programmatically click the hidden file input
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      return;
    }
  };

  return (
    <>
      <IconButton
        icon={<BiCamera fontSize={16} />}
        colorScheme="blue"
        onClick={handleButtonClick}
        size={"sm"}
      ></IconButton>
      <Input
        type="file"
        ref={inputRef}
        display="none"
        onChange={handleFileChange}
      />
    </>
  );
};
