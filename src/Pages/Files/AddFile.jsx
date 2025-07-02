import { AiOutlineUpload } from "react-icons/ai";
/* eslint-disable react/prop-types */
import {
  Box,
  Button,
  Center,
  CloseButton,
  Divider,
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
  Text,
  VisuallyHidden,
  useToast,
} from "@chakra-ui/react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { ADD } from "../../Controllers/ApiControllers";
import ShowToast from "../../Controllers/ShowToast";
import admin from "../../Controllers/admin";
import usePatientData from "../../Hooks/UsePatientsData";
import UsersCombobox from "../../Components/UsersComboBox";

export default function AddPatientsFiles({ isOpen, onClose }) {
  const [isLoading, setisLoading] = useState();
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef();
  const { register, handleSubmit, reset } = useForm();
  const queryClient = useQueryClient();
  const toast = useToast();
  const MAX_FILE_SIZE = 5 * 1024 * 1024;
  const { patientsData } = usePatientData();
  const [patient, setpatient] = useState();

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.size > MAX_FILE_SIZE) {
      ShowToast(toast, "error", "Please select a file smaller than 5 MB.");
    } else {
      setSelectedFile(file);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.size > MAX_FILE_SIZE) {
      ShowToast(toast, "error", "Please select a file smaller than 5 MB.");
    } else {
      setSelectedFile(file);
    }
  };

  const AddNewFile = async (data) => {
    if (!patient) {
      return ShowToast(toast, "error", "Please Select Patient");
    }
    if (!selectedFile) {
      return ShowToast(toast, "error", "Please Select File");
    }

    let formData = {
      ...data,
      patient_id: patient.id,
      file: selectedFile,
    };
    try {
      setisLoading(true);
      const res = await ADD(admin.token, "add_patient_file", formData);
      setisLoading(false);
      if (res.response === 200) {
        ShowToast(toast, "success", "File Added!");
        queryClient.invalidateQueries(["patient-files", patient.id]);
        queryClient.invalidateQueries(["all-files"]);
        setSelectedFile(null);
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
    <Modal isOpen={isOpen} onClose={onClose} isCentered size={"lg"}>
      <ModalOverlay />
      <ModalContent as={"form"} onSubmit={handleSubmit(AddNewFile)}>
        <ModalHeader fontSize={18} py={2}>
          Add Patient Files
        </ModalHeader>
        <ModalCloseButton />
        <Divider />
        <ModalBody>
          <Box pb={3}>
            <FormControl isRequired>
              <FormLabel>Patient</FormLabel>
              <UsersCombobox
                data={patientsData}
                name={"Patient"}
                setState={setpatient}
                addNew={false}
              />
            </FormControl>
            <FormControl isRequired mt={5}>
              <FormLabel>File Name</FormLabel>
              <Input
                placeholder="Name"
                {...register("file_name", { required: true })}
              />
            </FormControl>

            <Box
              mt={5}
              p={4}
              border="2px dashed"
              borderColor="gray.300"
              borderRadius="md"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.click();
                }
              }}
              cursor={"pointer"}
            >
              {selectedFile ? (
                <Box position={"relative"}>
                  <Text>Selected File: {selectedFile.name}</Text>
                  <CloseButton
                    position={"absolute"}
                    right={-2}
                    top={-2}
                    size={"sm"}
                    onClick={() => {
                      setSelectedFile(null);
                    }}
                  />
                </Box>
              ) : (
                <Box>
                  <VisuallyHidden>
                    {" "}
                    <Input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileChange}
                      accept="*"
                      mb={4}
                    />
                  </VisuallyHidden>

                  <Center>
                    {" "}
                    <AiOutlineUpload fontSize={32} />
                  </Center>
                  <Text textAlign={"center"} mt={3}>
                    <b>Choose a file</b> or Drag it here.
                    <br />
                    Max 5 MB
                  </Text>
                </Box>
              )}
            </Box>
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
            Add File
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
