import React, { useState, useEffect } from 'react';
import { 
  getInvoiceHistory, 
  deleteInvoiceFromHistory, 
  calculateTodayRevenue, 
  calculateMRR, 
  calculateARR,
  type StoredInvoice 
} from '../data/invoiceHistory';
import { formatCurrency } from '../utils/currency';
import { Trash2, Eye, TrendingUp, Calendar, DollarSign } from 'lucide-react';

interface InvoiceHistoryProps {
  onInvoiceSelect?: (invoice: StoredInvoice) => void;
}

const InvoiceHistory: React.FC<InvoiceHistoryProps> = ({ onInvoiceSelect }) => {
  const [invoices, setInvoices] = useState<StoredInvoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = () => {
    try {
      const history = getInvoiceHistory();
      setInvoices(history); // Already sorted by invoice number in getInvoiceHistory
    } catch (error) {
      console.error('Error loading invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this invoice from history?')) {
      deleteInvoiceFromHistory(id);
      loadInvoices();
    }
  };

  const handleView = (invoice: StoredInvoice) => {
    if (onInvoiceSelect) {
      onInvoiceSelect(invoice);
    }
  };

  const todayRevenue = calculateTodayRevenue(invoices);
  const mrr = calculateMRR(invoices);
  const arr = calculateARR(invoices);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-gray-500">Loading invoice history...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Today's Revenue</p>
              <div className="mt-2 space-y-1">
                <p className="text-2xl font-bold text-blue-900">
                  {formatCurrency(todayRevenue.usd, 'USD')}
                </p>
                <p className="text-lg font-semibold text-blue-700">
                  {formatCurrency(todayRevenue.inr, 'INR')}
                </p>
              </div>
            </div>
            <Calendar className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">MRR (Monthly)</p>
              <div className="mt-2 space-y-1">
                <p className="text-2xl font-bold text-green-900">
                  {formatCurrency(mrr.usd, 'USD')}
                </p>
                <p className="text-lg font-semibold text-green-700">
                  {formatCurrency(mrr.inr, 'INR')}
                </p>
              </div>
            </div>
            <DollarSign className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">ARR (Yearly)</p>
              <div className="mt-2 space-y-1">
                <p className="text-2xl font-bold text-purple-900">
                  {formatCurrency(arr.usd, 'USD')}
                </p>
                <p className="text-lg font-semibold text-purple-700">
                  {formatCurrency(arr.inr, 'INR')}
                </p>
              </div>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Invoice History Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Invoice History</h2>
          <p className="text-gray-600 text-sm mt-1">
            {invoices.length} invoice{invoices.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {invoices.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-gray-400 text-lg mb-2">No invoices found</div>
            <p className="text-gray-500">Download your first invoice to see it here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {invoice.invoiceData.invoice.number}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {invoice.invoiceData.buyer.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {invoice.invoiceData.buyer.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(invoice.amount, invoice.currency)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        invoice.invoiceData.type === 'plan' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {invoice.invoiceData.type === 'plan' ? 'Plan' : 'Add-on'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(invoice.downloadedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleView(invoice)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                          title="View Invoice"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(invoice.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                          title="Delete Invoice"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceHistory;