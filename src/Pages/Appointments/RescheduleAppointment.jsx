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
  Box,
  Text,
  SimpleGrid,
  useToast,
} from "@chakra-ui/react";
import moment from "moment";
import { GET, UPDATE } from "../../Controllers/ApiControllers";
import { useState } from "react";
import Loading from "../../Components/Loading";
import "swiper/swiper-bundle.css";
import { Swiper, SwiperSlide } from "swiper/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import admin from "../../Controllers/admin";
import ShowToast from "../../Controllers/ShowToast";

const Calender15Days = () => {
  const next15Days = [];
  // Generate the next 15 days starting from today
  for (let i = 0; i < 15; i++) {
    const date = moment().add(i, "days").format("YYYY-MM-DD");
    next15Days.push(date);
  }
  return next15Days;
};

const getFormattedDate = (dateString) => {
  const date = moment(dateString, "YYYY-MM-DD");
  return {
    month: date.format("MMM"),
    date: date.format("DD"),
    year: date.format("ddd"),
  };
};

// get time slotes
const getDayName = (dateString) => {
  const date = moment(dateString, "YYYYMMDD");
  return date.format("dddd");
};

// swiper params

const swiperParams = {
  spaceBetween: 20,
  centeredSlides: false,
  loop: false,
  slidesPerView: 7.5,
  breakpoints: {
    1024: { spaceBetween: 5, slidesPerView: 7.5 },
    768: { spaceBetween: 5, slidesPerView: 6.5 },
    640: {
      spaceBetween: 5,
      slidesPerView: 5.5,
    },
    320: {
      spaceBetween: 5,
      slidesPerView: 5.5,
    },
  },
};

// handel resch
const handleReschedule = async (data) => {
  const res = await UPDATE(admin.token, "appointment_rescheduled", data);
  if (res.response !== 200) {
    throw new Error(res.message);
  }
  return res;
};

