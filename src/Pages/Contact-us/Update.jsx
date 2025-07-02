/* eslint-disable react/prop-types */
import {
  Box,
  Button, Divider, Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text
} from "@chakra-ui/react";
import moment from "moment";

export default function UpdateDepartmentModel({ isOpen, onClose, data }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isCentered
      size={"lg"}
      scrollBehavior="inside"
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontSize={18} py={2}>
          Contact Us - {data?.name}
        </ModalHeader>
        <ModalCloseButton />
        <Divider />
        <ModalBody>
          <Box pb={3}>
            <Text fontSize="lg" fontWeight="bold">
              Contact Inquiry
            </Text>
            <Text>
              <strong>Name:</strong> {data?.name}
            </Text>
            <Text>
              <strong>Email:</strong> {data?.email}
            </Text>
            <Text>
              <strong>Subject:</strong> {data?.subject}
            </Text>
            <Text>
              <strong>Message:</strong> {data?.message}
            </Text>
            <Text mt={2} fontSize="sm" color="gray.500">
              <strong>Created At:</strong> {moment(data?.created_at).format("DD MMM YY HH:MM A")}
            </Text>
            
          </Box>
        </ModalBody>
        <Divider />
        <ModalFooter py={3}>
          <Button colorScheme="gray" mr={3} onClick={onClose} size={"sm"}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
