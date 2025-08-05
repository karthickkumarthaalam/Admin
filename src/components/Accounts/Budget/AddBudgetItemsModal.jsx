import React, { useEffect, useState } from "react";
import { apiCall } from "../../../utils/apiCall";
import socket from "../../../utils/socket";
import { toast } from "react-toastify";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import debounce from "lodash.debounce";

const AddBudgetItemsModal = ({ isOpen, onClose, budgetData, reloadData }) => {
  const [items, setItems] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [subCategoryMap, setSubCategoryMap] = useState({});
  const [taxOptions, setTaxOptions] = useState([]);
  const [selectedTaxes, setSelectedTaxes] = useState([]);
  const [merchantOptions, setMerchantOptions] = useState([]);
  const [unitsOptions, setUnitsOptions] = useState([]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  useEffect(() => {
    if (isOpen && budgetData) {
      fetchItems();
      fetchCategories();
      fetchMerchants();
      fetchUnits();
      if (budgetData.budget_type === "income") {
        fetchTaxes();
        fetchAppliedTaxes();
      }
    }
  }, [isOpen, budgetData]);

  useEffect(() => {
    if (!isOpen || !budgetData?.budget_id) return;

    const cleanupPreviousListeners = () => {
      socket.off("received-budget-item-update");
      socket.off("received-subcategory-update");
      socket.off("received-budget-item-removed");
      socket.off("received-budget-tax-update");
    };

    cleanupPreviousListeners();

    socket.emit("join-budget-room", {
      budgetId: budgetData?.budget_id,
      budgetType: budgetData?.budget_type,
    });

    const listeners = {
      "received-budget-item-update": ({ index, item }) => {
        setItems((prev) => {
          const updated = [...prev];
          updated[index] = item;
          return updated;
        });
      },
      "received-subcategory-update": ({ category, subCategories }) => {
        setSubCategoryMap((prev) => ({
          ...prev,
          [category]: subCategories,
        }));
      },
      "received-budget-item-removed": ({ index }) => {
        setItems((prev) => {
          const updated = [...prev];
          updated.splice(index, 1);
          return updated;
        });
      },
      "received-budget-tax-update": ({ taxes }) => {
        setSelectedTaxes(taxes);
      },
    };

    Object.entries(listeners).forEach(([event, handler]) => {
      socket.on(event, handler);
    });

    return () => {
      socket.off("join-budget-room");
      Object.keys(listeners).forEach((event) => {
        socket.off(event);
      });
    };
  }, [isOpen, budgetData?.budget_id, budgetData?.budget_type]);

  const fetchCategories = async () => {
    try {
      const res = await apiCall("/budget-category", "get");
      setCategoryOptions(res.data || []);
    } catch (error) {
      toast.error("Failed to load categories");
    }
  };

  const fetchSubCategories = async (categoryName) => {
    if (subCategoryMap[categoryName]) return;
    try {
      const res = await apiCall(`/budget-category/${categoryName}`, "get");
      const newSubCategories = res.subCategories || [];
      setSubCategoryMap((prev) => ({
        ...prev,
        [categoryName]: newSubCategories || [],
      }));

      socket.emit("budget-subcategory-update", {
        budgetId: budgetData.budget_id,
        budgetType: budgetData.budget_type,
        category: categoryName,
        subCategories: newSubCategories,
      });
    } catch (error) {
      toast.error("Failed to load subcategories");
    }
  };

  const fetchMerchants = async () => {
    try {
      const res = await apiCall("/budget-merchant", "GET");
      setMerchantOptions(res.data || []);
    } catch (error) {
      toast.error("Failed to fetch Merchants");
    }
  };

  const fetchUnits = async () => {
    try {
      const res = await apiCall("/budget-units", "GET");
      setUnitsOptions(res.data || []);
    } catch (error) {
      toast.error("Failed to fetch Units");
    }
  };

  const fetchTaxes = async () => {
    try {
      const res = await apiCall(`/budget-tax?is_active=true`, "GET");
      setTaxOptions(res.data || []);
    } catch (err) {
      toast.error("Failed to load tax options");
    }
  };

  const fetchItems = async () => {
    try {
      const res = await apiCall(
        `/budget/budget-items/${budgetData.budget_id}?budget_type=${budgetData.budget_type}`,
        "get"
      );

      const data = res.data || [];

      if (data.length === 0) {
        setItems([
          {
            category: "",
            sub_category: "",
            merchant: "",
            amount: "",
            quantity: 1,
            units: "",
            total_amount: "",
            description: "",
            actual_amount: "",
            budget_type: budgetData.budget_type,
          },
        ]);
      } else {
        setItems(data);
        const uniqueCategories = [
          ...new Set(data.map((item) => item.category)),
        ];
        for (const category of uniqueCategories) {
          await fetchSubCategories(category);
        }
      }
    } catch (error) {
      toast.error("Failed to fetch items");
    }
  };

  const fetchAppliedTaxes = async () => {
    try {
      const res = await apiCall(`/budget/budget-tax/${budgetData.id}`, "get");
      const applied =
        res.data?.map((t) => ({
          tax_id: t.tax.id,
          tax_name: t.tax.tax_name,
          percentage: t.tax.tax_percentage,
        })) || [];
      setSelectedTaxes(applied);
    } catch (err) {
      toast.error("Failed to load applied taxes");
    }
  };

  const emitBudgetItemchange = debounce((budgetId, budgetType, index, item) => {
    socket.emit("budget-item-changed", {
      budgetId,
      budgetType,
      index,
      item,
    });
  }, 500);

  const handleChange = (index, key, value) => {
    const updated = [...items];
    updated[index][key] = value;

    if (key === "category") {
      fetchSubCategories(value);
      updated[index]["sub_category"] = "";
    }

    if (key === "amount" || key === "quantity") {
      const amt = key === "amount" ? value : updated[index].amount;
      const qty = key === "quantity" ? value : updated[index].quantity;
      updated[index].total_amount = amt && qty ? amt * qty : "";
    }

    setItems(updated);
    emitBudgetItemchange(
      budgetData?.budget_id,
      budgetData?.budget_type,
      index,
      updated[index]
    );
  };

  const emitTaxChange = debounce((budgetId, budgetType, taxes) => {
    socket.emit("budget-tax-changed", {
      budgetId,
      budgetType,
      taxes,
    });
  }, 500);

  const handleAddTax = (taxId) => {
    const selected = taxOptions.find((t) => t.id === taxId);
    if (selected && !selectedTaxes.some((t) => t.tax_id === selected.id)) {
      const newTaxes = [
        ...selectedTaxes,
        {
          tax_id: selected.id,
          tax_name: selected.tax_name,
          percentage: selected.tax_percentage,
        },
      ];

      setSelectedTaxes(newTaxes);
      emitTaxChange(budgetData.budget_id, budgetData?.budget_type, newTaxes);
    }
  };

  const handleRemoveTax = (index) => {
    const newTaxes = selectedTaxes.filter((_, i) => i !== index);
    setSelectedTaxes(newTaxes);
    emitTaxChange(budgetData.budget_id, newTaxes);
  };

  const addItemRow = () => {
    setItems([
      ...items,
      {
        category: "",
        sub_category: "",
        merchant: "",
        amount: "",
        quantity: 1,
        units: "",
        total_amount: "",
        actual_amount: "",
        description: "",
        budget_type: budgetData.budget_type,
      },
    ]);
  };

  const removeItem = (index) => {
    const updated = [...items];
    updated.splice(index, 1);
    setItems(updated);

    socket.emit("budget-item-removed", {
      budgetId: budgetData?.budget_id,
      budgetType: budgetData?.budget_type,
      index,
    });
  };

  const handleSubmit = async () => {
    try {
      await apiCall(`/budget/budget-items/${budgetData.budget_id}`, "PATCH", {
        budget_items: items,
      });

      if (budgetData.budget_type === "income" && selectedTaxes.length > 0) {
        const baseAmount = items.reduce(
          (sum, item) => sum + (parseFloat(item.total_amount) || 0),
          0
        );

        const taxesToSend = selectedTaxes.map((tax) => ({
          tax_id: tax.tax_id,
          amount: (baseAmount * tax.percentage) / 100,
        }));

        await apiCall("/budget/apply-tax", "post", {
          budget_id: budgetData.budget_id,
          taxes: taxesToSend,
          base_amount: baseAmount,
        });
      }

      toast.success("Budget items and taxes saved successfully");
      reloadData?.();
      onClose();
    } catch (error) {
      toast.error("Failed to save items or taxes");
    }
  };

  const grandTotal = items.reduce(
    (sum, item) => sum + (parseFloat(item.total_amount) || 0),
    0
  );

  const totalTaxAmount = selectedTaxes?.reduce(
    (sum, tax) => sum + (grandTotal * tax.percentage) / 100,
    0
  );

  const tableHeaders = [
    { label: "⇅", width: "40px" },
    { label: "Category", width: "140px" },
    { label: "Sub-category", width: "140px" },
    { label: "Description", width: "160px" },
    { label: "Merchant", width: "140px" },
    { label: "Qty", width: "80px" },
    { label: "Units", width: "130px" },
    { label: "Amount", width: "100px" },
    { label: "Total", width: "130px" },
    { label: "Actual Amount", width: "120px" },
    { label: "Action", width: "80px" },
  ];

  return (
    isOpen && (
      <div className="fixed inset-0 z-[100] bg-black bg-opacity-40 flex justify-center items-center overflow-auto p-4">
        <div
          className="bg-white w-full rounded-xl shadow-2xl p-6 relative overflow-hidden max-h-[90vh] flex flex-col"
          style={{ maxWidth: "95rem" }}
        >
          <div className="border-b pb-3 mb-6 ">
            <h2 className="text-xl font-semibold capitalize  text-red-500">
              {budgetData.budget_type}
            </h2>
            <h4>{budgetData.budget_id}</h4>
            <h4>{budgetData.title}</h4>
          </div>

          <div className="flex-1 overflow-y-auto ">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={({ active, over }) => {
                if (active.id !== over?.id) {
                  const oldIndex = items.findIndex(
                    (_, idx) => `row-${idx}` === active.id
                  );
                  const newIndex = items.findIndex(
                    (_, idx) => `row-${idx}` === over.id
                  );
                  setItems((prev) => arrayMove(prev, oldIndex, newIndex));
                }
              }}
            >
              <div className="overflow-x-auto">
                <table className="min-w-[1200px] w-full border text-sm text-left shadow-sm rounded-md">
                  <thead className="sticky top-0 bg-gray-100 text-gray-700 uppercase text-xs z-10">
                    <tr>
                      {tableHeaders.map((head, i) => (
                        <th
                          key={i}
                          className="px-3 py-2 border whitespace-nowrap"
                          style={{
                            width: head.width,
                            minWidth: head.width,
                            maxWidth: head.width,
                          }}
                        >
                          {head.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <SortableContext
                    items={items.map((_, idx) => `row-${idx}`)}
                    strategy={verticalListSortingStrategy}
                  >
                    <tbody>
                      {items.map((item, idx) => {
                        const availableSubCategories =
                          subCategoryMap[item.category] || [];
                        return (
                          <SortableRow key={`row-${idx}`} id={`row-${idx}`}>
                            <td className="border p-2 cursor-move text-gray-500">
                              ☰
                            </td>
                            <td className="border p-2">
                              <select
                                value={item.category}
                                onChange={(e) =>
                                  handleChange(idx, "category", e.target.value)
                                }
                                className="w-full px-2 py-1 border rounded-md bg-white"
                              >
                                <option value="">Select</option>
                                {categoryOptions.map((cat) => (
                                  <option
                                    key={cat.id}
                                    value={cat.category_name}
                                  >
                                    {cat.category_name}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="border p-2">
                              <select
                                value={item.sub_category}
                                onChange={(e) =>
                                  handleChange(
                                    idx,
                                    "sub_category",
                                    e.target.value
                                  )
                                }
                                className="w-full px-2 py-1 border rounded-md bg-white"
                                disabled={!item.category}
                              >
                                <option value="">Select</option>
                                {availableSubCategories.map((sub, i) => (
                                  <option key={i} value={sub}>
                                    {sub}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="border p-2">
                              <input
                                value={item.description || ""}
                                onChange={(e) =>
                                  handleChange(
                                    idx,
                                    "description",
                                    e.target.value
                                  )
                                }
                                className="w-full px-2 py-1 border rounded-md"
                              />
                            </td>
                            <td className="border p-2">
                              <select
                                value={item.merchant}
                                onChange={(e) =>
                                  handleChange(idx, "merchant", e.target.value)
                                }
                                className="w-full px-2 py-1 border rounded-md bg-white"
                              >
                                <option value="">Select Merchant</option>
                                {merchantOptions.map((merchant, i) => (
                                  <option
                                    key={i}
                                    value={merchant.merchant_name}
                                  >
                                    {merchant.merchant_name}
                                  </option>
                                ))}
                              </select>
                            </td>

                            <td className="border p-2">
                              <input
                                type="number"
                                value={item.quantity}
                                onChange={(e) =>
                                  handleChange(
                                    idx,
                                    "quantity",
                                    parseInt(e.target.value)
                                  )
                                }
                                className="w-full px-2 py-1 border rounded-md"
                              />
                            </td>
                            <td className="border p-2">
                              <select
                                value={item.units}
                                onChange={(e) =>
                                  handleChange(idx, "units", e.target.value)
                                }
                                className="w-full px-2 py-1 border rounded-md bg-white"
                              >
                                <option value="">Select Units</option>
                                {unitsOptions.map((unit, i) => (
                                  <option key={i} value={unit.units_name}>
                                    {unit.units_name}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="border p-2">
                              <input
                                type="number"
                                value={item.amount}
                                onChange={(e) =>
                                  handleChange(
                                    idx,
                                    "amount",
                                    parseFloat(e.target.value)
                                  )
                                }
                                className="w-full px-2 py-1 border rounded-md"
                              />
                            </td>
                            <td className="border p-2">
                              <div className="relative">
                                <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500">
                                  {budgetData.currency?.symbol || "₹"}
                                </span>
                                <input
                                  type="number"
                                  value={
                                    item.total_amount !== undefined &&
                                    item.total_amount !== ""
                                      ? Number(item.total_amount).toFixed(2)
                                      : ""
                                  }
                                  onChange={(e) =>
                                    handleChange(
                                      idx,
                                      "total_amount",
                                      parseFloat(e.target.value)
                                    )
                                  }
                                  className="w-full pl-10 pr-1 py-1 border rounded-md"
                                  step="0.01"
                                />
                              </div>
                            </td>
                            <td className="border p-2">
                              <div className="relative">
                                <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500">
                                  {budgetData.currency?.symbol || "₹"}
                                </span>
                                <input
                                  type="number"
                                  value={item.actual_amount}
                                  onChange={(e) =>
                                    handleChange(
                                      idx,
                                      "actual_amount",
                                      parseFloat(e.target.value)
                                    )
                                  }
                                  className="w-full pl-10 pr-1 py-1 border rounded-md"
                                />
                              </div>
                            </td>
                            <td className="border p-2 text-center">
                              {items.length > 1 && (
                                <button
                                  className="text-red-600 hover:scale-210 transition"
                                  onClick={() => removeItem(idx)}
                                >
                                  ✖
                                </button>
                              )}
                            </td>
                          </SortableRow>
                        );
                      })}
                    </tbody>
                  </SortableContext>
                </table>
              </div>
            </DndContext>

            <button className="text-blue-500 p-3" onClick={addItemRow}>
              + Add Item
            </button>
            {budgetData.budget_type === "income" && (
              <div className="mt-6 flex justify-end">
                <div className="inline-block text-left w-full max-w-md">
                  <label className="block font-semibold text-gray-700 mb-2">
                    Taxes Applied
                  </label>

                  <div className="relative w-full mb-3">
                    <select
                      onChange={(e) => {
                        const taxId = parseInt(e.target.value);
                        handleAddTax(taxId);
                        e.target.value = "";
                      }}
                      className="appearance-none w-full bg-white border border-gray-300 text-sm px-4 py-2 pr-10 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">+ Add Tax</option>
                      {taxOptions
                        .filter(
                          (tax) =>
                            !selectedTaxes.some((sel) => sel.tax_id === tax.id)
                        )
                        .map((tax) => (
                          <option key={tax.id} value={tax.id}>
                            {tax.tax_name} ({tax.percentage}%)
                          </option>
                        ))}
                    </select>

                    {/* Custom dropdown icon */}
                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-500">
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {/* Selected taxes chips */}
                  <div className="flex flex-col gap-2 mb-3">
                    {selectedTaxes.map((tax, index) => {
                      const taxAmount = (grandTotal * tax.percentage) / 100;
                      return (
                        <div
                          key={index}
                          className="flex items-center justify-between"
                        >
                          <div className="text-sm text-blue-800 font-medium">
                            {tax.tax_name} ({tax.percentage}%)
                          </div>
                          <div className="flex items-center gap-4 text-sm text-blue-700">
                            <span className="font-semibold">
                              {budgetData?.currency?.symbol || "₹"}{" "}
                              {taxAmount.toFixed(2)}
                            </span>
                            <button
                              className="text-red-600 hover:text-red-800"
                              onClick={() => handleRemoveTax(index)}
                              title="Remove tax"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Right-aligned tax dropdown */}
                </div>
              </div>
            )}

            <div className="text-right  text-lg mt-2 pr-2">
              <span className="font-semibold">Total Amount:</span>{" "}
              {budgetData?.currency?.symbol} {grandTotal?.toFixed(2)}
            </div>
            {selectedTaxes.length > 0 &&
              budgetData.budget_type === "income" && (
                <div className="text-right text-lg font-medium mt-2 pr-2">
                  <span className="font-semibold">Total Tax: </span>{" "}
                  {budgetData?.currency?.symbol || "₹"}{" "}
                  {totalTaxAmount.toFixed(2)}
                </div>
              )}

            {budgetData.budget_type === "income" && (
              <div className="text-right text-lg mt-2 pr-2 border-t pt-2 ">
                <span className="font-semibold">Grand Total: </span>
                {budgetData?.currency?.symbol}{" "}
                {(grandTotal - totalTaxAmount).toFixed(2)}
              </div>
            )}
          </div>

          <div className="flex justify-end items-center mt-4 border-t pt-4">
            <div className="flex gap-3">
              <button
                className="px-5 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                onClick={handleSubmit}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  );
};

const SortableRow = ({ id, children }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <tr ref={setNodeRef} style={style} {...attributes}>
      {React.Children.map(children, (child, index) => {
        if (index === 0) {
          return React.cloneElement(child, {
            ...listeners,
            className: `${child.props.className || ""} cursor-move`,
          });
        }
        return child;
      })}
    </tr>
  );
};

export default AddBudgetItemsModal;
