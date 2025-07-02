import { Badge } from "@chakra-ui/react";

const getCancellationStatusBadge = (status) => {

  switch (status) {
    case "Processing":
      return (
        <Badge colorScheme="yellow" fontSize={12}>
          Processing
        </Badge>
      );
    case "Approved":
      return (
        <Badge colorScheme="green" fontSize={12}>
          Approved
        </Badge>
      );
    case "Rejected":
      return (
        <Badge colorScheme="red" fontSize={12}>
          Rejected
        </Badge>
      );
    case "Cancelled":
      return (
        <Badge colorScheme="red" fontSize={12}>
          Cancelled
        </Badge>
      );
    case "Initiated":
      return (
        <Badge colorScheme="blue" fontSize={12}>
          Initiated
        </Badge>
      );
    default:
      return (
        <Badge colorScheme="gray" fontSize={12}>
          Not Available
        </Badge>
      );
  }
};

export default getCancellationStatusBadge;
