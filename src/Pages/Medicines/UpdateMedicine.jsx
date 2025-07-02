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
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { UPDATE } from "../../Controllers/ApiControllers";
import admin from "../../Controllers/admin";
import showToast from "../../Controllers/ShowToast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const UpdateMed = async (data) => {
  const res = await UPDATE(admin.token, "update_prescribe_medicines", data);
  if (res.response !== 200) {
    throw new Error(res.message);
  }
  return res;
};
export default function UpdateMedicine({ isOpen, onClose, data }) {
  const { register, handleSubmit } = useForm();
  const toast = useToast();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (data) => {
      await UpdateMed(data);
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

  const onSubmit = (formData) => {
    mutation.mutate({ ...formData, id: data.id });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent as={"form"} onSubmit={handleSubmit(onSubmit)}>
        <ModalHeader fontSize={"md"}>Update Medicine</ModalHeader>
        <ModalCloseButton top={3} />
        <Divider />
        <ModalBody>
          <FormControl isRequired>
            <FormLabel fontSize={"sm"}>Name</FormLabel>
            <Input
              size={"md"}
              name="comment"
              {...register("title", { required: true })}
              defaultValue={data.title}
            />
          </FormControl>{" "}
          <FormControl mt={3}>
            <FormLabel fontSize={"sm"}>Notes</FormLabel>
            <Textarea
              size={"md"}
              name="comment"
              {...register("notes")}
              defaultValue={data.notes}
            />
          </FormControl>{" "}
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
            Update
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
