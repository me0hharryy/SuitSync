import React from 'react';
import '../../index.css'
import phone from '../../assets/PhoneIcons.png'

const Invoice = ({ invoiceData }) => {
  if (!invoiceData) {
    return <p className="p-4 font-sans">Loading invoice...</p>;
  }

  const {
    orderNumber,
    createdAt,
    Customer,
    items = [],
    totalAmount = 0,
    advancePayment = 0,
    balanceAmount = 0
  } = invoiceData;

  return (
    // Reduced padding and margin for a smaller overall container
    <div className="p-4 m-2 border-2 border-gray-300 rounded-xl shadow-lg bg-white font-sans">
      
      {/* Header Section - Reduced margins, padding, and font sizes */}
      <div className="flex justify-between items-center mb-6 border-b-2 border-rose-700 pb-3">
        <div>
          {/* Reduced font size for the main title */}
          <h1 className="text-2xl font-extrabold text-gray-900">New Welcome Tailor</h1>
          <p className="text-sm text-gray-600 italic mt-1">Your Tailoring Expert</p>
        </div>
        <div className="text-right">
          {/* Reduced font sizes */}
          <h2 className="uppercase text-rose-700 text-lg font-bold mb-1 tracking-wide">INVOICE</h2>
          <p className="text-sm text-gray-700"><strong className="font-semibold">Invoice #:</strong> {orderNumber}</p>
          <p className="text-sm text-gray-700"><strong className="font-semibold">Date:</strong> {new Date(createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Billed To Section - Reduced margins and padding */}
      <div className="mb-6 p-3 border border-gray-300 rounded-lg bg-gray-50 shadow-sm max-w-xs">
        <h3 className="font-semibold text-base mb-2 border-b-2 border-rose-700 pb-1 text-gray-800">Billed To:</h3>
        <p className="font-bold text-gray-900 text-base">{Customer?.User?.name || 'N/A'}</p>
        <p className="text-sm text-gray-700">{Customer?.User?.email || ''}</p>
        <p className="text-sm text-gray-700">{Customer?.User?.phone || ''}</p>
      </div>

      {/* Items Table - Reduced padding and font sizes in cells */}
      <div className="overflow-x-auto">
        <table className="w-full border-2 border-rose-700 rounded-lg border-collapse shadow-md">
          <thead className="bg-gradient-to-r from-rose-700 via-rose-700 to-rose-700 text-white">
            <tr>
              {/* Reduced padding and font size */}
              <th className="border border-rose-800 px-3 py-2 text-left text-sm font-semibold">Item Description</th>
              <th className="border border-rose-800 px-3 py-2 text-left text-sm font-semibold">Details</th>
              <th className="border border-rose-800 px-3 py-2 text-right text-sm font-semibold">Price</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={item.id || index} className={index % 2 === 0 ? 'bg-blue-50' : 'bg-white'}>
                {/* Reduced padding and font size */}
                <td className="border border-rose-300 px-3 py-2 text-sm text-gray-800 align-top">
                  <div className="font-semibold">{item.itemType}</div>
                  
                  {Array.isArray(item.measurements) && item.measurements.length > 0 && (
                    <div className="mt-2 text-xs text-gray-700">
                      <div className="font-semibold mb-1">Measurements:</div>
                      <div className="flex flex-wrap gap-1">
                        {item.measurements.map((tag, idx) => (
                          <span key={idx} className="bg-gray-200 px-2 py-1 rounded text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </td>
                <td className="border border-rose-300 px-3 py-2 text-sm text-gray-700 align-top">{`${item.fabric || ''} ${item.color || ''}`.trim()}</td>
                <td className="border border-rose-300 px-3 py-2 text-right text-sm font-medium text-gray-900 align-top">₹{Number(item.price || 0).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Totals Section - Reduced margins, padding and font sizes */}
      <div className="flex justify-end mt-6">
        <div className="w-full max-w-sm border-2 border-rose-700 rounded-xl p-4 bg-rose-50 shadow-inner">
          <div className="flex justify-between mb-2 text-gray-800 text-base font-semibold">
            <span>Total Amount:</span>
            <span>₹{totalAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between mb-2 text-blue-900 text-base font-semibold opacity-80">
            <span>Advance Paid:</span>
            <span>₹{advancePayment.toLocaleString()}</span>
          </div>
          <hr className="my-2 border-rose-700" />
          <div className="flex justify-between items-center text-rose-900">
            <span className="font-extrabold text-lg">Balance Due:</span>
            <span className="font-extrabold text-lg text-rose-700">₹{balanceAmount.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Footer Section - Reduced spacing */}
      <div className="border-t-2 border-gray-300 mt-8 pt-4 text-center text-xs text-gray-600 font-medium italic">
        Thank you for your business!
      </div>
      <div className="border-gray-300 flex justify-center text-xs text-gray-600 font-medium italic">
        <img src={phone} style={{ height:14, paddingTop:2, paddingRight:4 }} alt="phone icon" />
        9649630633
      </div>
    </div>
  );
};

export default Invoice;