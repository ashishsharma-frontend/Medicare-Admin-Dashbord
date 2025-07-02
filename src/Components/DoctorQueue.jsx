import React, { useState } from "react";
import { Box, Checkbox, Text, Input, useToast, VStack } from "@chakra-ui/react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { GET, UPDATE } from "../Controllers/ApiControllers";
import admin from "../Controllers/admin";
import Loading from "./Loading"; 


const DoctorQueue = ({ doctorID }) => {
  const [priority, setPriority] = useState([]);
  const toast = useToast();
  const toastError = (message) => {
    toast({
      title: message,
      status: "error",
      duration: 9000,
      isClosable: true,
      position: "top",
    });
  };

  const { isLoading: isAtpriorityLoading, data: atPriority } = useQuery({
    queryKey: ["doct_id", doctorID],
    queryFn: async () => {
      const res = await GET(admin.token, `get_queue_data/${doctorID}`);
      setPriority(res.data);
      return res.data;
    },
    onError: (error) => {
      console.error("Error fetching data:", error);
    }
  });

  const UpdateQueue = async (data) => {
    try {
      const res = await UPDATE(admin.token, `update_queue/${doctorID}`, data);
      if (res.response !== 200) {
        throw new Error(res.message);
      }
      return res;
    } catch (error) {
      throw new Error(`Failed to update queue: ${error.message || error}`);
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const reorderedPriority = Array.from(priority);
    const [movedItem] = reorderedPriority.splice(result.source.index, 1);
    reorderedPriority.splice(result.destination.index, 0, movedItem);

    setPriority(reorderedPriority);

    const postData = {
      doct_id: doctorID,
      type: movedItem.type,
      no: movedItem.no,
      seq: result.destination.index + 1,
      old_seq: result.source.index + 1,
    };
    await UpdateQueue(postData);
  };

  const handleChange = async (event, row) => {
    const updatedValue = event.target.value;
    const prevValue = row.no;

    if (isNaN(updatedValue) || updatedValue < 1 || updatedValue > 5) {
      toastError(`Please enter a number between 1 and 5. You entered  ${updatedValue}, and the current value is ${prevValue}`)
      setPriority((prevPriority) =>
        prevPriority.map((item) =>
          item.seq === row.seq ? { ...item, no: prevValue } : item
        )
      );
      return;
    }
    const postData = {
      doct_id: doctorID,
      type: row.type,
      no: updatedValue,
      seq: row.seq,
      old_seq: row.seq,
    };
    try {
      await UpdateQueue(postData);
    } catch (error) {
      console.error(`Failed to update queue: ${error.message || error}`);
    }
    setPriority((prevPriority) =>
      prevPriority.map((item) =>
        item.seq === row.seq ? { ...item, no: updatedValue } : item
      )
    );
  };
 
  if (isAtpriorityLoading) return <Loading />;

  return (
    <Box p={4} borderWidth="1px" borderRadius="md" textAlign="center">
      <Text fontSize="xl" fontWeight="bold" mb={3}>
        Manage Appointment Priority (Drag & Drop)
      </Text>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="priorityList">
          {(provided) => (
            <VStack
              spacing={3}
              align="start"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {priority.map((item, index) => (
                <Draggable draggableId={item.seq.toString()} key={item.seq} index={index} className="w-[200px]">
                  {(provided) => (
                    <Box
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="flex"
                    >
                      <Text
                        p={2}
                        align="left"
                        border="1px solid #ccc"
                        borderRadius="md"
                        background="gray.100"
                        cursor="grab"
                        width={300}
                      >
                        {index + 1}. {item.type}
                      </Text>
                      <Box className="ps-3 w-[75px]" >
                        <Input
                          size={"sm"}
                          borderRadius={6}
                          placeholder="no of appointments"
                          value={item.no}
                          onChange={(e) => handleChange(e, item)}
                          className="p-5 text-center"
                        />
                      </Box>
                    </Box>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </VStack>
          )}
        </Droppable>
      </DragDropContext>
    </Box>
  );
};

export default DoctorQueue;
