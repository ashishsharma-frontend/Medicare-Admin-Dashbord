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
  useToast,
} from "@chakra-ui/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { UPDATE } from "../../Controllers/ApiControllers";
import ShowToast from "../../Controllers/ShowToast";
import admin from "../../Controllers/admin";
import todayDate from "../../Controllers/today";

export default function UpdateCheckin({ isOpen, onClose, data }) {
  const [isLoading, setisLoading] = useState();

  const { register, handleSubmit, reset } = useForm();
  const queryClient = useQueryClient();
  const toast = useToast();

  const handleUpdate = async (Inputdata) => {
    let formData = {
      ...Inputdata,
      id: data.id,
    };
    
    try {
      setisLoading(true);
      const res = await UPDATE(admin.token, "update_appointment_checkin", formData);
      setisLoading(false);
      if (res.response === 200) {
        ShowToast(toast, "success", "Updated!");
        queryClient.invalidateQueries("checkins");
        reset();
        onClose();
      } else {
        ShowToast(toast, "error", res.message);
      }
    } catch (error) {
      setisLoading(false);
      ShowToast(toast, "error", JSON.stringify(error));
    }
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
    <ModalContent as={"form"} onSubmit={handleSubmit(handleUpdate)}>
      <ModalHeader fontSize={18} py={2}>
        Update Checkin
      </ModalHeader>
      <ModalCloseButton />
      <Divider />
      <ModalBody>
        {" "}
        <Box pb={3}>
          <FormControl isRequired>
            <FormLabel>Appointment ID</FormLabel>
            <Input
              size={"sm"}
              defaultValue={data?.appointment_id}
              placeholder="Appointment ID"
              {...register("appointment_id", { required: true })}
            />
          </FormControl>
          <FormControl isRequired mt={3}>
            <FormLabel>Date</FormLabel>
            <Input
             max={todayDate()}
              defaultValue={data?.date}
              size={"sm"}
              type="date"
              step={60}
              placeholder="Date"
              {...register("date", { required: true })}
              isDisabled
            />
          </FormControl>
          <FormControl isRequired mt={3}>
            <FormLabel>End Date</FormLabel>
            <Input
              defaultValue={data?.time}
              size={"sm"}
              type="time"
              step={60}
              placeholder="time"
              {...register("time", { required: true })}
            />
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
          isLoading={isLoading}
        >
          Update Checkin
        </Button>
      </ModalFooter>
    </ModalContent>
  </Modal>
  );
}
