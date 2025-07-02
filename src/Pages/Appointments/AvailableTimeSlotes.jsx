/* eslint-disable react/prop-types */
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
  Divider,
  Box,
  Text,
  SimpleGrid,
} from "@chakra-ui/react";
import moment from "moment";
import { GET } from "../../Controllers/ApiControllers";
import Loading from "../../Components/Loading";
import "swiper/swiper-bundle.css";
import { Swiper, SwiperSlide } from "swiper/react";
import { useQuery } from "@tanstack/react-query";
import admin from "../../Controllers/admin";

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

export default function AvailableTimeSlotes({
  doctID,
  isOpen,
  onClose,
  selectedSlot,
  setselectedSlot,
  selectedDate,
  setselectedDate,
  type,
}) {
  // get doctors time slote
  const getData = async () => {
    const url =
      type === "OPD"
        ? `get_doctor_time_interval/${doctID}/${getDayName(selectedDate)}`
        : type === "Video Consultant"
        ? `get_doctor_video_time_interval/${doctID}/${getDayName(selectedDate)}`
        : `get_doctor_time_interval/${doctID}/${getDayName(selectedDate)}`;
    const res = await GET(admin.token, url);

    return res.data;
  };
  const { isLoading: timeSlotesLoading, data: timeSlots } = useQuery({
    queryKey: ["timeslotes", selectedDate, doctID, type],
    queryFn: getData,
    enabled: !!selectedDate,
  });
  // get doctors booked slotes
  const getBookedSlotes = async () => {
    const res = await GET(
      admin.token,
      `get_booked_time_slots?doct_id=${doctID}&date=${moment(
        selectedDate
      ).format("YYYY-MM-DD")}&type=${type}`
    );
    return res.data;
  };

  const { isLoading: bookedSlotesLoading, data: bookedSlotes } = useQuery({
    queryKey: ["bookedslotes", selectedDate, doctID],
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
    if (
      slot.time_end < moment().format("HH:mm") &&
      moment().format("YYYY-MM-DD") == selectedDate
    ) {
      slotAvailable = false;
    }
    return slotAvailable;
  };

  //   mutatiopn

  if (timeSlotesLoading || bookedSlotesLoading) return <Loading />;

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size={"xl"}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontSize={"md"} py={3}>
          Select date and Time Slot
        </ModalHeader>
        <ModalCloseButton top={2} />
        <Divider mt={0} />
        <ModalBody>
          <Box maxW={"100%"} overflowX={"auto"}>
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
                  <Box
                    mt={2}
                    maxH="200px"
                    overflowY="auto"
                    overflowX="hidden"
                    position="relative"
                    onWheel={(e) => e.stopPropagation()}
                  >
                    <SimpleGrid
                      columns={[3, 4, 5]}
                      px="10px"
                      spacing={2}
                      alignItems="flex-start"
                    >
                      {timeSlots?.map((slot, index) => (
                        <Button
                          key={index}
                          size="sm"
                          fontSize="xs"
                          fontWeight={600}
                          colorScheme={
                            slot === selectedSlot
                              ? "blue"
                              : !getSlotStatus(slot)
                              ? "red"
                              : "green"
                          }
                          variant="solid"
                          onClick={() => {
                            setselectedSlot(slot);
                            onClose();
                          }}
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
      </ModalContent>
    </Modal>
  );
}
