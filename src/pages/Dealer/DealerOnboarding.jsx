import React, { useState, useEffect } from "react";
import UploadIcon from "@mui/icons-material/CloudUploadOutlined";
import UserIcon from "@mui/icons-material/PersonOutline";
import CreditCardIcon from "@mui/icons-material/CreditCardOutlined";
import FileTextIcon from "@mui/icons-material/InsertDriveFileOutlined";
import CheckIcon from "@mui/icons-material/CheckCircleOutline";
import EyeIcon from "@mui/icons-material/VisibilityOutlined";
import PlusIcon from "@mui/icons-material/Add";
import XIcon from "@mui/icons-material/Close";
import Select from "react-select";
import customSelectStyles from "../../utils/CustomCss";
import { toast } from "react-toastify";
import axios from "axios";

// 🔹 Reusable Input Component
const InputField = React.memo(
  ({ label, name, type = "text", value, onChange, required = false }) => (
    <div className="flex flex-col">
      <label className="text-sm mb-1 font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value || ""}
        onChange={onChange}
        className="w-full px-3 py-2 border-gray-300 rounded-md border-2 transition-all focus:border-blue-500 focus:outline-none"
        required={required}
      />
    </div>
  )
);

// 🔹 Reusable File Upload Component
const FileUpload = ({ label, file, onChange }) => (
  <div className="relative group">
    <input
      type="file"
      onChange={onChange}
      accept="image/*,application/pdf"
      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
    />
    <div
      className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 ${
        file
          ? "border-green-300 bg-green-50"
          : "border-gray-300 bg-gray-50 group-hover:border-blue-400 group-hover:bg-blue-50"
      }`}
    >
      {file ? (
        <>
          <CheckIcon className="w-8 h-8 text-green-500 mx-auto" />
          <p className="text-sm font-medium text-green-700">{file.name}</p>
        </>
      ) : (
        <>
          <UploadIcon className="w-8 h-8 text-gray-400 mx-auto" />
          <p className="text-sm text-gray-600">{label}</p>
        </>
      )}
    </div>
  </div>
);

const DealerOnboarding = () => {
  const [activeTab, setActiveTab] = useState("basic");
  const [formData, setFormData] = useState({});
  const [kycData, setKycData] = useState({});
  const [aadhaarFront, setAadhaarFront] = useState(null);
  const [aadhaarBack, setAadhaarBack] = useState(null);
  const [panFile, setPanFile] = useState(null);
  const [gstFile, setGstFile] = useState(null);
  const [enableOcr, setEnableOcr] = useState(true);
  const [documentsMeta, setDocumentsMeta] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [file, setFile] = useState(null);
  const [customDocName, setCustomDocName] = useState("");

  // 🔹 Tabs
  const tabs = [
    { id: "basic", label: "Basic Info", icon: UserIcon },
    { id: "kyc", label: "KYC Details", icon: CreditCardIcon },
    { id: "documents", label: "Documents", icon: FileTextIcon },
  ];

  // 🔹 Basic Info Fields
  const staticBasicFields = [
    { name: "dealerName", label: "Dealer Name", required: true },
    { name: "ownerName", label: "Owner Name", required: true },
    { name: "mobile", label: "Mobile", required: true },
    { name: "email", label: "Email", type: "email" },
    { name: "shopName", label: "Shop Name", required: true },
    { name: "gstNumber", label: "GST Number" },
    { name: "pincode", label: "Pincode", required: true },
    { name: "district", label: "District", required: true },
    { name: "state", label: "State", required: true },
    { name: "rmAssigned", label: "Assigned RM", required: true },
  ];

  const documentOptions = [
    { value: "shop_photo", label: "Shop Photograph" },
    { value: "rent_agreement", label: "Rent Agreement" },
    { value: "gst_certificate", label: "GST Certificate" },
    { value: "address_proof", label: "Address Proof" },
    { value: "cancelled_cheque", label: "Cancelled Cheque" },
    { value: "other", label: "Other / Additional Document" },
  ];

  // 🔹 Handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };
  const handleKycChange = (e) => {
    const { name, value } = e.target;
    setKycData((p) => ({ ...p, [name]: value }));
  };

  // 🔹 OCR + Verification Calls
  useEffect(() => {
    const performAadhaarOCR = async () => {
      if (!enableOcr || !aadhaarFront || !aadhaarBack) return;
      try {
        const fd = new FormData();
        fd.append("aadhaarFront", aadhaarFront);
        fd.append("aadhaarBack", aadhaarBack);
        const res = await axios.post("/api/dealers/kyc/ocr/aadhaar", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        const { name, dob, gender, aadhaarNumber, address } = res.data.aadhaarData || {};
        setKycData((p) => ({
          ...p,
          aadhaarName: name,
          aadhaarDob: dob,
          aadhaarGender: gender,
          aadhaarNumber,
          aadhaarAddress: address,
        }));
        toast.success("Aadhaar extracted successfully!");
      } catch {
        toast.error("Failed to extract Aadhaar data");
      }
    };
    performAadhaarOCR();
  }, [aadhaarFront, aadhaarBack, enableOcr]);

  const handleVerifyAadhaar = async () => {
    try {
      const res = await axios.post("/api/dealers/kyc/verify-aadhaar", {
        aadhaarNumber: kycData.aadhaarNumber,
        name: kycData.aadhaarName,
        dob: kycData.aadhaarDob,
      });
      if (res.data.verified) toast.success("✅ Aadhaar verified successfully!");
      else toast.error("❌ Aadhaar verification failed!");
    } catch {
      toast.error("Error verifying Aadhaar");
    }
  };

  const handleVerifyPan = async () => {
    try {
      const res = await axios.post("/api/dealers/kyc/verify-pan", {
        panNumber: kycData.panNumber,
        fullName: kycData.panName,
        dob: kycData.panDob,
      });
      if (res.data.verified) toast.success("✅ PAN verified successfully!");
      else toast.error("❌ PAN verification failed!");
    } catch {
      toast.error("Error verifying PAN");
    }
  };

  const handleVerifyGST = async () => {
    try {
      const res = await axios.post("/api/dealers/kyc/verify-gst", {
        gstNumber: kycData.gstNumber,
      });
      const gst = res.data.gstData || {};
      setKycData((p) => ({
        ...p,
        gstLegalName: gst.legalName,
        gstTradeName: gst.tradeName,
        gstAddress: gst.address,
      }));
      toast.success("✅ GST verified successfully!");
    } catch {
      toast.error("GST verification failed");
    }
  };

  const handleVerifyBank = async () => {
    try {
      const res = await axios.post("/api/dealers/kyc/verify-bank", {
        accountNumber: kycData.accountNumber,
        ifsc: kycData.ifsc,
      });
      if (res.data.verified) {
        setKycData((p) => ({ ...p, accountHolder: res.data.accountHolder }));
        toast.success("✅ Bank account verified!");
      } else toast.error("❌ Bank verification failed!");
    } catch {
      toast.error("Bank verification error");
    }
  };

  // 🔹 Document Uploads
  const handleUpload = () => {
    if (!file) return;
    const label =
      selectedDoc?.value === "other"
        ? customDocName || "Additional Document"
        : selectedDoc.label;

    const newDoc = {
      id: Date.now(),
      label,
      file,
      previewUrl: URL.createObjectURL(file),
    };
    setDocumentsMeta((p) => [...p, newDoc]);
    setSelectedDoc(null);
    setFile(null);
    setCustomDocName("");
  };

  const handleRemove = (id) => {
    setDocumentsMeta((p) => p.filter((doc) => doc.id !== id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ formData, kycData, documentsMeta });
    toast.success("Dealer onboarded successfully (mock)");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-blue-900 text-center mb-8">
          Dealer Onboarding
        </h1>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="flex bg-white rounded-lg p-1 border border-gray-300">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md ${
                    activeTab === tab.id
                      ? "bg-blue-800 text-white"
                      : "text-gray-600"
                  }`}
                >
                  <Icon className="w-4 h-4" /> {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* BASIC INFO */}
          {activeTab === "basic" && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Basic Information
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {staticBasicFields.map((f) => (
                  <InputField
                    key={f.name}
                    {...f}
                    value={formData[f.name] || ""}
                    onChange={handleChange}
                  />
                ))}
              </div>
            </div>
          )}

          {/* KYC INFO */}
          {activeTab === "kyc" && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-8">
              {/* Aadhaar */}
              <section>
                <h2 className="text-lg font-semibold mb-3">Aadhaar KYC</h2>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <FileUpload
                    label="Upload Aadhaar Front"
                    file={aadhaarFront}
                    onChange={(e) => setAadhaarFront(e.target.files[0])}
                  />
                  <FileUpload
                    label="Upload Aadhaar Back"
                    file={aadhaarBack}
                    onChange={(e) => setAadhaarBack(e.target.files[0])}
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <InputField
                    label="Aadhaar Number"
                    name="aadhaarNumber"
                    value={kycData.aadhaarNumber}
                    onChange={handleKycChange}
                  />
                  <InputField
                    label="Name"
                    name="aadhaarName"
                    value={kycData.aadhaarName}
                    onChange={handleKycChange}
                  />
                  <InputField
                    label="DOB"
                    name="aadhaarDob"
                    type="date"
                    value={kycData.aadhaarDob}
                    onChange={handleKycChange}
                  />
                  <InputField
                    label="Gender"
                    name="aadhaarGender"
                    value={kycData.aadhaarGender}
                    onChange={handleKycChange}
                  />
                  <InputField
                    label="Address"
                    name="aadhaarAddress"
                    value={kycData.aadhaarAddress}
                    onChange={handleKycChange}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleVerifyAadhaar}
                  className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg"
                >
                  Verify Aadhaar
                </button>
              </section>

              {/* PAN */}
              <section>
                <h2 className="text-lg font-semibold mb-3">PAN Verification</h2>
                <FileUpload
                  label="Upload PAN Card"
                  file={panFile}
                  onChange={(e) => setPanFile(e.target.files[0])}
                />
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <InputField
                    label="PAN Number"
                    name="panNumber"
                    value={kycData.panNumber}
                    onChange={handleKycChange}
                  />
                  <InputField
                    label="Name on PAN"
                    name="panName"
                    value={kycData.panName}
                    onChange={handleKycChange}
                  />
                  <InputField
                    label="Father’s Name"
                    name="panFatherName"
                    value={kycData.panFatherName}
                    onChange={handleKycChange}
                  />
                  <InputField
                    label="Date of Birth"
                    name="panDob"
                    type="date"
                    value={kycData.panDob}
                    onChange={handleKycChange}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleVerifyPan}
                  className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg"
                >
                  Verify PAN
                </button>
              </section>

              {/* GST */}
              <section>
                <h2 className="text-lg font-semibold mb-3">GST Verification</h2>
                <FileUpload
                  label="Upload GST Certificate"
                  file={gstFile}
                  onChange={(e) => setGstFile(e.target.files[0])}
                />
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <InputField
                    label="GST Number"
                    name="gstNumber"
                    value={kycData.gstNumber}
                    onChange={handleKycChange}
                  />
                  <InputField
                    label="Legal Name"
                    name="gstLegalName"
                    value={kycData.gstLegalName}
                    onChange={handleKycChange}
                  />
                  <InputField
                    label="Trade Name"
                    name="gstTradeName"
                    value={kycData.gstTradeName}
                    onChange={handleKycChange}
                  />
                  <InputField
                    label="Address"
                    name="gstAddress"
                    value={kycData.gstAddress}
                    onChange={handleKycChange}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleVerifyGST}
                  className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg"
                >
                  Verify GST
                </button>
              </section>

              {/* Bank */}
              <section>
                <h2 className="text-lg font-semibold mb-3">
                  Bank Account Verification
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <InputField
                    label="Bank Name"
                    name="bankName"
                    value={kycData.bankName}
                    onChange={handleKycChange}
                  />
                  <InputField
                    label="Account Number"
                    name="accountNumber"
                    value={kycData.accountNumber}
                    onChange={handleKycChange}
                  />
                  <InputField
                    label="IFSC Code"
                    name="ifsc"
                    value={kycData.ifsc}
                    onChange={handleKycChange}
                  />
                  <InputField
                    label="Account Holder"
                    name="accountHolder"
                    value={kycData.accountHolder}
                    onChange={handleKycChange}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleVerifyBank}
                  className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg"
                >
                  Verify Bank Account
                </button>
              </section>
            </div>
          )}

          {/* DOCUMENTS */}
          {activeTab === "documents" && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Upload Documents
              </h2>

              {/* Document Type Selector */}
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <Select
                  value={selectedDoc}
                  onChange={(opt) => setSelectedDoc(opt)}
                  options={documentOptions}
                  classNamePrefix="react-select"
                  styles={customSelectStyles}
                  placeholder="Select Document Type"
                />
                {selectedDoc?.value === "other" && (
                  <input
                    type="text"
                    placeholder="Enter document name"
                    className="border rounded-lg px-3 py-2"
                    value={customDocName}
                    onChange={(e) => setCustomDocName(e.target.value)}
                  />
                )}
              </div>

              {/* Upload Input */}
              <input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
              <button
                type="button"
                onClick={handleUpload}
                disabled={!file || (!selectedDoc && !customDocName)}
                className="px-4 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 disabled:opacity-50"
              >
                <PlusIcon className="inline-block w-4 h-4 mr-2" />
                Add Document
              </button>

              {/* Uploaded Documents Preview */}
              {documentsMeta.length > 0 && (
                <div className="mt-6 space-y-2">
                  <h3 className="font-medium text-gray-700 mb-2">
                    Uploaded Documents
                  </h3>
                  {documentsMeta.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                    >
                      <span>{doc.label}</span>
                      <div className="flex gap-3 items-center">
                        <a
                          href={doc.previewUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <EyeIcon className="w-5 h-5" />
                        </a>
                        <button
                          type="button"
                          onClick={() => handleRemove(doc.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <XIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 shadow-md"
            >
              Submit Dealer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DealerOnboarding;

