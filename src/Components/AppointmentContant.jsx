const AppointmentTypes = [
  "OPD-WALK-IN",
  "TELEPHONE-APPOINTMENTS",
  "EMERGENCY",
  "FAST-CONSULTATION",
  "FOLLOW-UP",
  "MEDICAL-REPRESENTATIVE",
  "VIDEO-CONSULTATION"
];

const ColorMapArray = {
  "EMERGENCY": "red",
  "OPD-WALK-IN": "green",
  "TELEPHONE-APPOINTMENTS": "orange",
  "FAST-CONSULTATION": "blue",
  "FOLLOW-UP": "purple",
  "MEDICAL-REPRESENTATIVE": "teal",
  "VIDEO-CONSULTATION": "gray"
};

export { AppointmentTypes, ColorMapArray };
