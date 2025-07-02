/* eslint-disable react/prop-types */
import {
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
import { UPDATE } from "../../Controllers/ApiControllers";
import admin from "../../Controllers/admin";
import ShowToast from "../../Controllers/ShowToast";

export default function UpdateDepartmentModel({ isOpen, onClose, data }) {
  const [isLoading, setisLoading] = useState();
  const { register, handleSubmit, reset } = useForm();
  const queryClient = useQueryClient();
  const toast = useToast();

  const AddNewDepartment = async (inputData) => {
    let formData = { ...inputData, title: inputData.title.toUpperCase(), id: data.id };

    try {
      setisLoading(true);
      const res = await UPDATE(admin.token, "update_coupon", formData);
      setisLoading(false);
      if (res.response === 200) {
        ShowToast(toast, "success", "Coupon Updated!");
        queryClient.invalidateQueries("coupons");
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
      <ModalContent as={"form"} onSubmit={handleSubmit(AddNewDepartment)}>
        <ModalHeader fontSize={18} py={2}>
          Update Coupon
        </ModalHeader>
        <ModalCloseButton />
        <Divider />
        <ModalBody>
          <Box pb={3}>
            <FormControl isRequired>
              <FormLabel>Title</FormLabel>
              <Input
                defaultValue={data.title}
                textTransform={"uppercase"}
                placeholder="Title"
                {...register("title", { required: true })}
              />
            </FormControl>
            <FormControl isRequired mt={5}>
              <FormLabel>Value ( Off in %)</FormLabel>
              <Input
                defaultValue={data.value}
                type="number"
                placeholder="Value"
                max={100}
                {...register("value", { required: true })}
              />
            </FormControl>
            <FormControl isRequired mt={5}>
              <FormLabel>Description</FormLabel>
              <Input
                defaultValue={data.description}
                placeholder="Description"
                {...register("description", { required: true })}
              />
            </FormControl>
            <Flex mt={5} gap={5}>
              {" "}
              <FormControl isRequired>
                <FormLabel>Start Date</FormLabel>
                <Input
                  defaultValue={data.start_date}
                  type="date"
                  placeholder="Start Date"
                  {...register("start_date", { required: true })}
                />
              </FormControl>{" "}
              <FormControl isRequired>
                <FormLabel>End Date</FormLabel>
                <Input
                  defaultValue={data.end_date}
                  type="date"
                  placeholder="End Date"
                  {...register("end_date", { required: true })}
                />
              </FormControl>
            </Flex>
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
            Update Coupon
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
