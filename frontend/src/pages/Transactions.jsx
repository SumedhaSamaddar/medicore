import { useState, useEffect } from "react";
import {
  getTransactions,
  createTransaction,
  deleteTransaction
} from "../api"; // api.js is in src folder

import TransactionForm from "../components/TransactionForm";
import TransactionTable from "../components/TransactionTable";

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);

  const fetchTransactions = async () => {
    try {
      const res = await getTransactions();
      setTransactions(res.data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleAdd = async (newTransaction) => {
    try {
      await createTransaction(newTransaction);
      fetchTransactions();
    } catch (error) {
      console.error("Error adding transaction:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTransaction(id);
      fetchTransactions();
    } catch (error) {
      console.error("Error deleting transaction:", error);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl md:text-2xl font-bold mb-4">Transactions</h1>
      <TransactionForm onSubmit={handleAdd} />
      <TransactionTable transactions={transactions} onDelete={handleDelete} />
    </div>
  );
}

