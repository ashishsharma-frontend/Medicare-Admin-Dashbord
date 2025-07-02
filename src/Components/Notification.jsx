import { useEffect, useState } from "react";
import {
  Menu,
  MenuButton,
  MenuList,
  Text,
  Button,
  useToast,
  Divider,
  Box,
} from "@chakra-ui/react";
import { BiBell } from "react-icons/bi";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { GET } from "../Controllers/ApiControllers";
import admin from "../Controllers/admin";
import { useNavigate } from "react-router-dom";
import { messaging, onMessage } from "../Controllers/firebase.config";

const getData = async () => {
  let url =
    admin.role.name === "Doctor"
      ? `get_doctor_notification/doctor/${admin.id}`
      : "get_doctor_notification";
  const res = await GET(admin.token, url);
  return res.data;
};

function NotificationIcon() {
  const [unreadCount, setUnreadCount] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const publicUrl = import.meta.env.BASE_URL;
  const sound = new Audio(`${publicUrl}/notification.mp3`);
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribe = onMessage(messaging, (payload) => {
      sound
        .play()
        .catch((error) => console.error("Error playing sound:", error));
      setUnreadCount(true);
      queryClient.invalidateQueries(["doctor-notification"]);
      const { title, body } = payload.notification;
      // Show Chakra toast notification
      return toast({
        title: title,
        description: body,
        status: "info",
        duration: 5000,
        isClosable: true,
        position: "top", // Position of the toast
      });
    });

    return () => unsubscribe();
  }, [messaging]);

  const { data: notifications, isLoading } = useQuery({
    queryFn: getData,
    queryKey: ["doctor-notification"],
  });

  return (
    <Menu isOpen={isOpen} onClose={() => setIsOpen(false)}>
      <MenuButton
        as={Button}
        variant="ghost"
        colorScheme="black"
        pos={"relative"}
        onClick={() => {
          setUnreadCount(false);
          setIsOpen(true);
        }}
      >
        <BiBell fontSize={"18px"} />
        {unreadCount && (
          <Box
            bg={"blue.500"}
            borderRadius="full"
            position="absolute"
            top="2"
            right="3"
            w={2}
            h={2}
          ></Box>
        )}
      </MenuButton>
      <MenuList
        minW={"600px"}
        maxH={"60vh"}
        overflow={"hide"}
        overflowY={"scroll"}
        pt={0}
      >
        <Text p={2} fontSize={18} fontWeight={600} textAlign={"center"}>
          Notifications
        </Text>
        <Divider />
        {isLoading ? (
          <Text p={4}>Loading</Text>
        ) : (
          notifications?.slice(0, 20).map((notification) => (
            <Box
              key={notification.id}
              p={4}
              m={2}
              borderWidth="1px"
              borderRadius="lg"
              boxShadow="sm"
              _hover={{ boxShadow: "md" }}
              maxW={"600px"}
              cursor={"pointer"}
              onClick={() => {
                setIsOpen(false);

                if (notification.file_id) {
                  navigate(`appointment/${notification.appointment_id}`);
                } else if (notification.prescription_id) {
                  navigate(`appointment/${notification.appointment_id}`);
                } else if (notification.appointment_id) {
                  navigate(`appointment/${notification.appointment_id}`);
                } else {
                  navigate(`appointment/${notification.appointment_id}`);
                }
              }}
            >
              <Text fontSize="md" fontWeight="bold">
                {notification.title}
              </Text>
              <Text fontSize="sm" color="gray.500">
                {notification.body}
              </Text>
            </Box>
          ))
        )}
        {notifications?.length === 0 && (
          <Box p={4} m={2} borderWidth="1px" borderRadius="lg" boxShadow="sm">
            <Text>No notifications</Text>
          </Box>
        )}
      </MenuList>
    </Menu>
  );
}

export default NotificationIcon;
