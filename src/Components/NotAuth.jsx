import { Box, Flex, Heading, Text, Icon } from "@chakra-ui/react";
import { MessageCircleWarningIcon } from "lucide-react";

function NotAuth() {
  return (
    <Flex direction="column" align="center" justify="center" minH="100%" p={4}>
      <Box p={8} rounded="lg" shadow="lg" textAlign="center">
        <Flex justify="center" mb={4}>
          <Icon as={MessageCircleWarningIcon} boxSize={10} color="red.500" />
        </Flex>
        <Heading as="h1" size="lg" mb={4} color="red.600">
          You are not authorized
        </Heading>
        <Text fontSize="md" mb={6}>
          You tried to access a page you do not have permission to view.
          <br />
          Please contact your administrator if you believe this is a mistake.
        </Text>
      </Box>
    </Flex>
  );
}
export default NotAuth;
