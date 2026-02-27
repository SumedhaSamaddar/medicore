import { useState } from 'react'
import Sidebar from '../components/Sidebar'

export default function Analytics() {
  const [showTransactionForm, setShowTransactionForm] = useState(false)

  return (
    <div className="flex bg-gray-950 min-h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="ml-0 md:ml-0 md:ml-64 flex-1 p-4 md:p-4 md:p-8 pt-16 md:pt-16 md:pt-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white">Analytics</h2>
            <p className="text-gray-400">Business insights and performance</p>
          </div>

          <button
            onClick={() => setShowTransactionForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 
                       rounded-lg font-medium transition-colors"
          >
            Add Transaction
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-4 md:gap-6 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <p className="text-gray-400 text-sm">Total Revenue</p>
            <h3 className="text-xl md:text-2xl font-bold text-white mt-1">₹2,45,000</h3>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <p className="text-gray-400 text-sm">Transactions</p>
            <h3 className="text-xl md:text-2xl font-bold text-white mt-1">312</h3>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <p className="text-gray-400 text-sm">Expenses</p>
            <h3 className="text-xl md:text-2xl font-bold text-white mt-1">₹78,000</h3>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <p className="text-gray-400 text-sm">Net Profit</p>
            <h3 className="text-xl md:text-2xl font-bold text-green-400 mt-1">₹1,67,000</h3>
          </div>
        </div>

        {/* Placeholder Chart Area */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 h-80 flex items-center justify-center">
          <p className="text-gray-500">Charts will appear here</p>
        </div>

        {/* Transaction Modal */}
        {showTransactionForm && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-white mb-4">
                Add Transaction
              </h3>

              <input
                type="text"
                placeholder="Description"
                className="w-full mb-3 px-3 py-2 bg-gray-800 border border-gray-700 
                           rounded-lg text-white"
              />

              <input
                type="number"
                placeholder="Amount"
                className="w-full mb-4 px-3 py-2 bg-gray-800 border border-gray-700 
                           rounded-lg text-white"
              />

              <div className="flex gap-3">
                <button
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 
                             rounded-lg font-medium"
                >
                  Save
                </button>

                <button
                  onClick={() => setShowTransactionForm(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-300 py-2 
                             rounded-lg font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

