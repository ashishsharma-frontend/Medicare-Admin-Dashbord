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
  Flex,
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
      size="lg"
      scrollBehavior="inside"
    >
      <ModalOverlay />
      <form onSubmit={handleSubmit(onSubmit)}>
        <ModalContent borderRadius="2xl" overflow="hidden" maxW="480px">
          <ModalHeader
            py={3}
            fontSize="xl"
            fontWeight="bold"
            bg="blue.700"
            color="#fff"
            borderTopRadius="2xl"
          >
            Add Patient
          </ModalHeader>
          <ModalCloseButton top={2} color="#fff" />
          <Divider mb={0} />

          <ModalBody py={6} px={{ base: 2, md: 6 }}>
            <Grid
              templateColumns={{ base: "1fr", md: "1fr 1fr" }}
              gap={4}
              w="100%"
            >
              <FormControl isRequired>
                <FormLabel>First Name</FormLabel>
                <Input
                  size="md"
                  variant="filled"
                  {...register("f_name")}
                  placeholder="First Name"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Last Name</FormLabel>
                <Input
                  size="md"
                  variant="filled"
                  {...register("l_name")}
                  placeholder="Last Name"
                />
              </FormControl>

              <FormControl isRequired gridColumn={{ base: "1", md: "span 2" }}>
                <FormLabel>Phone</FormLabel>
                <InputGroup>
                  <InputLeftAddon
                    h={10}
                    bg="gray.50"
                    borderRight={0}
                    borderRadius="md"
                    cursor="pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      onIsdOpen();
                    }}
                    fontSize="md"
                  >
                    {isd_code} <AiOutlineDown style={{ marginLeft: "10px" }} />
                  </InputLeftAddon>
                  <Input
                    size="md"
                    variant="filled"
                    type="tel"
                    placeholder="Phone Number"
                    {...register("phone", {
                      required: true,
                      pattern: /^[0-9]+$/,
                    })}
                  />
                </InputGroup>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Gender</FormLabel>
                <Select
                  size="md"
                  variant="filled"
                  defaultValue="Male"
                  {...register("gender")}
                  placeholder="Gender"
                >
                  <option value={"Male"}>Male</option>
                  <option value={"Female"}>Female</option>
                </Select>
              </FormControl>

              <FormControl as="fieldset">
                <FormLabel as="legend">Age or DOB</FormLabel>
                <RadioGroup
                  onChange={(value) => setAgeInType(value)}
                  value={ageInType}
                >
                  <Stack direction="row" spacing={6}>
                    <Radio value="dob">DOB</Radio>
                    <Radio value="age">Age</Radio>
                  </Stack>
                </RadioGroup>
              </FormControl>

              {ageInType === "dob" ? (
                <FormControl gridColumn={{ base: "1", md: "span 2" }}>
                  <FormLabel>Date of Birth</FormLabel>
                  <Input
                    max={todayDate()}
                    size="md"
                    variant="filled"
                    type="date"
                    {...register("dob")}
                  />
                </FormControl>
              ) : (
                <FormControl gridColumn={{ base: "1", md: "span 2" }}>
                  <FormLabel>Age</FormLabel>
                  <Input
                    size="md"
                    variant="filled"
                    {...register("age", {
                      pattern: {
                        value: /^[0-9]+$/,
                        message: "Please enter a valid number",
                      },
                    })}
                    placeholder="Age"
                  />
                </FormControl>
              )}

              <FormControl>
                <FormLabel>City</FormLabel>
                <Input size="md" variant="filled" {...register("city")} />
              </FormControl>

              <FormControl>
                <FormLabel>State</FormLabel>
                <Input size="md" variant="filled" {...register("state")} />
              </FormControl>
            </Grid>
          </ModalBody>

          <ModalFooter>
            <Flex w="100%" gap={3}>
              <Button
                colorScheme="gray"
                onClick={onClose}
                size="md"
                borderRadius="md"
                fontWeight="semibold"
                flex={1}
              >
                Close
              </Button>
              <Button
                colorScheme="blue"
                size="md"
                type="submit"
                isLoading={mutation.isPending}
                borderRadius="md"
                fontWeight="semibold"
                flex={2}
              >
                Add Patient
              </Button>
            </Flex>
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