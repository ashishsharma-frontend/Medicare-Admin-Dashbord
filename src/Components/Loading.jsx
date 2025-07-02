import { Center, Spinner, useColorMode } from "@chakra-ui/react";

const Loading = () => {
  const { colorMode } = useColorMode();

  return (
    <Center
      position="fixed"
      top="0"
      left="0"
      width="100vw"
      height="100vh"
      bg={colorMode === "dark" ? "rgba(0, 0, 0, 0.8)" : "rgba(255, 255, 255, 0.8)"}
      zIndex="9999"
    >
      <Spinner size="xl" thickness="4px" speed="0.65s" color={colorMode === "dark" ? "teal.300" : "teal.500"} />
    </Center>
  );
};

export default Loading;
