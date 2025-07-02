/* eslint-disable react/prop-types */
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useColorMode } from "@chakra-ui/react";
import { useState, useEffect } from "react";

export function MedicineAutocomplete({
  data: items,
  handleChange,
  name,
  defaultId,
  defaultName,
  mainIndex,
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(""); // To store the selected or custom input value
  const { colorMode } = useColorMode();

  // Set default value based on ID or name
  useEffect(() => {
    if (defaultId) {
      const selectedItem = items?.find((item) => item.id === defaultId);
      if (selectedItem) {
        setValue(selectedItem.title); // Set value to the selected item title
      }
    } else if (defaultName) {
      const selectedItem = items?.find(
        (item) => item.title.toLowerCase() === defaultName.toLowerCase()
      );
      if (selectedItem) {
        setValue(selectedItem.title); // Set value to the selected item title
      } else {
        setValue(defaultName);
      }
    }
  }, [defaultId, defaultName, items]);

  // Handle input change for custom text
  const handleInputChange = (e) => {
    const value = e.target.value;
    if (value === "" || value === null || value === undefined) {
      setValue();
    } else {
      setValue(value);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={`w-[100%] h-10 justify-between bg-transparent hover:bg-transparent hover:text-inherit rounded-[6px] capitalize ${
            colorMode === "dark" ? "border-[#ffffff3d]" : "border-[#E2e8f0]"
          }`}
        >
          {value ? value : `Select ${name}`}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 " />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={`w-[200px] p-0 max-h-[240px] overflow-y-scroll hideScrollbar ${
          colorMode === "dark" ? "bg-[#2D3748]" : "bg-[#ffffff]"
        }`}
      >
        <Command
          className={`${
            colorMode === "dark" ? "bg-[#2D3748]" : "bg-[#ffffff]"
          }`}
        >
          <CommandInput
            placeholder={`Search ${name}`}
            // Bind the input value to state
            onChange={handleInputChange} // Handle custom text input
            colorMode={colorMode}
            className={colorMode === "dark" ? "text-[#fff]" : "text-[#000]"}
          />
          <CommandEmpty>No {name} found.</CommandEmpty>
          <CommandGroup>
            {value ? (
              <CommandItem
                key={value}
                value={value.toString()}
                onSelect={(currentValue) => {
                  setValue(currentValue); // Set value to the selected item
                  setOpen(false); // Close the popover
                  handleChange(mainIndex, "medicine_name", value); // Pass the selected value to handleChange
                  handleChange(mainIndex, "notes", ""); // Pass the notes (if any)
                }}
                className="dark:text-white capitalize"
              >
                <Check
                  className={`mr-2 h-4 w-4 ${
                    value.toLowerCase() === value.toLowerCase()
                      ? "opacity-100"
                      : "opacity-0"
                  }`}
                />
                {value}
              </CommandItem>
            ) : null}
            {items?.map((item) => (
              <CommandItem
                key={item.id}
                value={item.title.toString()}
                onSelect={(currentValue) => {
                  setValue(currentValue); // Set value to the selected item
                  setOpen(false); // Close the popover
                  handleChange(mainIndex, "medicine_name", item.title); // Pass the selected value to handleChange
                  handleChange(mainIndex, "notes", item.notes); // Pass the notes (if any)
                }}
                className="dark:text-white capitalize"
              >
                <Check
                  className={`mr-2 h-4 w-4 ${
                    value?.toLowerCase() === item?.title.toLowerCase()
                      ? "opacity-100"
                      : "opacity-0"
                  }`}
                />
                {item?.title}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
