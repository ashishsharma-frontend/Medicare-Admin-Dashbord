import { useToast } from "@chakra-ui/react";

export default function ShowChakraToast({ status, message }) {
  const toast = useToast();

  toast({
    title: message,
    status: status,
    duration: 3000, // Toast display duration in milliseconds
    isClosable: true,
    position: "top",
  });
}
