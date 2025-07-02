import { AiOutlineUpload } from "react-icons/ai";
/* eslint-disable react/prop-types */
import {
  Box,
  Button,
  Center,
  CloseButton,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Image,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  Textarea,
  VisuallyHidden,
  useToast,
} from "@chakra-ui/react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { DELETE, UPDATE } from "../../../Controllers/ApiControllers";
import admin from "../../../Controllers/admin";
import ShowToast from "../../../Controllers/ShowToast";
import imageBaseURL from "../../../Controllers/image";
import r from "../../../Controllers/configs";

export default function UpdateConfigs({ isOpen, onClose, data }) {
  const [isLoading, setisLoading] = useState();
  const [isDeleteLoading, setisDeleteLoading] = useState();
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef();
  const { register, handleSubmit, reset } = useForm();
  const queryClient = useQueryClient();
  const toast = useToast();

  const handleDrop = (event) => {
    event.preventDefault();

    const file = event.dataTransfer.files[0];
    setSelectedFile(file);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
  };

  const handleUpdate = async (Inputdata) => {
    let formData = selectedFile
      ? {
          value: selectedFile,
          id: data.id,
        }
      : {
          ...Inputdata,
          id: data.id,
        };

    try {
      setisLoading(true);
      await r();
      const res = await UPDATE(admin.token, "update_configurations", formData);
      setisLoading(false);
      if (res.response === 200) {
        ShowToast(toast, "success", "Updated!");
        queryClient.invalidateQueries("group-configs", data?.group_name);
        reset();
        setSelectedFile(null);
        onClose();
      } else {
        ShowToast(toast, "error", res.message);
      }
    } catch (error) {
      setisLoading(false);
      ShowToast(toast, "error", JSON.stringify(error));
    }
  };

  //   deleteImage
  const DeleteImage = async () => {
    let formData = {
      id: data.id,
    };
    try {
      setisDeleteLoading(true);
      const res = await DELETE(
        admin.token,
        "remove_configurations_image",
        formData
      );
      setisDeleteLoading(false);
      if (res.response === 200) {
        ShowToast(toast, "success", "Image deleted!");
        queryClient.invalidateQueries("group-configs", data?.group_name);
        reset();
        setSelectedFile(null);
        onClose();
      } else {
        ShowToast(toast, "error", res.message);
      }
    } catch (error) {
      setisDeleteLoading(false);
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
      <ModalContent as={"form"} onSubmit={handleSubmit(handleUpdate)}>
        <ModalHeader fontSize={18} py={2}>
          Update {data.group_name}
        </ModalHeader>
        <ModalCloseButton />
        <Divider />
        <ModalBody>
          <Box pb={3}>
            <FormControl>
              <FormLabel>Title</FormLabel>
              <Input
                defaultValue={data?.title}
                placeholder="Title"
                {...register("title")}
                isReadOnly
              />
            </FormControl>

            {data?.id_name === "fav_icon" ||
            data?.id_name === "logo" ||
            data?.id_name === "ma_doctor_image" ||
            data?.id_name === "web_doctor_image" ? (
              data.value !== null ? (
                <Flex mt={5} align={"center"} gap={5}>
                  <Image
                    src={`${imageBaseURL}/${data?.value}`}
                    width={100}
                    borderRadius={5}
                  />
                  <Button
                    size={"sm"}
                    colorScheme="red"
                    fontSize={12}
                    isLoading={isDeleteLoading}
                    onClick={DeleteImage}
                  >
                    Remove Image
                  </Button>
                </Flex>
              ) : (
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
                          accept=".jpeg, .svg, .png , .jpg"
                          mb={4}
                        />
                      </VisuallyHidden>

                      <Center>
                        {" "}
                        <AiOutlineUpload fontSize={32} />
                      </Center>
                      <Text textAlign={"center"} mt={3}>
                        <b>Choose a file</b> or Drag it here.
                      </Text>
                    </Box>
                  )}
                </Box>
              )
            ) : (
              <FormControl isRequired mt={5}>
                <FormLabel>Value</FormLabel>
                <Textarea
                  defaultValue={data?.value}
                  placeholder="URL"
                  {...register("value", { required: true })}
                />
              </FormControl>
            )}
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
            Update
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
