import React, {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import html2pdf from "html2pdf.js";
import QRious from "qrious";
import {
  X,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Image as ImageIcon,
  Table as TableIcon,
  Plus,
  Minus,
  Save,
  Columns,
  Rows,
} from "lucide-react";

const A4_WIDTH = 794;
const A4_HEIGHT = 1123;

const AgreementEditorModal = forwardRef(
  ({ isOpen, onClose, documentNo = "DOC-001" }, ref) => {
    const containerRef = useRef();
    const fileInputRef = useRef();
    const [pages, setPages] = useState([0]);
    const [activePage, setActivePage] = useState(0);
    const [showTableConfig, setShowTableConfig] = useState(false);
    const [tableConfig, setTableConfig] = useState({
      rows: 2,
      cols: 2,
      border: "1",
      borderColor: "#000000",
    });
    const savedSelection = useRef(null);
    const overflowCheckTimeout = useRef(null);
    const underflowCheckTimeout = useRef(null);

    useImperativeHandle(ref, () => ({
      generatePDF: () => {
        return new Promise((resolve) => {
          const opt = {
            margin: 0,
            filename: `${documentNo}.pdf`,
            image: { type: "jpeg", quality: 1 },
            html2canvas: {
              scale: 2,
              useCORS: true,
              allowTaint: true,
            },
            jsPDF: {
              unit: "px",
              format: [A4_WIDTH, A4_HEIGHT],
              orientation: "portrait",
            },
          };

          html2pdf()
            .set(opt)
            .from(containerRef.current)
            .toPdf()
            .get("pdf")
            .then((pdf) => {
              const pdfBlob = pdf.output("blob");
              resolve(
                new File([pdfBlob], `${documentNo}.pdf`, {
                  type: "application/pdf",
                })
              );
            });
        });
      },
    }));

    useEffect(() => {
      if (isOpen) {
        setPages([0]);
        setActivePage(0);
      }
      return () => {
        if (overflowCheckTimeout.current) {
          clearTimeout(overflowCheckTimeout.current);
        }
        if (underflowCheckTimeout.current) {
          clearTimeout(underflowCheckTimeout.current);
        }
      };
    }, [isOpen]);

    useEffect(() => {
      pages.forEach((_, index) => {
        const canvas = document.getElementById(`qrcode-${index}`);
        if (canvas) {
          new QRious({
            element: canvas,
            value: documentNo,
            size: 70,
            background: "white",
            foreground: "black",
          });
        }
      });
    }, [pages, documentNo]);

    const saveSelection = () => {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        savedSelection.current = selection.getRangeAt(0);
      }
    };

    const restoreSelection = () => {
      if (savedSelection.current) {
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(savedSelection.current);
      }
    };

    const getNodeHeight = (node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        return node.offsetHeight || node.clientHeight;
      } else if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
        const span = document.createElement("span");
        span.style.whiteSpace = "pre-wrap";
        span.style.visibility = "hidden";
        span.style.position = "absolute";
        span.style.width = `${A4_WIDTH - 100}px`;
        span.textContent = node.textContent;
        document.body.appendChild(span);
        const height = span.offsetHeight;
        document.body.removeChild(span);
        return height;
      }
      return 0;
    };

    const moveOverflowToNextPage = (pageIndex) => {
      const currentPageContent = containerRef.current.querySelector(
        `.page-content[data-page="${pageIndex}"]`
      );

      if (!currentPageContent) return;

      if (pageIndex === pages.length - 1) {
        addNewPage();
      }

      const nextPageIndex = pageIndex + 1;
      const nextPageContent = containerRef.current.querySelector(
        `.page-content[data-page="${nextPageIndex}"]`
      );

      if (!nextPageContent) return;

      const nodes = Array.from(currentPageContent.childNodes);
      let accumulatedHeight = 0;
      const pageHeight = currentPageContent.clientHeight;
      let splitIndex = -1;

      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const nodeHeight = getNodeHeight(node);
        accumulatedHeight += nodeHeight;

        if (accumulatedHeight > pageHeight) {
          splitIndex = i;
          break;
        }
      }

      if (splitIndex >= 0) {
        const nodesToMove = nodes.slice(splitIndex);
        nodesToMove.forEach((node) => {
          currentPageContent.removeChild(node);
          nextPageContent.appendChild(node);
        });

        setActivePage(nextPageIndex);
        nextPageContent.focus();
        checkForOverflow(nextPageIndex);
      }
    };

    const checkForOverflow = (pageIndex) => {
      if (overflowCheckTimeout.current) {
        clearTimeout(overflowCheckTimeout.current);
      }

      overflowCheckTimeout.current = setTimeout(() => {
        const pageContent = containerRef.current.querySelector(
          `.page-content[data-page="${pageIndex}"]`
        );

        if (
          pageContent &&
          pageContent.scrollHeight > pageContent.clientHeight
        ) {
          moveOverflowToNextPage(pageIndex);
        }
      }, 100);
    };

    const pullContentFromNextPage = (pageIndex) => {
      const currentPageContent = containerRef.current.querySelector(
        `.page-content[data-page="${pageIndex}"]`
      );

      if (!currentPageContent || pageIndex >= pages.length - 1) return;

      const nextPageIndex = pageIndex + 1;
      const nextPageContent = containerRef.current.querySelector(
        `.page-content[data-page="${nextPageIndex}"]`
      );

      if (!nextPageContent) return;

      const availableSpace =
        currentPageContent.clientHeight - currentPageContent.scrollHeight;
      const nextPageNodes = Array.from(nextPageContent.childNodes);
      let nodesMoved = false;

      for (let i = 0; i < nextPageNodes.length; i++) {
        const node = nextPageNodes[i];
        const nodeHeight = getNodeHeight(node);

        if (nodeHeight <= availableSpace) {
          nextPageContent.removeChild(node);
          currentPageContent.appendChild(node);
          nodesMoved = true;
        } else {
          break;
        }
      }

      if (nodesMoved) {
        if (nextPageContent.childNodes.length === 0) {
          removeLastPage();
        } else {
          checkForUnderflow(pageIndex);
        }
      }
    };

    const checkForUnderflow = (pageIndex) => {
      if (underflowCheckTimeout.current) {
        clearTimeout(underflowCheckTimeout.current);
      }

      underflowCheckTimeout.current = setTimeout(() => {
        const pageContent = containerRef.current.querySelector(
          `.page-content[data-page="${pageIndex}"]`
        );

        if (
          pageContent &&
          pageContent.scrollHeight < pageContent.clientHeight
        ) {
          pullContentFromNextPage(pageIndex);
        }
      }, 100);
    };

    const handleContentChange = (pageIndex) => {
      checkForOverflow(pageIndex);
      checkForUnderflow(pageIndex);
    };

    const execCommand = (cmd, val = null) => {
      saveSelection();
      const activeEditable = containerRef.current.querySelector(
        `.page-content[data-page="${activePage}"]`
      );

      if (activeEditable) {
        activeEditable.focus();
        restoreSelection();
        document.execCommand(cmd, false, val);
        activeEditable.focus();
        handleContentChange(activePage);
      }
    };

    const handleInput = (e, index) => {
      saveSelection();
      handleContentChange(index);
    };

    const handleImageUpload = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          execCommand("insertImage", event.target.result);
        };
        reader.readAsDataURL(file);
      }
    };

    const insertTable = () => {
      let tableHTML = `<table border="${tableConfig.border}" style="border-collapse: collapse; width: 100%; margin: 5px 0; border-color: ${tableConfig.borderColor}">`;

      tableHTML += "<tr>";
      for (let i = 0; i < tableConfig.cols; i++) {
        tableHTML += `<th style="border: ${tableConfig.border}px solid ${
          tableConfig.borderColor
        }; padding: 5px;">Header ${i + 1}</th>`;
      }
      tableHTML += "</tr>";

      for (let i = 1; i < tableConfig.rows; i++) {
        tableHTML += "<tr>";
        for (let j = 0; j < tableConfig.cols; j++) {
          tableHTML += `<td style="border: ${tableConfig.border}px solid ${
            tableConfig.borderColor
          }; padding: 5px;">Data ${i}.${j + 1}</td>`;
        }
        tableHTML += "</tr>";
      }

      tableHTML += "</table><br/>";
      execCommand("insertHTML", tableHTML);
      setShowTableConfig(false);
    };

    const handleExportPDF = () => {
      const opt = {
        margin: 0,
        filename: `${documentNo}.pdf`,
        image: { type: "jpeg", quality: 1 },
        html2canvas: { scale: 2 },
        jsPDF: {
          unit: "px",
          format: [A4_WIDTH, A4_HEIGHT],
          orientation: "portrait",
        },
      };
      html2pdf().set(opt).from(containerRef.current).save();
    };

    const addNewPage = () => {
      setPages((prev) => [...prev, prev.length]);
      setActivePage(pages.length);
    };

    const removeLastPage = () => {
      if (pages.length > 1) {
        setPages((prev) => prev.slice(0, -1));
        setActivePage(Math.min(activePage, pages.length - 2));
      }
    };

    const handleListInsert = (ordered = false) => {
      saveSelection();
      const selection = window.getSelection();

      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const list = document.createElement(ordered ? "ol" : "ul");
        const li = document.createElement("li");

        if (!range.collapsed) {
          li.appendChild(range.extractContents());
        }

        list.appendChild(li);
        range.insertNode(list);

        const newRange = document.createRange();
        newRange.selectNodeContents(li);
        selection.removeAllRanges();
        selection.addRange(newRange);

        handleContentChange(activePage);
      }
    };

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex flex-col">
        <div className="flex justify-between items-center p-4 bg-white shadow">
          <h2 className="text-lg font-semibold">Agreement Editor</h2>
          <div className="flex gap-2">
            <button
              onClick={handleExportPDF}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-1"
            >
              <Save size={16} /> Export PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded bg-gray-700 text-white hover:bg-gray-800"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="bg-white">
          <div className="flex gap-2 p-3 shadow overflow-x-auto items-center text-sm">
            <label>Font:</label>
            <select
              onChange={(e) => execCommand("fontName", e.target.value)}
              className="border p-1"
            >
              <option value="Arial">Arial</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Verdana">Verdana</option>
              <option value="Courier New">Courier New</option>
            </select>

            <label>Size:</label>
            <select
              onChange={(e) => execCommand("fontSize", e.target.value)}
              className="border p-1"
              defaultValue="3"
            >
              <option value="1">8pt</option>
              <option value="2">10pt</option>
              <option value="3">12pt</option>
              <option value="4">14pt</option>
              <option value="5">18pt</option>
              <option value="6">24pt</option>
            </select>

            <label>Color:</label>
            <input
              type="color"
              onChange={(e) => execCommand("foreColor", e.target.value)}
              className="w-6 h-6 border"
            />

            <button
              onClick={() => execCommand("bold")}
              className="p-2 border rounded hover:bg-gray-100"
            >
              <Bold size={16} />
            </button>
            <button
              onClick={() => execCommand("italic")}
              className="p-2 border rounded hover:bg-gray-100"
            >
              <Italic size={16} />
            </button>
            <button
              onClick={() => execCommand("underline")}
              className="p-2 border rounded hover:bg-gray-100"
            >
              <Underline size={16} />
            </button>
            <button
              onClick={() => execCommand("strikeThrough")}
              className="p-2 border rounded hover:bg-gray-100"
            >
              <Strikethrough size={16} />
            </button>
            <button
              onClick={() => handleListInsert(false)}
              className="p-2 border rounded hover:bg-gray-100"
            >
              <List size={16} />
            </button>
            <button
              onClick={() => handleListInsert(true)}
              className="p-2 border rounded hover:bg-gray-100"
            >
              <ListOrdered size={16} />
            </button>
            <button
              onClick={() => execCommand("justifyLeft")}
              className="p-2 border rounded hover:bg-gray-100"
            >
              <AlignLeft size={16} />
            </button>
            <button
              onClick={() => execCommand("justifyCenter")}
              className="p-2 border rounded hover:bg-gray-100"
            >
              <AlignCenter size={16} />
            </button>
            <button
              onClick={() => execCommand("justifyRight")}
              className="p-2 border rounded hover:bg-gray-100"
            >
              <AlignRight size={16} />
            </button>
            <button
              onClick={() => fileInputRef.current.click()}
              className="p-2 border rounded hover:bg-gray-100"
            >
              <ImageIcon size={16} />
            </button>

            <button
              onClick={() => setShowTableConfig(!showTableConfig)}
              className={`p-2 border rounded ${
                showTableConfig ? "bg-blue-100" : "hover:bg-gray-100"
              }`}
            >
              <TableIcon size={16} />
            </button>

            <div className="flex items-center gap-1 ml-2">
              <button
                onClick={addNewPage}
                className="p-2 border rounded hover:bg-gray-100"
              >
                <Plus size={16} />
              </button>
              <button
                onClick={removeLastPage}
                className="p-2 border rounded hover:bg-gray-100"
                disabled={pages.length <= 1}
              >
                <Minus size={16} />
              </button>
              <span className="text-sm px-2">Page {pages.length}</span>
            </div>

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className="hidden"
              onChange={handleImageUpload}
            />
          </div>

          {showTableConfig && (
            <div className="bg-gray-50 border-t p-3 flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <Rows size={14} className="text-gray-600" />
                <label className="text-sm">Rows:</label>
                <input
                  type="number"
                  min="1"
                  value={tableConfig.rows}
                  onChange={(e) =>
                    setTableConfig({ ...tableConfig, rows: e.target.value })
                  }
                  className="w-16 border p-1 text-sm rounded"
                />
              </div>

              <div className="flex items-center gap-2">
                <Columns size={14} className="text-gray-600" />
                <label className="text-sm">Columns:</label>
                <input
                  type="number"
                  min="1"
                  value={tableConfig.cols}
                  onChange={(e) =>
                    setTableConfig({ ...tableConfig, cols: e.target.value })
                  }
                  className="w-16 border p-1 text-sm rounded"
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm">Border Size:</label>
                <input
                  type="number"
                  min="0"
                  value={tableConfig.border}
                  onChange={(e) =>
                    setTableConfig({ ...tableConfig, border: e.target.value })
                  }
                  className="w-16 border p-1 text-sm rounded"
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm">Border Color:</label>
                <input
                  type="color"
                  value={tableConfig.borderColor}
                  onChange={(e) =>
                    setTableConfig({
                      ...tableConfig,
                      borderColor: e.target.value,
                    })
                  }
                  className="w-8 h-8 border rounded"
                />
              </div>

              <button
                onClick={insertTable}
                className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 flex items-center gap-1 ml-auto"
              >
                <TableIcon size={14} /> Insert Table
              </button>

              <button
                onClick={() => setShowTableConfig(false)}
                className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-auto p-8 bg-gray-100 flex flex-col items-center gap-5">
          <div ref={containerRef} className="flex flex-col items-center">
            {pages.map((_, index) => (
              <div
                key={index}
                style={{
                  width: `${A4_WIDTH}px`,
                  height: `${A4_HEIGHT}px`,
                  position: "relative",
                  backgroundColor: "white",
                  overflow: "hidden",
                  boxSizing: "border-box",
                  fontFamily: "sans-serif",
                  border: "1px solid #ccc",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "50px 20px",
                    borderBottom: "2px solid #000",
                    height: "80px",
                    boxSizing: "border-box",
                  }}
                >
                  <img
                    src="path/thaalam-logo.png"
                    alt="Logo"
                    style={{ height: "50px" }}
                  />
                  <div
                    style={{
                      textAlign: "right",
                      fontSize: "13px",
                      lineHeight: "1.3",
                    }}
                  >
                    <strong>Thaalam Media GmbH</strong>
                    <br />
                    TALACKER 41, 8001 ZÜRICH
                    <br />
                    🌐 <a href="http://www.thaalam.ch">www.thaalam.ch</a> | ✉️{" "}
                    <a href="mailto:info@thaalam.ch">info@thaalam.ch</a>
                    <br />
                    📞 043 505 31 58 | 📱 079 906 45 37
                  </div>
                </div>

                <img
                  src="path/watermark.png"
                  alt="Watermark"
                  style={{
                    position: "absolute",
                    top: "300px",
                    left: "100px",
                    width: "600px",
                    opacity: 0.07,
                    zIndex: 1,
                  }}
                />

                <div
                  contentEditable
                  suppressContentEditableWarning
                  className="page-content"
                  data-page={index}
                  onInput={(e) => handleInput(e, index)}
                  onFocus={() => setActivePage(index)}
                  onClick={saveSelection}
                  onKeyUp={saveSelection}
                  style={{
                    position: "absolute",
                    top: "130px",
                    left: "50px",
                    right: "50px",
                    bottom: "160px",
                    overflow: "hidden",
                    fontSize: "14px",
                    lineHeight: "1.6",
                    zIndex: 2,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    outline: "none",
                  }}
                >
                  {index === 0 ? "Type your agreement content here..." : ""}
                </div>

                <div
                  style={{
                    position: "absolute",
                    bottom: "100px",
                    left: 0,
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "20px",
                  }}
                >
                  <div style={{ width: "250px", display: "flex" }}>
                    Signature:{" "}
                    <div
                      style={{
                        borderBottom: "1px solid #000",
                        display: "inline-block",
                        width: "200px",
                      }}
                    ></div>
                  </div>
                  <div
                    style={{
                      width: "250px",
                      textAlign: "right",
                      display: "flex",
                    }}
                  >
                    Signature:{" "}
                    <div
                      style={{
                        borderBottom: "1px solid #000",
                        display: "inline-block",
                        width: "200px",
                      }}
                    ></div>
                  </div>
                </div>
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    width: "100%",
                    height: "80px",
                    borderTop: "2px solid #000",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "50px 20px",
                    boxSizing: "border-box",
                  }}
                >
                  <canvas
                    id={`qrcode-${index}`}
                    style={{ width: "70px", height: "70px" }}
                  />
                  <div
                    style={{
                      textAlign: "right",
                      fontSize: "12px",
                      color: "#c00",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                      justifyContent: "flex-start",
                    }}
                  >
                    <div>DOCUMENT NO: {documentNo}</div>
                    <div>PAGE NO: {index + 1}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <style>{`
        .page-content ul {
          list-style-type: disc;
          padding-left: 40px;
        }
        .page-content ol {
          list-style-type: decimal;
          padding-left: 40px;
        }
        .page-content li {
          margin-bottom: 4px;
        }
        .page-content table {
          border-collapse: collapse;
          width: 100%;
          margin: 10px 0;
        }
        .page-content th,
        .page-content td {
          border: 1px solid black;
          padding: 8px;
          text-align: left;
        }
        .page-content th {
          background-color: #f2f2f2;
          font-weight: bold;
        }
      `}</style>
      </div>
    );
  }
);

export default AgreementEditorModal;
