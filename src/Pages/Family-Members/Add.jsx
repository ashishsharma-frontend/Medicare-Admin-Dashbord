/* eslint-disable react/prop-types */
import {
  Box,
  Button,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputLeftAddon,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import moment from "moment";
import UsersCombobox from "../../Components/UsersComboBox";
import useUserData from "../../Hooks/Users";
import { AiOutlineDown } from "react-icons/ai";
import ISDCODEMODAL from "../../Components/IsdModal";
import { UPDATE } from "../../Controllers/ApiControllers";
import admin from "../../Controllers/admin";
import ShowToast from "../../Controllers/ShowToast";
import todayDate from "../../Controllers/today";

function AddFamily({ isOpen, onClose, user }) {
  const [isLoading, setisLoading] = useState();
  const { register, handleSubmit } = useForm();
  const queryClient = useQueryClient();
  const toast = useToast();
  const { usersData } = useUserData();
  const [selectedUser, setselectedUser] = useState();
  const [isd_code, setisd_code] = useState("+91");
  const {
    isOpen: isIsdOpen,
    onOpen: onIsdOpen,
    onClose: onIsdClose,
  } = useDisclosure();

  const AddNewDepartment = async (Inputdata) => {
    if (!selectedUser) {
      ShowToast(toast, "error", "Select User");
    }
    let formData = {
      ...Inputdata,
      dob: moment(Inputdata.dob).format("YYYY-MM-DD"),
      isd_code: isd_code,
      user_id: selectedUser.id,
    };

    try {
      setisLoading(true);
      const res = await UPDATE(admin.token, "add_family_member", formData);
      setisLoading(false);
      if (res.response === 200) {
        ShowToast(toast, "success", "Family Member Added!");
        queryClient.invalidateQueries(["family-members"]);
        queryClient.invalidateQueries(["family-members"]);
        onClose();
      } else {
        ShowToast(toast, "error", res.message);
      }
    } catch (error) {
      setisLoading(false);
      ShowToast(toast, "error", JSON.stringify(error));
    }
  };

  //   deleteImage

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isCentered
      size={"4xl"}
      scrollBehavior="inside"
    >
      <ModalOverlay />
      <ModalContent as={"form"} onSubmit={handleSubmit(AddNewDepartment)}>
        <ModalHeader fontSize={18} py={2}>
          Add Family Member
        </ModalHeader>
        <ModalCloseButton />
        <Divider />
        <ModalBody>
          <Box pb={3}>
            <Flex gap={3}>
              <FormControl isRequired>
                <FormLabel>User</FormLabel>
                <UsersCombobox
                  data={usersData}
                  name={"User"}
                  setState={setselectedUser}
                  isUser
                  defaultData={user}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>First Name</FormLabel>
                <Input
                  placeholder="First Name"
                  {...register("f_name", { required: true })}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Last Name</FormLabel>
                <Input
                  placeholder="Last Name"
                  {...register("l_name", { required: true })}
                />
              </FormControl>
            </Flex>
            <Flex gap={3} mt={5}>
              <FormControl isRequired>
                <FormLabel>Phone</FormLabel>
                <InputGroup>
                  <InputLeftAddon
                    cursor={"pointer"}
                    onClick={(e) => {
                      e.stopPropagation();
                      onIsdOpen();
                    }}
                  >
                    {isd_code} <AiOutlineDown style={{ marginLeft: "10px" }} />
                  </InputLeftAddon>
                  <Input
                    type="tel"
                    placeholder="phone Number"
                    {...register("phone", {
                      required: true,
                    pattern: /^[0-9]+$/
                    })}
                  />
                </InputGroup>
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Gender</FormLabel>
                <Select
                  placeholder="Select Gender"
                  {...register("gender", { required: true })}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </Select>
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Date Of Birth</FormLabel>
                <Input
                  max={todayDate()}
                  type="date"
                  placeholder="Date Of Birth"
                  {...register("dob", { required: true })}
                />
              </FormControl>
            </Flex>
          </Box>
        </ModalBody>
        <Divider />
        <ModalFooter py={3}>
          <Button colorScheme="gray" mr={3} onClick={onClose} size={"sm"}>
            Close
          </Button>
          <Button
            variant="solid"
            size={"sm"}
            colorScheme="blue"
            type="submit"
            isLoading={isLoading}
          >
            Add Family Member
          </Button>
        </ModalFooter>
      </ModalContent>
      <ISDCODEMODAL
        isOpen={isIsdOpen}
        onClose={onIsdClose}
        setisd_code={setisd_code}
      />
    </Modal>
  );
}

export default AddFamily;