export default function RescheduleAppointment({ data, isOpen, onClose }) {
  const [selectedDate, setselectedDate] = useState();
  const [selectedSlot, setselectedSlot] = useState();
  const queryClient = useQueryClient();
  const toast = useToast();
  // get doctors time slote
  const getData = async () => {
    const res = await GET(
      admin.token,
      `get_doctor_time_interval/${data.doct_id}/${getDayName(selectedDate)}`
    );
    return res.data;
  };
  const { isLoading: timeSlotesLoading, data: timeSlots } = useQuery({
    queryKey: ["timeslotes", selectedDate, data.doct_id],
    queryFn: getData,
    enabled: !!selectedDate,
  });
  // get doctors booked slotes
  const getBookedSlotes = async () => {
    
    const res = await GET(
      admin.token,
      `get_booked_time_slots?doct_id=${data.doct_id}&date=${moment(
        selectedDate
      ).format("YYYY-MM-DD")}&type=OPD`
    );
    return res.data;
  };

  const { isLoading: bookedSlotesLoading, data: bookedSlotes } = useQuery({
    queryKey: ["bookedslotes", selectedDate, data.doct_id],
    queryFn: getBookedSlotes,
    enabled: !!selectedDate,
    staleTime: 0,
    cacheTime: 0,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  // get slot is booked or not
  const getSlotStatus = (slot) => {
    let slotAvailable = true;

    bookedSlotes?.forEach((bookedSlot) => {
      if (
        bookedSlot.time_slots === slot.time_start &&
        bookedSlot.date === selectedDate
      ) {
        slotAvailable = false;
      }
    });

    return slotAvailable;
  };

  //   mutatiopn
  const mutation = useMutation({
    mutationFn: async () => {
      let formData = {
        id: data.id,
        date: selectedDate,
        time_slots: selectedSlot.time_start,
      };
      await handleReschedule(formData);
    },
    onSuccess: () => {
      setselectedDate();
      setselectedSlot();
      ShowToast(toast, "success", "Success");
      queryClient.invalidateQueries("appointments");
      queryClient.invalidateQueries(["appointment", data.id]);
      queryClient.invalidateQueries([
        "bookedslotes",
        selectedDate,
        data.doct_id,
      ]);
      queryClient.invalidateQueries(["timeslotes", selectedDate, data.doct_id]);
      onClose();
    },
    onError: (error) => {
      ShowToast(toast, "error", error.message);
    },
  });

  if (timeSlotesLoading || bookedSlotesLoading || mutation.isPending)
    return <Loading />;

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size={"xl"}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontSize={"md"} py={3}>
          Reschedule Appointment
        </ModalHeader>
        <ModalCloseButton top={2} />
        <Divider mt={0} />
        <ModalBody>
          <Box maxW={"100%"} overflow={"hidden"}>
            {" "}
            <Swiper
              {...swiperParams}
              style={{ cursor: "grab", overflow: "hidden", maxWidth: "100%" }}
            >
              {Calender15Days().map((day, index) => (
                <SwiperSlide key={index}>
                  <Box
                    key={index}
                    onClick={() => {
                      setselectedDate(moment(day).format("YYYY-MM-DD"));
                    }}
                  >
                    <Box
                      bg={
                        selectedDate === moment(day).format("YYYY-MM-DD")
                          ? "green.500"
                          : "blue.500"
                      }
                      mr={3}
                      borderRadius={5}
                      color={"#fff"}
                      p={1}
                      cursor={"pointer"}
                    >
                      <Text
                        fontSize="xs"
                        fontWeight="bold"
                        color="gray.100"
                        textAlign="center"
                        m={0}
                      >
                        {getFormattedDate(day).month}
                      </Text>
                      <Text
                        fontSize="sm"
                        fontWeight="700"
                        color="gray.100"
                        textAlign="center"
                        m={0}
                      >
                        {getFormattedDate(day).date}
                      </Text>
                      <Text
                        fontSize="xs"
                        fontWeight="bold"
                        color="gray.100"
                        textAlign="center"
                        m={0}
                      >
                        {getFormattedDate(day).year}
                      </Text>
                    </Box>
                  </Box>
                </SwiperSlide>
              ))}
            </Swiper>
          </Box>
          <Box>
            {selectedDate ? (
              <Box
                mt={5}
                border={"1px solid"}
                borderColor={"gray.200"}
                p={2}
                borderRadius={4}
              >
                <Text textAlign={"left"} fontWeight={600} fontSize={16} mb={1}>
                  Time Slotes
                </Text>

                {timeSlots?.length ? (
                  <Box mt={2}>
                    <SimpleGrid columns={[3, 4, 5]} spacing={2}>
                      {timeSlots?.map((slot, index) => (
                        <Button
                          key={index}
                          size="sm"
                          fontSize="xs"
                          fontWeight={600}
                          colorScheme={
                            !getSlotStatus(slot)
                              ? "red"
                              : slot === selectedSlot
                              ? "blue"
                              : "green"
                          }
                          variant="solid"
                          onClick={() => {
                            if (!getSlotStatus(slot)) {
                              return;
                            }
                            setselectedSlot(slot);
                          }}
                          isDisabled={!getSlotStatus(slot)}
                          _disabled={{
                            backgroundColor: "red.500",
                          }}
                        >
                          {slot.time_start} - {slot.time_end}
                        </Button>
                      ))}
                    </SimpleGrid>
                  </Box>
                ) : (
                  <Text color={"red.400"} fontWeight={700} fontSize={"sm"}>
                    Sorry , no available time slotes ware found for the selected
                    date.
                  </Text>
                )}
              </Box>
            ) : (
              ""
            )}
          </Box>
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="gray" mr={3} onClick={onClose} size={"sm"}>
            Close
          </Button>
          <Button
            colorScheme={"blue"}
            size={"sm"}
            onClick={() => {
              mutation.mutate();
            }}
          >
            Reschedule Appointment
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
