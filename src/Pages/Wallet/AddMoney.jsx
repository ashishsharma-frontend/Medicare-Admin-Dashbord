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
  Text,
  Select,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { ADD } from "../../Controllers/ApiControllers";
import admin from "../../Controllers/admin";
import showToast from "../../Controllers/ShowToast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useHasPermission from "../../Hooks/HasPermission";
import NotAuth from "../../Components/NotAuth";

const addMoney = async (data) => {
  const res = await ADD(admin.token, "add_wallet_money", data);
  if (res.response !== 200) {
    throw new Error(res.message);
  }
  return res;
};

export default function AddMony({ isOpen, onClose, userID }) {
  const { hasPermission } = useHasPermission();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const toast = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data) => {
      await addMoney(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries("Wallet", userID);
      showToast(toast, "success", "Success!");
      onClose(); // Optionally close the modal on success
    },
    onError: (error) => {
      showToast(toast, "error", error.message);
    },
  });

  const onSubmit = (data) => {
    let formData = {
      user_id: userID,
      amount: data.amount,
      payment_transaction_id: "admin_wallet_recharge",
      payment_method: data.payment_method,
      transaction_type: "Credited",
      description: data.description || "Amount Credited to user wallet",
    };
    mutation.mutate(formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent as={"form"} onSubmit={handleSubmit(onSubmit)}>
        <ModalHeader fontSize={"md"}>
          Recharge Wallet for User ID #{userID}
        </ModalHeader>
        <ModalCloseButton top={3} />
        <Divider />
        <ModalBody>
          <Box>
            {hasPermission("WALLET_ADD") ? (
              <>
                {" "}
                <FormControl isRequired>
                  <FormLabel fontSize="sm">Amount</FormLabel>
                  <Input
                    size="md"
                    name="amount"
                    type="number"
                    {...register("amount", {
                      required: "Amount is required",
                      valueAsNumber: true,
                      min: { value: 1, message: "Amount must be at least 1" },
                    })}
                    placeholder="Enter amount"
                  />
                  {errors.amount && (
                    <Text color="red.500">{errors.amount.message}</Text>
                  )}
                </FormControl>
                <FormControl isRequired mt={3}>
                  <FormLabel fontSize="sm">Payment Method</FormLabel>
                  <Select
                    size="md"
                    name="payment_method"
                    {...register("payment_method", {
                      required: "Payment method is required",
                    })}
                    placeholder="Select payment method"
                  >
                    <option value="Online">Online</option>
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                    <option value="UPI">UPI</option>
                  </Select>
                  {errors.payment_method && (
                    <Text color="red.500">{errors.payment_method.message}</Text>
                  )}
                </FormControl>
                <FormControl mt={3}>
                  <FormLabel fontSize="sm">Description</FormLabel>
                  <Textarea
                    size="md"
                    name="description"
                    {...register("description")}
                    placeholder="Enter description (e.g., Amount credited to user wallet)"
                  />
                </FormControl>
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
