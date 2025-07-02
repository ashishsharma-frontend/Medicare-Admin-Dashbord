import { useQuery } from "@tanstack/react-query"; // Adjust the import according to your project structure
import { GET } from "../Controllers/ApiControllers";
import admin from "../Controllers/admin";

const fetchTransactions = async () => {
  const res = await GET(admin.token, `get_all_transaction`);
  return res.data;
};

const useTransactionData = () => {
  const {
    isLoading: transactionsLoading,
    data: transactionsData,
    error: transactionsError,
  } = useQuery({
    queryKey: ["main-transactions"],
    queryFn: fetchTransactions,
  });

  return { transactionsData, transactionsLoading, transactionsError };
};

export default useTransactionData;
