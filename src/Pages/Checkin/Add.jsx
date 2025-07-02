/* eslint-disable react/prop-types */
import {
  AbsoluteCenter,
  Box,
  Button,
  Divider,
  Flex,
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
import { ADD, GET } from "../../Controllers/ApiControllers";
import ShowToast from "../../Controllers/ShowToast";
import admin from "../../Controllers/admin";
import QRCodeScanner from "../../Components/QrScanner";
import todayDate from "../../Controllers/today";

export default function AddCheckin({ isOpen, onClose }) {
  const [isLoading, setisLoading] = useState(false);
  const [appointmentData, setappointmentData] = useState();
  const [showQRScanner, setShowQRScanner] = useState(false); // State for QR scanner visibility

  const { register, handleSubmit, reset, setValue, getValues } = useForm(); // Added setValue here
  const queryClient = useQueryClient();
  const toast = useToast();

  const onqrScan = (qrData) => {
    // Use setValue to update form inputs
    setValue("appointment_id", qrData.appointment_id || "");
    setValue("date", qrData.date || "");
    setValue("time", qrData.time || "");
    setShowQRScanner(false); // Hide the QR scanner after a successful scan
    getAppData(qrData.appointment_id); // Fetch additional data based on QR
  };

  const getAppData = async () => {
    const { appointment_id } = getValues();

    setisLoading(true);
    try {
      const res = await GET(admin.token, `get_appointment/${appointment_id}`);
      setisLoading(false);
      //console.log(res);
      if (res.data === null) {
        ShowToast(toast, "error", "Appointment not found");
        // Reset values if not found
        setValue("appointment_id", "");
        setValue("date", "");
        setValue("time", "");
        return;
      }
      let appointmentData = res.data;
      setappointmentData(appointmentData);
      // Use setValue to set form values programmatically
      setValue("appointment_id", appointmentData?.id || "");
      setValue("date", appointmentData?.date || "");
      setValue("time", appointmentData?.time_slots || "");
    } catch (error) {
      setisLoading(false);
      ShowToast(toast, "error", "Appointment not found");
      // Reset values if not found
      setValue("appointment_id", "");
      setValue("date", "");
      setValue("time", "");
      return;
    }
  };

  const addCheckin = async (Inputdata) => {
    if (appointmentData?.type === "Video Consultant") {
      return ShowToast(
        toast,
        "error",
        "Video Consultations cannot be checked in"
      );
    }

    try {
      setisLoading(true);
      const res = await ADD(admin.token, "add_appointment_checkin", Inputdata);
      setisLoading(false);

      if (res.response === 200) {
        ShowToast(toast, "success", "Added!");
        queryClient.invalidateQueries("checkins");
        reset(); // Reset form values
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
      <ModalContent as={"form"} onSubmit={handleSubmit(addCheckin)}>
        <ModalHeader fontSize={18} py={2}>
          New Checkin
        </ModalHeader>
        <ModalCloseButton />
        <Divider />
        <ModalBody>
          {showQRScanner ? (
            <Button
              my={2}
              w={"full"}
              size={"sm"}
              colorScheme={"blue"}
              onClick={() => setShowQRScanner(false)}
            >
              Add Data Manually
            </Button>
          ) : (
            <Button
              my={2}
              w={"full"}
              size={"sm"}
              colorScheme={"blue"}
              onClick={() => setShowQRScanner(true)}
            >
              Scan QR
            </Button>
          )}

          {showQRScanner && <QRCodeScanner onScan={onqrScan} />}

          {!showQRScanner && (
            <Box pb={3}>
              <Box position="relative" py="5">
                <Divider />
                <AbsoluteCenter bg="white" px="2" fontWeight={500}>
                  Or
                </AbsoluteCenter>
              </Box>
              <Flex alignItems={"flex-end"} gap={5}>
                <FormControl isRequired>
                  <FormLabel>Appointment ID</FormLabel>
                  <Input
                    size={"sm"}
                    placeholder="Appointment ID"
                    {...register("appointment_id", { required: true })}
                    onChange={() => {
                      setValue("date", "");
                      setValue("time", "");
                    }}
                  />
                </FormControl>
                <Button
                  colorScheme={"teal"}
                  size={"sm"}
                  onClick={() => getAppData()}
                >
                  Get Details
                </Button>
              </Flex>

              <FormControl isRequired mt={3}>
                <FormLabel>Date</FormLabel>
                <Input
                  max={todayDate()}
                  size={"sm"}
                  type="date"
                  placeholder="Date"
                  {...register("date", { required: true })}
                />
              </FormControl>
              <FormControl isRequired mt={3}>
                <FormLabel>Time</FormLabel>
                <Input
                  size={"sm"}
                  type="time"
                  step={60}
                  placeholder="Time"
                  {...register("time", { required: true })}
                />
              </FormControl>
            </Box>
          )}
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
            Add Checkin
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
