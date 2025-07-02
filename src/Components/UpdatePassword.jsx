import { AiFillEye } from "react-icons/ai";
import { AiFillEyeInvisible } from "react-icons/ai";

/* eslint-disable react/prop-types */
import { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Input,
  InputGroup,
  InputRightElement,
  FormControl,
  FormLabel,
  useToast,
  Flex,
  Link,
  useDisclosure,
} from "@chakra-ui/react";
import { ADD } from "../Controllers/ApiControllers";
import admin from "../Controllers/admin";
import { useMutation } from "@tanstack/react-query";
import ShowToast from "../Controllers/ShowToast";
import ForgetPassword from "./ForgetPassword";

const CheckOldPass = async (password) => {
  let data = { email: admin.email, password: password };
  const res = await ADD(admin.token, "login", data);
  return res.status;
};

const updatePassword = async (password) => {
  let data = { user_id: admin.id, password: password };
  const res = await ADD(admin.token, "update_password", data);
  if (res.response !== 200) {
    throw new Error(res.message);
  }
  return res;
};

export default function UpdateAdminPassword({ isOpen, onClose }) {
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const toast = useToast();

  const {
    isOpen: isPsswordOpen,
    onOpen: onPasswordOpen,
    onClose: onPasswordClose,
  } = useDisclosure();

  const handlePasswordVisibility = (setter) => {
    setter((show) => !show);
  };

  const checkMissingValues = () => {
    if (!oldPassword) return "Old Password";
    if (!newPassword) return "New Password";
    if (!confirmPassword) return "Confirm Password";
    if (confirmPassword !== newPassword) return "Password Does not match!";
    return null; // All values are present
  };

  const mutation = useMutation({
    mutationFn: async () => {
      const missingField = checkMissingValues();
      if (missingField) {
        throw new Error(`Please Enter ${missingField}`);
      }
      const isOldPassValid = await CheckOldPass(oldPassword);
      if (
        isOldPassValid === false ||
        !isOldPassValid ||
        isOldPassValid !== true
      ) {
        throw new Error(`Incorrect Old password`);
      }
      await updatePassword(newPassword);
    },
    onError: (error) => {
      ShowToast(toast, "error", error.message);
    },
    onSuccess: () => {
      setNewPassword();
      setOldPassword();
      setConfirmPassword();
      ShowToast(toast, "success", "Success");
      onClose();
    },
  });

  return (
    <>
      {" "}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Update Password</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={4}>
              <Flex alignItems={"start"} justifyContent={"space-between"}>
                {" "}
                <FormLabel>Old Password</FormLabel>
                <Link
                  fontSize={12}
                  color={"blue.500"}
                  onClick={onPasswordOpen}
                  textDecor={"underline"}
                >
                  Forget password?
                </Link>
              </Flex>
              <InputGroup>
                <Input
                  type={showOldPassword ? "text" : "password"}
                  placeholder="Enter Old password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                />
                <InputRightElement width="4.5rem">
                  <Button
                    h="1.75rem"
                    size="sm"
                    onClick={() => handlePasswordVisibility(setShowOldPassword)}
                  >
                    {showOldPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
                  </Button>
                </InputRightElement>
              </InputGroup>
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>New Password</FormLabel>
              <InputGroup>
                <Input
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <InputRightElement width="4.5rem">
                  <Button
                    h="1.75rem"
                    size="sm"
                    onClick={() => handlePasswordVisibility(setShowNewPassword)}
                  >
                    {showNewPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
                  </Button>
                </InputRightElement>
              </InputGroup>
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>Confirm New Password</FormLabel>
              <Input
                type="text"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
            <Button
              colorScheme="blue"
              mr={3}
              onClick={mutation.mutate}
              isLoading={mutation.isPending}
            >
              Update Password
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <ForgetPassword isOpen={isPsswordOpen} onClose={onPasswordClose} />
    </>
  );
}
