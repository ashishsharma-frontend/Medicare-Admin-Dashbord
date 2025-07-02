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
  Divider,
  FormControl,
  FormLabel,
  Input,
  Grid,
  Radio,
  RadioGroup,
  Stack,
  Select,
  useDisclosure,
  InputGroup,
  InputLeftAddon,
  useToast,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import ISDCODEMODAL from "../../Components/IsdModal";
import { useState } from "react";
import { AiOutlineDown } from "react-icons/ai";
import moment from "moment";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ADD } from "../../Controllers/ApiControllers";
import admin from "../../Controllers/admin";
import ShowToast from "../../Controllers/ShowToast";
import todayDate from "../../Controllers/today";

const addPatient = async (data) => {
  const res = await ADD(admin.token, "add_patient", data);
  if (res.response !== 200) {
    throw new Error(res.message);
  }
  return res;
};

function AddPatients({ nextFn, isOpen, onClose }) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { register, handleSubmit, reset, watch } = useForm();
  const [isd_code, setisd_code] = useState("+91");
  const [ageInType, setAgeInType] = useState("dob");
  const {
    isOpen: isIsdOpen,
    onOpen: onIsdOpen,
    onClose: onIsdClose,
  } = useDisclosure();

  const mutation = useMutation({
    mutationFn: async (data) => {
      await addPatient(data);
    },
    onError: (error) => {
      ShowToast(toast, "error", JSON.stringify(error));
    },
    onSuccess: () => {
      if (nextFn) {
        nextFn({
          f_name: watch("f_name"),
          l_name: watch("l_name"),
          phone: watch("phone"),
        });
      }
      ShowToast(toast, "success", "Patient Added");
      queryClient.invalidateQueries("users");
      queryClient.invalidateQueries("patients");
      onClose();
      reset();
    },
  });

  const onSubmit = (data) => {
    if (!isd_code) {
      return ShowToast(toast, "error", "Select ISD Code");
    }
    let formData = {
      ...data,
      isd_code,
      dob: data.dob ? moment(data.dob).format("YYYY-MM-DD") : "",
    };

    mutation.mutate(formData);
  };
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isCentered
      size={"xl"}
      scrollBehavior="inside"
    >
      <ModalOverlay />
      <form onSubmit={handleSubmit(onSubmit)}>
        <ModalContent borderRadius={8} overflow={"hidden"} zIndex={99999999}>
          <ModalHeader py={1} fontSize={"md"} bg={"blue.700"} color={"#fff"}>
            Add Patient
          </ModalHeader>
          <ModalCloseButton top={0} color={"#fff"} />
          <Divider />

          <ModalBody>
            <Grid templateColumns="repeat(3, 1fr)" gap={4} mt={3}>
              <FormControl isRequired>
                <FormLabel mb={-1}>First Name</FormLabel>
                <Input
                  size="sm"
                  variant="flushed"
                  {...register("f_name")}
                  placeholder="First Name"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel mb={-1}>Last Name</FormLabel>
                <Input
                  size="sm"
                  variant="flushed"
                  {...register("l_name")}
                  placeholder="Last Name"
                />
              </FormControl>

              <FormControl isRequired gridcx>
                <FormLabel mb={-1}>Phone</FormLabel>
                <InputGroup>
                  <InputLeftAddon
                    h={8}
                    bg={"none"}
                    borderTop={0}
                    borderLeft={0}
                    p={0}
                    pr={2}
                    borderRadius={0}
                    cursor={"pointer"}
                    onClick={(e) => {
                      e.stopPropagation();
                      onIsdOpen();
                    }}
                    fontSize={"sm"}
                  >
                    {isd_code} <AiOutlineDown style={{ marginLeft: "10px" }} />
                  </InputLeftAddon>
                  <Input
                    size="sm"
                    variant="flushed"
                    type="tel"
                    placeholder="Phone Number"
                    {...register("phone", {
                      required: true,
                    pattern: /^[0-9]+$/
                    })}
                  />
                </InputGroup>
              </FormControl>

              <FormControl isRequired>
                <FormLabel mb={-1}>Gender</FormLabel>
                <Select
                  size="sm"
                  variant="flushed"
                  defaultValue="Male"
                  {...register("gender")}
                  placeholder="Gender"
                >
                  <option value={"Male"}>Male</option>
                  <option value={"Female"}>Female</option>
                </Select>
              </FormControl>
              <FormControl as="fieldset" mb={4}>
                <FormLabel as="legend">Age Or DOB</FormLabel>
                <RadioGroup
                  onChange={(value) => setAgeInType(value)}
                  value={ageInType}
                >
                  <Stack direction="row">
                    <Radio value="dob">DOB</Radio>
                    <Radio value="age">Age</Radio>
                  </Stack>
                </RadioGroup>
              </FormControl>

              {ageInType === "dob" ? (
                <FormControl>
                  <FormLabel mb={-1}>Date of Birth</FormLabel>
                  <Input
                    max={todayDate()}
                    size="sm"
                    variant="flushed"
                    type="date"
                    {...register("dob")}
                  />
                </FormControl>
              ) : (
                <FormControl>
                  <FormLabel mb={-1}>Age</FormLabel>
                  <Input
                    size="sm"
                    variant="flushed"
                    {...register("age", {
                      pattern: {
                        value: /^[0-9]+$/,
                        message: "Please enter a valid number",
                      },
                    })}
                  />
                </FormControl>
              )}

              <FormControl>
                <FormLabel mb={-1}>City</FormLabel>
                <Input size="sm" variant="flushed" {...register("city")} />
              </FormControl>

              <FormControl>
                <FormLabel mb={-1}>State</FormLabel>
                <Input size="sm" variant="flushed" {...register("state")} />
              </FormControl>
            </Grid>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="gray" mr={3} onClick={onClose} size={"sm"}>
              Close
            </Button>
            <Button
              colorScheme={"blue"}
              size={"sm"}
              type="submit"
              isLoading={mutation.isPending}
            >
              Add Patient
            </Button>
          </ModalFooter>
        </ModalContent>
      </form>
      <ISDCODEMODAL
        isOpen={isIsdOpen}
        onClose={onIsdClose}
        setisd_code={setisd_code}
      />
    </Modal>
  );
}

export default AddPatients;
