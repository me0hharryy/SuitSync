import React from 'react';
import '../../index.css'
import phone from '../../assets/PhoneIcons.png'
import { Height } from '@mui/icons-material';
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
    <div className="p-8 m-5 border-2 border-gray-300 rounded-xl shadow-lg bg-white font-sans">
      
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8 border-b-4 border-rose-700 pb-4">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900">New Welcome Tailor</h1>
          <p className="text-gray-600 italic mt-1">Your Tailoring Expert</p>
        </div>
        <div className="text-right">
          <h2 className="uppercase text-rose-700 text-xl font-bold mb-2 tracking-wide">INVOICE</h2>
          <p className="text-gray-700"><strong className="font-semibold">Invoice #:</strong> {orderNumber}</p>
          <p className="text-gray-700"><strong className="font-semibold">Date:</strong> {new Date(createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Billed To Section */}
      <div className="mb-8 p-6 border border-gray-300 rounded-lg bg-gray-50 shadow-sm max-w-md">
        <h3 className="font-semibold text-lg mb-3 border-b-2 border-rose-700 pb-1 text-gray-800">Billed To:</h3>
        <p className="font-bold text-gray-900 text-lg">{Customer?.User?.name || 'N/A'}</p>
        <p className="text-gray-700">{Customer?.User?.email || ''}</p>
        <p className="text-gray-700">{Customer?.User?.phone || ''}</p>
      </div>

      {/* Items Table with Borders */}
      <div className="overflow-x-auto">
        <table className="w-full border-4 border-rose-700 rounded-lg border-collapse shadow-md">
          <thead className="bg-gradient-to-r from-rose-700 via-rose-700 to-rose-700 text-white">
            <tr>
              <th className="border border-rose-800 px-5 py-3 text-left text-lg font-semibold">Item Description</th>
              <th className="border border-rose-800 px-5 py-3 text-left text-lg font-semibold">Details</th>
              <th className="border border-rose-800 px-5 py-3 text-right text-lg font-semibold">Price</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={item.id || index} className={index % 2 === 0 ? 'bg-blue-50' : 'bg-white'}>
                <td className="border border-rose-300 px-5 py-3 font-semibold text-gray-800">{item.itemType}</td>
                <td className="border border-rose-300 px-5 py-3 text-gray-700">{`${item.fabric || ''} ${item.color || ''}`.trim()}</td>
                <td className="border border-rose-300 px-5 py-3 text-right font-medium text-gray-900">₹{Number(item.price || 0).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Totals Section */}
      <div className="flex justify-end mt-8">
        <div className="w-full max-w-md border-2 border-rose-700 rounded-xl p-6 bg-rose-50 shadow-inner">
          <div className="flex justify-between mb-3 text-gray-800 text-lg font-semibold">
            <span>Total Amount:</span>
            <span>₹{totalAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between mb-3 text-blue-900 text-lg font-semibold opacity-80">
            <span>Advance Paid:</span>
            <span>₹{advancePayment.toLocaleString()}</span>
          </div>
          <hr className="my-4 border-rose-700" />
          <div className="flex justify-between items-center text-rose-900">
            <span className="font-extrabold text-xl">Balance Due:</span>
            <span className="font-extrabold text-xl text-rose-700">₹{balanceAmount.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <div className="border-t-2 border-gray-300 mt-12 pt-6 text-center text-sm text-gray-600 font-medium italic">
        Thank you for your business!
      </div>
      <div className="border-gray-300 flex justify-center text-sm text-gray-600 font-medium italic">
        <img src={phone} style={{
          height:16,
          paddingTop:4,
          paddingRight:4
        }}></img>
        9649630633
      </div>
    </div>
  );
};

export default Invoice;