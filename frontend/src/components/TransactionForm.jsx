import { useState } from "react";

export default function TransactionForm({ onSubmit }) {
  const [form, setForm] = useState({
    type: "Expense",
    category: "",
    amount: "",
    description: "",
    paymentMethod: "Cash"
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
    setForm({ type: "Expense", category: "", amount: "", description: "", paymentMethod: "Cash" });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow space-y-3">
      <div className="flex gap-3">
        <select name="type" value={form.type} onChange={handleChange} className="border p-2 rounded">
          <option>Income</option>
          <option>Expense</option>
        </select>

        <input name="category" placeholder="Category" value={form.category} onChange={handleChange} className="border p-2 rounded w-full" />
        <input name="amount" type="number" placeholder="Amount" value={form.amount} onChange={handleChange} className="border p-2 rounded w-full" />
      </div>

      <input name="description" placeholder="Description" value={form.description} onChange={handleChange} className="border p-2 rounded w-full" />

      <div className="flex gap-3">
        <select name="paymentMethod" value={form.paymentMethod} onChange={handleChange} className="border p-2 rounded">
          <option>Cash</option>
          <option>UPI</option>
          <option>Card</option>
          <option>Bank Transfer</option>
          <option>Insurance</option>
          <option>Other</option>
        </select>

        <button className="bg-blue-600 text-white px-4 rounded">Add</button>
      </div>
    </form>
  );
}