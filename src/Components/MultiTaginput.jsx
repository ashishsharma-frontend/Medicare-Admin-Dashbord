/* eslint-disable react/prop-types */ import { Button } from "@/components/ui/button";
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
import { Check } from "lucide-react";
import { useEffect, useState } from "react";

export function MultiTagInput({
  data: items,
  setState,
  name,
  defaultSelected,
}) {
  const [open, setOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const { colorMode } = useColorMode();

  // Set default selected items when component mounts
  useEffect(() => {
    if (Array.isArray(defaultSelected) && defaultSelected.length > 0) {
      const defaultItems =
        items?.filter((obj) => {
          for (const title of defaultSelected || []) {
            // Provide default value as empty array
            if (obj.title === title) {
              return true;
            }
          }
          return false;
        }) || [];
      setSelectedItems(defaultItems);
      setState(defaultItems.map((item) => item.title));
    }
  }, []); // Empty dependency array ensures this effect runs only once on mount

  const handleSelectItem = (item) => {
    const isItemSelected = selectedItems.some(
      (selectedItem) => selectedItem.id === item.id
    );

    let newSelectedItems;
    if (isItemSelected) {
      newSelectedItems = selectedItems.filter(
        (selectedItem) => selectedItem.id !== item.id
      );
    } else {
      newSelectedItems = [...selectedItems, item];
    }
    setSelectedItems(newSelectedItems);
    setState(newSelectedItems.map((item) => item.title));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={`w-[100%] h-8 justify-start bg-transparent hover:bg-transparent hover:text-inherit rounded-[6px] ${
            colorMode === "dark" ? "border-[#ffffff3d]" : "border-[#E2e8f0]"
          }`}
        >
          {selectedItems.length > 0
            ? selectedItems.map((item) => (
                <span key={item.id}>{item.title}, </span>
              ))
            : `Select ${name}`}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={`w-[200px] p-0 max-h-[240px]  overflow-y-scroll hideScrollbar ${
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
                onSelect={() => handleSelectItem(item)}
                className="dark:text-white"
              >
                <Check
                  className={`mr-2 h-4 w-4 ${
                    selectedItems.some(
                      (selectedItem) => selectedItem.id === item.id
                    )
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
