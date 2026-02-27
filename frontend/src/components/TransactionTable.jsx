export default function TransactionTable({ transactions, onDelete }) {
  return (
    <div className="bg-white rounded shadow">
      <table className="w-full text-sm">
        <thead className="border-b bg-gray-50">
          <tr>
            <th className="p-2 text-left">Type</th>
            <th className="p-2 text-left">Category</th>
            <th className="p-2 text-left">Amount</th>
            <th className="p-2 text-left">Method</th>
            <th className="p-2 text-left">Date</th>
            <th className="p-2"></th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => (
            <tr key={t._id} className="border-b">
              <td className="p-2">{t.type}</td>
              <td className="p-2">{t.category}</td>
              <td className="p-2">₹{t.amount}</td>
              <td className="p-2">{t.paymentMethod}</td>
              <td className="p-2">{new Date(t.date).toLocaleDateString()}</td>
              <td className="p-2 text-right">
                <button onClick={() => onDelete(t._id)} className="text-red-500">
                  Delete
                </button>
              </td>
            </tr>
          ))}

          {transactions.length === 0 && (
            <tr>
              <td colSpan="6" className="text-center p-4 text-gray-500">
                No transactions yet
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}