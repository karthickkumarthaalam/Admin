import React, { useEffect, useState } from "react";
import { apiCall } from "../utils/apiCall";
import { toast } from "react-toastify";

const ViewPackageModal = ({ isOpen, onClose, packageData }) => {
  const [currencies, setCurrencies] = useState([]);
  const [symbol, setSymbol] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchCurrencies();
    }
  }, [isOpen]);

  const fetchCurrencies = async () => {
    try {
      const res = await apiCall("/currency", "GET");
      setCurrencies(res.data);
    } catch (error) {
      toast.error("Failed to fetch currencies");
    }
  };

  const getCurrency = (id) => {
    const currency = currencies.find((curr) => curr.id === id);
    return currency
      ? `${currency.country_name} - ${currency.currency_name}`
      : "Currency not found";
  };

  useEffect(() => {
    if (packageData?.currency_id && currencies.length > 0) {
      const currency = currencies.find(
        (curr) => curr.id === packageData.currency_id
      );
      if (currency) {
        setSymbol(currency.symbol);
      }
    }
  }, [packageData, currencies]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-xl p-6 overflow-y-auto max-h-[90vh] shadow-xl">
        <div className="flex justify-between items-center mb-4 border-b border-dashed pb-2 border-gray-500">
          <h2 className="text-xl font-semibold text-gray-800">
            Package Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 text-xl font-bold focus:outline-none"
          >
            &times;
          </button>
        </div>

        <div className="text-sm space-y-4 text-gray-700">
          <div>
            <span className="font-semibold">Package ID:</span>{" "}
            {packageData.package_id}
          </div>
          <div>
            <span className="font-semibold">Name:</span>{" "}
            {packageData.package_name}
          </div>
          <div>
            <span className="font-semibold">Currency:</span>{" "}
            {getCurrency(packageData.currency_id)}
          </div>
          <div>
            <span className="font-semibold">Monthly Price:</span>{" "}
            {`${symbol} ${packageData.price}`}
          </div>
          {packageData.yearly_price > 0 && (
            <div>
              <span className="font-semibold">Yearly price Per Month:</span>
              {"  "}
              {`${symbol} ${packageData.yearly_price}`}
            </div>
          )}
          <div>
            <span className="font-semibold">Duration:</span>{" "}
            {packageData.duration}
          </div>
          <div>
            <span className="font-semibold">Status:</span>{" "}
            <span
              className={`px-2 py-0.5 rounded-full text-xs ${
                packageData.status === "active"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {packageData.status}
            </span>
          </div>
          <div>
            <span className="font-semibold">Description:</span>
            <p className="mt-1 text-gray-600 text-sm">
              {packageData.description}
            </p>
          </div>

          <div>
            <span className="font-semibold">Languages:</span>
            <div className="flex flex-wrap gap-2 mt-1">
              {packageData.language?.map((lang, idx) => (
                <span
                  key={idx}
                  className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-1 rounded-full"
                >
                  {lang}
                </span>
              ))}
            </div>
          </div>

          <div>
            <span className="font-semibold">Features:</span>
            <div className="flex flex-wrap gap-2 mt-1">
              {packageData.features?.map((feature, idx) => (
                <span
                  key={idx}
                  className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-md"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="bg-red-500 hover:bg-red-600 text-white text-sm px-5 py-2 rounded-md"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewPackageModal;
