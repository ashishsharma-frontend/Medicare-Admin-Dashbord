import { BsFillClipboardPlusFill } from "react-icons/bs";
/* eslint-disable react-hooks/rules-of-hooks */
import { BsFillTrashFill } from "react-icons/bs";
import {
  Box,
  Button,
  Flex,
  Heading,
  useColorModeValue,
  FormControl,
  FormLabel,
  Input,
  CardBody,
  Card,
  Divider,
  Select,
  HStack,
  Textarea,
  IconButton,
  useToast,
  useDisclosure,
} from "@chakra-ui/react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ADD } from "../../Controllers/ApiControllers";
import admin from "../../Controllers/admin";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import useMedicineData from "../../Hooks/Medicines";
import { MedicineAutocomplete } from "../../Components/MedicineAutocomplete";
import Loading from "../../Components/Loading";
import { useForm } from "react-hook-form";
import ShowToast from "../../Controllers/ShowToast";
import AddMedicine from "../Medicines/AddMedicine";

const handleUpdate = async (data) => {
  const res = await ADD(admin.token, "add_prescription", data);
  if (res.response !== 200) {
    throw new Error(res.message);
  }
  return res;
};
function hasEmptyValue(arr) {
  return arr.some((item) =>
    Object.entries(item).some(
      ([key, value]) =>
        key !== "notes" &&
        (value === null || value === "" || value === undefined)
    )
  );
}

