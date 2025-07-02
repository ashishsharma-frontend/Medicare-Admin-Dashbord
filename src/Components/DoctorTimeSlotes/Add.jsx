/* eslint-disable react/prop-types */
import {
  Box,
  Button,
  Divider,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Select,
  useToast,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ADD } from "../../Controllers/ApiControllers";
import ShowToast from "../../Controllers/ShowToast";
import admin from "../../Controllers/admin";

const AddTimeSlot = async (data) => {
  const res = await ADD(admin.token, "add_timeslots", data);
  if (res.response !== 200) {
    throw new Error(res.message);
  }
  return res;
};

export default function AddDoctorTimeSlotes({ isOpen, onClose, doctorID }) {
  const { register, handleSubmit, reset } = useForm();
  const queryClient = useQueryClient();
  const toast = useToast();

  const mutation = useMutation({
    mutationFn: async (data) => {
      await AddTimeSlot(data);
    },
    onSuccess: () => {
      ShowToast(toast, "success", "Time Slot Added!");
      ShowToast(toast, "success", "Time Slot Added!sssssssss");
      queryClient.invalidateQueries("time-slotes", doctorID);
      reset();
      onClose();
    },
    onError: (error) => {
      ShowToast(toast, "error", error.message);
    },
  });

  const addTimeSlotes = async (Inputdata, event) => {
    event.stopPropagation();
    let formData = {
      doct_id: doctorID,
      ...Inputdata,
    };

    mutation.mutate(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isCentered
      size={"lg"}
      scrollBehavior="inside"
    >
      <ModalOverlay />
      <ModalContent
        as={"form"}
        id="addTimeSlotesForm"
        onSubmit={handleSubmit(addTimeSlotes)}
      >
        <ModalHeader fontSize={18} py={2}>
          Add Time Slot
        </ModalHeader>
        <ModalCloseButton />
        <Divider />
        <ModalBody>
          <Box pb={3}>
            <FormControl isRequired>
              <FormLabel>Start Time</FormLabel>
              <Input
                size={"sm"}
                type="time"
                step={60}
                placeholder="Start Time"
                {...register("time_start", { required: true })}
              />
            </FormControl>
            <FormControl isRequired mt={3}>
              <FormLabel>End Time</FormLabel>
              <Input
                size={"sm"}
                type="time"
                step={60}
                placeholder="End Time"
                {...register("time_end", { required: true })}
              />
            </FormControl>
            <FormControl isRequired mt={3}>
              <FormLabel>Time Duration ( In Minutes )</FormLabel>
              <NumberInput size={"sm"} defaultValue={1} min={1} max={60}>
                <NumberInputField
                  placeholder="Time Duration"
                  defaultValue={1}
                  min={1}
                  max={5}
                  {...register("time_duration", { required: true })}
                />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>
            <FormControl isRequired mt={3} size={"sm"} colorScheme="blue">
              <FormLabel>Day</FormLabel>
              <Select
                colorScheme="blue"
                placeholder="Select Day"
                size={"sm"}
                {...register("day", { required: true })}
              >
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
                <option value="Saturday">Saturday</option>
                <option value="Sunday">Sunday</option>
              </Select>
            </FormControl>
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
            isLoading={mutation.isPending}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            Add Slot
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
