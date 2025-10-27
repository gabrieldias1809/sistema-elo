import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";

interface DateTimePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const DateTimePicker = ({ value, onChange, placeholder = "Selecione data e hora" }: DateTimePickerProps) => {
  const [open, setOpen] = useState(false);
  
  const date = value ? new Date(value) : undefined;
  const timeValue = value ? format(new Date(value), "HH:mm") : "";

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      const currentTime = timeValue || "00:00";
      const [hours, minutes] = currentTime.split(":");
      selectedDate.setHours(parseInt(hours), parseInt(minutes));
      onChange(selectedDate.toISOString());
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = e.target.value;
    if (date) {
      const [hours, minutes] = time.split(":");
      const newDate = new Date(date);
      newDate.setHours(parseInt(hours), parseInt(minutes));
      onChange(newDate.toISOString());
    } else {
      const today = new Date();
      const [hours, minutes] = time.split(":");
      today.setHours(parseInt(hours), parseInt(minutes));
      onChange(today.toISOString());
    }
  };

  const handleClear = () => {
    onChange("");
  };

  return (
    <div className="flex gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "flex-1 justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "dd/MM/yyyy") : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(selectedDate) => {
              handleDateSelect(selectedDate);
              setOpen(false);
            }}
            initialFocus
            className="pointer-events-auto"
          />
        </PopoverContent>
      </Popover>
      <div className="relative flex-1">
        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white pointer-events-none z-10" />
        <Input
          type="time"
          value={timeValue}
          onChange={handleTimeChange}
          className="pl-10"
        />
      </div>
      {date && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClear}
          type="button"
        >
          <i className="ri-close-line"></i>
        </Button>
      )}
    </div>
  );
};