function AddPrescription() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { register, getValues } = useForm();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const appointment_id = searchParams.get("appointmentID");
  const patient_id = searchParams.get("patientID");
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const { medicinesData } = useMedicineData();

  const [medicines, setMedicines] = useState([
    {
      medicine_name: "",
      dosage: 1,
      duration: "For 3 days",
      time: "After Meal",
      dose_interval: "Once a Day",
      notes: "",
    },
  ]);
  const [medicine, setMedicine] = useState({
    medicine_name: "",
    dosage: 1,
    duration: "For 3 days",
    time: "After Meal",
    dose_interval: "Once a Day",
    notes: "",
  });

  const handleMedicineChange = (index, field, value) => {
    setMedicines((prevMedicines) => {
      // Update the specific medicine entry
      const updatedMedicines = prevMedicines.map((med, i) =>
        i === index ? { ...med, [field]: value } : med
      );
      return updatedMedicines;
    });
  };

  const handleAdd = () => {
    setMedicines([...medicines, medicine]);
    setMedicine({
      medicine_name: "",
      dosage: 1,
      duration: "For 3 days",
      time: "After Meal",
      dose_interval: "Once a Day",
      notes: "",
    });
  };
  const handleDelete = (indexToRemove) => {
    setMedicines((prevItems) =>
      prevItems.filter((_, index) => index !== indexToRemove)
    );
  };

  const mutation = useMutation({
    mutationFn: async () => {
      if (hasEmptyValue(medicines)) {
        throw new Error("Please fill all the fields in medicines");
      }
      const values = getValues();
      const formData = {
        ...values,
        appointment_id: appointment_id,
        patient_id: patient_id,
        medicines: medicines,
      };
      await handleUpdate(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["prescription", id]);
      queryClient.invalidateQueries(["prescriptios", appointment_id]);
      navigate(`/appointment/${appointment_id}`);
    },
    onError: (error) => {
      ShowToast(toast, "error", error.message);
    },
  });

  if (mutation.isPending) return <Loading />;

  return (
    <Box>
      <Flex justify={"space-between"} alignItems={"center"}>
        <Heading as={"h1"} size={"md"}>
          Add Prescription
        </Heading>
        <Button
          w={120}
          size={"sm"}
          variant={useColorModeValue("blackButton", "gray")}
          onClick={() => {
            navigate(-1);
          }}
        >
          Back
        </Button>
      </Flex>
      <Box>
        {" "}
        <Card mt={5} bg={useColorModeValue("white", "gray.700")}>
          <CardBody p={3} as={"form"}>
            <Flex justify={"space-between"}>
              {" "}
              <Heading as={"h3"} size={"sm"}>
                Medicines -
              </Heading>{" "}
              <Button size="sm" colorScheme={"blue"} onClick={onOpen}>
                New Medicine
              </Button>
            </Flex>

            <Divider mt={2} mb={5} />

            {medicines.map((med, index) => (
              <Box key={index}>
                {" "}
                <HStack spacing={4} w="full" mb={5} align={"flex-end"}>
                  <FormControl>
                    <FormLabel fontSize={"sm"} mb={0}>
                      Medicine
                    </FormLabel>
                    <MedicineAutocomplete
                      name={"Medicine"}
                      data={medicinesData}
                      defaultName={med.medicine_name}
                      handleChange={handleMedicineChange}
                      mainIndex={index}
                    />
                  </FormControl>
                  <FormControl w={"150px"}>
                    <FormLabel fontSize={"sm"} mb={0}>
                      Dosage
                    </FormLabel>
                    <Select
                      name="dosage"
                      value={med.dosage}
                      onChange={(e) =>
                        handleMedicineChange(index, "dosage", e.target.value)
                      }
                      size={"md"}
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize={"sm"} mb={0}>
                      Duration
                    </FormLabel>
                    <Select
                      name="duration"
                      value={med.duration}
                      onChange={(e) =>
                        handleMedicineChange(index, "duration", e.target.value)
                      }
                      size={"md"}
                    >
                      <option value="For 3 days">For 3 days</option>
                      <option value="For 5 days">For 5 days</option>
                      <option value="For 7 days">for 7 days</option>
                      <option value="For 105days">for 15 days</option>
                      <option value="For 1 Month">for 1 Month</option>
                    </Select>
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize={"sm"} mb={0}>
                      Time
                    </FormLabel>

                    <Select
                      size={"md"}
                      name="time"
                      value={med.time}
                      onChange={(e) =>
                        handleMedicineChange(index, "time", e.target.value)
                      }
                    >
                      <option value="After Meal">After Meal</option>
                      <option value="Before Meal">Before Meal</option>
                    </Select>
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize={"sm"} mb={0}>
                      Dose Interval
                    </FormLabel>
                    <Select
                      size={"md"}
                      name="dose_interval"
                      value={med.dose_interval}
                      onChange={(e) =>
                        handleMedicineChange(
                          index,
                          "dose_interval",
                          e.target.value
                        )
                      }
                    >
                      {" "}
                      <option value="Once a Day">Once a Day</option>
                      <option value="Every Morning & Evening">
                        Every Morning & Evening
                      </option>
                      <option value="3 Times a day">3 Times a day</option>
                      <option value="4 Times a day">4 Times a day</option>
                    </Select>
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize={"sm"} mb={0}>
                      Notes
                    </FormLabel>
                    <Input
                      size={"md"}
                      name="notes"
                      value={med.notes}
                      onChange={(e) =>
                        handleMedicineChange(index, "notes", e.target.value)
                      }
                    />
                  </FormControl>{" "}
                  <Flex mb={"2px"}>
                    {" "}
                    {medicines.length > 1 && (
                      <IconButton
                        size={"md"}
                        colorScheme={"red"}
                        icon={<BsFillTrashFill />}
                        onClick={() => {
                          handleDelete(index);
                        }}
                      />
                    )}
                  </Flex>
                </HStack>
              </Box>
            ))}
            <Button
              onClick={handleAdd}
              size={"sm"}
              colorScheme={"facebook"}
              rightIcon={<BsFillClipboardPlusFill />}
            >
              Insert New Medicine
            </Button>
          </CardBody>
        </Card>
        {/* tests and advise  */}
        <Card mt={5} bg={useColorModeValue("white", "gray.700")}>
          <CardBody p={3} as={"form"}>
            <Flex justify={"space-between"}>
              {" "}
              <Heading as={"h3"} size={"sm"}>
                Physical Information -
              </Heading>{" "}
            </Flex>
            <Divider mt={2} mb={5} />
            <Flex flexWrap={"wrap"} gap={5}>
              <FormControl mt={3} w={"300px"}>
                <FormLabel fontSize={"sm"}>Food Allergies</FormLabel>
                <Input size={"md"} {...register("food_allergies")} />
              </FormControl>
              <FormControl mt={3} w={"300px"}>
                <FormLabel fontSize={"sm"}>Tendency to Bleed</FormLabel>
                <Input size={"md"} {...register("tendency_bleed")} />
              </FormControl>
              <FormControl mt={3} w={"300px"}>
                <FormLabel fontSize={"sm"}>Heart Disease</FormLabel>
                <Input size={"md"} {...register("heart_disease")} />
              </FormControl>
              <FormControl mt={3} w={"300px"}>
                <FormLabel fontSize={"sm"}>Blood Pressure</FormLabel>
                <Input size={"md"} {...register("blood_pressure")} />
              </FormControl>
              <FormControl mt={3} w={"300px"}>
                <FormLabel fontSize={"sm"}>Diabetic</FormLabel>
                <Input size={"md"} {...register("diabetic")} />
              </FormControl>
              <FormControl mt={3} w={"300px"}>
                <FormLabel fontSize={"sm"}>Surgery</FormLabel>
                <Input size={"md"} {...register("surgery")} />
              </FormControl>
              <FormControl mt={3} w={"300px"}>
                <FormLabel fontSize={"sm"}>Accident</FormLabel>
                <Input size={"md"} {...register("accident")} />
              </FormControl>
              <FormControl mt={3} w={"300px"}>
                <FormLabel fontSize={"sm"}>Others</FormLabel>
                <Input size={"md"} {...register("others")} />
              </FormControl>
              <FormControl mt={3} w={"300px"}>
                <FormLabel fontSize={"sm"}>Medical History</FormLabel>
                <Input size={"md"} {...register("medical_history")} />
              </FormControl>
              <FormControl mt={3} w={"300px"}>
                <FormLabel fontSize={"sm"}>Current Medication</FormLabel>
                <Input size={"md"} {...register("current_medication")} />
              </FormControl>
              <FormControl mt={3} w={"300px"}>
                <FormLabel fontSize={"sm"}>Female Pregnancy</FormLabel>
                <Input size={"md"} {...register("female_pregnancy")} />
              </FormControl>
              <FormControl mt={3} w={"300px"}>
                <FormLabel fontSize={"sm"}>Breast Feeding</FormLabel>
                <Input size={"md"} {...register("breast_feeding")} />
              </FormControl>
              <FormControl mt={3} w={"300px"}>
                <FormLabel fontSize={"sm"}>Pulse Rate</FormLabel>
                <Input size={"md"} {...register("pulse_rate")} />
              </FormControl>
              <FormControl mt={3} w={"300px"}>
                <FormLabel fontSize={"sm"}>Temperature</FormLabel>
                <Input size={"md"} {...register("temperature")} />
              </FormControl>
            </Flex>
          </CardBody>
        </Card>
        <Card mt={5} bg={useColorModeValue("white", "gray.700")}>
          <CardBody p={3} as={"form"}>
            <Flex justify={"space-between"}>
              {" "}
              <Heading as={"h3"} size={"sm"}>
                Problem & Advice -
              </Heading>{" "}
            </Flex>
            <Divider mt={2} mb={5} />
            <FormControl>
              <FormLabel fontSize={"md"} mb={1}>
                Problem -
              </FormLabel>
              <Textarea height={100} {...register("problem_desc")} />
            </FormControl>
            <FormControl>
              <FormLabel fontSize={"md"} mb={1}>
                Tests -
              </FormLabel>
              <Textarea height={100} {...register("test")} />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel fontSize={"md"} mb={1}>
                Advice -
              </FormLabel>
              <Textarea height={100} {...register("advice")} />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel fontSize={"md"} mb={1}>
                Next Visit -
              </FormLabel>
              <Flex gap={5} alignItems={"center"}>
                After
                <Input
                  w={16}
                  type="number"
                  {...register("next_visit")}
                  min={1}
                  defaultValue={1}
                />
                Days
              </Flex>
            </FormControl>
          </CardBody>
        </Card>
        <Flex w={"100%"} justify={"end"} mt={5}>
          <Button
            w={96}
            colorScheme={"green"}
            size={"sm"}
            onClick={() => {
              mutation.mutate();
            }}
          >
            Save
          </Button>
        </Flex>
      </Box>

      <AddMedicine isOpen={isOpen} onClose={onClose} />
    </Box>
  );
}

export default AddPrescription;
