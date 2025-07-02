/* eslint-disable react/prop-types */
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  useToast,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import ShowToast from "../Controllers/ShowToast";
import admin from "../Controllers/admin";
import { ADD } from "../Controllers/ApiControllers";

const sentEmail = async (data) => {
  const res = await ADD("", "forget_password", data);
  if (res.response !== 200) {
    throw new Error(res.message);
  }
  return res;
};

const ForgetPassword = ({ isOpen, onClose }) => {
  const toast = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const mutation = useMutation({
    mutationFn: async (data) => {
      await sentEmail(data);
    },
    onError: (error) => {
      ShowToast(toast, "error", error.message);
    },
    onSuccess: () => {
      toast({
        title: "Email Sent",
        description: `Your password has been sent to your email address. Please check your email.`,
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      reset();
      onClose();
    },
  });

  // Submit Handler
  const onSubmit = async (data) => {
    mutation.mutate(data);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Forgot Password</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FormControl isInvalid={errors.email}>
              <FormLabel>Email your email address</FormLabel>
              <Input
                defaultValue={admin?.email || ""}
                type="email"
                placeholder="Enter your email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                    message: "Invalid email address",
                  },
                })}
                size={"sm"}
                borderRadius={2}
              />
              <FormErrorMessage>
                {errors.email && errors.email.message}
              </FormErrorMessage>
            </FormControl>
            <ModalFooter>
              <Button
                colorScheme="teal"
                type="submit"
                isLoading={mutation.isPending}
                size={"sm"}
              >
                Submit
              </Button>
              <Button
                ml={3}
                onClick={() => {
                  reset();
                  onClose();
                }}
                size={"sm"}
              >
                Cancel
              </Button>
            </ModalFooter>
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ForgetPassword;
