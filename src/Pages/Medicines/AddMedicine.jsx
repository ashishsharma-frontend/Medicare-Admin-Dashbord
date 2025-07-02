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
  FormControl,
  FormLabel,
  Input,
  Textarea,
  useToast,
  Box,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { ADD } from "../../Controllers/ApiControllers";
import admin from "../../Controllers/admin";
import showToast from "../../Controllers/ShowToast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useHasPermission from "../../Hooks/HasPermission";
import NotAuth from "../../Components/NotAuth";

const addPrescribeMedicines = async (data) => {
  const res = await ADD(admin.token, "add_prescribe_medicines", data);
  if (res.response !== 200) {
    throw new Error(res.message);
  }
  return res;
};

export default function AddMedicine({ isOpen, onClose }) {
  const { hasPermission } = useHasPermission();
  const { register, handleSubmit } = useForm();
  const toast = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data) => {
      await addPrescribeMedicines(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries("medicines");
      showToast(toast, "success", "Medicine Added!");
      onClose(); // Optionally close the modal on success
    },
    onError: (error) => {
      showToast(toast, "error", error.message);
    },
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent as={"form"} onSubmit={handleSubmit(onSubmit)}>
        <ModalHeader fontSize={"md"}>Add New Medicine</ModalHeader>
        <ModalCloseButton top={3} />
        <Divider />
        <ModalBody>
          <Box>
            {hasPermission("MEDICINE_ADD") ? (
              <>
                {" "}
                <FormControl isRequired>
                  <FormLabel fontSize={"sm"}>Name</FormLabel>
                  <Input
                    size={"md"}
                    name="comment"
                    {...register("title", { required: true })}
                  />
                </FormControl>{" "}
                <FormControl mt={3}>
                  <FormLabel fontSize={"sm"}>Notes</FormLabel>
                  <Textarea size={"md"} name="comment" {...register("notes")} />
                </FormControl>{" "}
              </>
            ) : (
              <NotAuth />
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
            w={32}
            type="submit"
            isLoading={mutation.isPending}
          >
            Add
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
