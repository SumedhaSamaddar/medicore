import { useEffect, useState } from "react"
import { getTransactions, createTransaction, deleteTransaction } from "../api"
import TransactionForm from "../components/TransactionForm"
import TransactionTable from "../components/TransactionTable"

export default function Transactions() {
  const [transactions, setTransactions] = useState([])

  const fetchTransactions = async () => {
    try {
      const res = await getTransactions()
      setTransactions(res.data)
    } catch (error) {
      console.error("Error fetching transactions:", error)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [])

  const handleAdd = async (data) => {
    try {
      await createTransaction(data)
      fetchTransactions()
    } catch (error) {
      console.error("Error creating transaction:", error)
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteTransaction(id)
      fetchTransactions()
    } catch (error) {
      console.error("Error deleting transaction:", error)
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Transactions</h1>
      <TransactionForm onSubmit={handleAdd} />
      <div className="mt-8">
        <TransactionTable 
          transactions={transactions} 
          onDelete={handleDelete} 
        />
      </div>
    </div>
  )
}