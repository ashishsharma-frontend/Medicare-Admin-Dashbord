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

export function ComboboxDemo({
  data: items,
  setState,
  name,
  defaultId,
  defaultName,
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const { colorMode } = useColorMode();

  // Set default value based on ID or name
  useEffect(() => {
    if (defaultId) {
      const selectedItem = items?.find((item) => item.id === defaultId);
      if (selectedItem) {
        setValue(selectedItem.title);
      }
    } else if (defaultName) {
      const selectedItem = items.find((item) => item.title === defaultName);
      if (selectedItem) {
        setValue(selectedItem.title);
      }
    }
  }, [defaultId, defaultName, items]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={`w-[100%] h-8 justify-between bg-transparent hover:bg-transparent hover:text-inherit rounded-[6px] capitalize ${
            colorMode === "dark" ? "border-[#ffffff3d]" : "border-[#E2e8f0]"
          }`}
        >
          {value ? value : `Select ${name}`}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 " />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={`w-[200px] p-0 max-h-[240px]  overflow-y-scroll hideScrollbar z-[1500] ${
          colorMode === "dark" ? "bg-[#2D3748]" : "bg-[#ffffff]"
        }`}
      >
        <Command
          className={`${
            colorMode === "dark" ? "bg-[#2D3748]" : "bg-[#ffffff]"
          }  `}
        >
          <CommandInput
            placeholder={`Search ${name}`}
            colorMode={colorMode}
            className={colorMode === "dark" ? "text-[#fff]" : "text-[#000]"}
          />
          <CommandEmpty>No {name} found.</CommandEmpty>
          <CommandGroup>
            {items?.map((item) => (
              <CommandItem
                key={item.id}
                value={item.title.toString()}
                onSelect={(currentValue) => {
                  setValue(currentValue);
                  setOpen(false);
                  setState(item.id);
                }}
                className="dark:text-white capitalize"
              >
                <Check
                  className={`mr-2 h-4 w-4 ${
                    value === item.title.toString()
                      ? "opacity-100"
                      : "opacity-0"
                  }`}
                />
                {item.title}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
