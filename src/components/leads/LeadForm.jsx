// src/pages/LeadForm.jsx
import React, { useState, useCallback, useEffect } from 'react';
import UploadIcon from '@mui/icons-material/CloudUploadOutlined';
import UserIcon from '@mui/icons-material/PersonOutline';
import CreditCardIcon from '@mui/icons-material/CreditCardOutlined';
import FileTextIcon from '@mui/icons-material/InsertDriveFileOutlined';
import PlusIcon from '@mui/icons-material/Add';
import XIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/CheckCircleOutline';
import Select from 'react-select';
import customSelectStyles from '../../utils/CustomCss';
import { getKycOcrData, panVerify, sendDocumenstsDetails } from '../../api/api';
import { toast } from 'react-toastify';
import Loader from './FadeLoaderCustom';
import { convertToDateInputFormat } from '../../utils/dateUtils';
import { getInputType } from '../../utils/index'

// Memoized InputField to prevent unnecessary re-renders
const InputField = React.memo(({ label, name, type = "text", value, onChange, required = false, options = null }) => {
  return (
    <div className="flex flex-col">
      <label className="text-sm mb-2 font-medium text-gray-700">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {options ? (
        <Select
          name={name}
          value={options.find(option => option.value === value)}
          onChange={(selectedOption) =>
            onChange({ target: { name, value: selectedOption?.value || '' } })
          }
          options={options}
          className="react-select-container"
          classNamePrefix="react-select"
          styles={customSelectStyles}
          isClearable
        />
      ) : type === 'textarea' ? (
        <textarea
          name={name}
          value={value || ''}
          onChange={onChange}
          rows={3}
          className="w-full px-3 py-2 border-gray-300 rounded-md border-2 transition-all focus:border-gray-500 focus:border-2 focus:outline-none"
          required={required}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value || ''}
          onChange={onChange}
          className="w-full px-3 py-2 border-gray-300 rounded-md border-2 transition-all focus:border-gray-500 focus:border-2 focus:outline-none"
          required={required}
        />
      )}
    </div>
  );
});

const FileUpload = ({ label, file, onChange, accept = "image/*" }) => (
  <div className="relative group">
    <input
      type="file"
      onChange={onChange}
      accept={accept}
      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
    />
    <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 ${file ? 'border-green-300 bg-green-50' : 'border-gray-300 bg-gray-50 group-hover:border-blue-400 group-hover:bg-blue-50'}`}>
      {file ? (
        <div className="space-y-2">
          <CheckIcon className="w-8 h-8 text-green-500 mx-auto" />
          <p className="text-sm font-medium text-green-700">{file.name}</p>
        </div>
      ) : (
        <div className="space-y-2">
          <UploadIcon className="w-8 h-8 text-gray-400 mx-auto" />
          <p className="text-sm text-gray-600">{label}</p>
        </div>
      )}
    </div>
  </div>
);

const LeadForm = () => {
  const [activeTab, setActiveTab] = useState('basic');
  const [aadhaarExtract, setAadhaarExtract] = useState(true);
  const [panExtract, setPanExtract] = useState(true);
  const [kycData, setKycData] = useState({
    aadhaarFront: null,
    aadhaarBack: null,
    pan: null,
    name: '',
    gender: '',
    dob: '',
    aadhaarNumber: '',
    address: '',
    panNumber: '',
    panHolderName: '',
    panFatherName: '',
    panDob: '',
  });
  const [formData, setFormData] = useState({
    leadImage: null,
    leadOwner: "",
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    company: "",
    street: "",
    city: "",
    state: "",
    country: "",
    zipCode: "",
    description: "",
  });
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [file, setFile] = useState(null);
  const [documentsMeta, setdocumentsMeta] = useState([]);

  // Define tabs array
  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: UserIcon },
    { id: 'kyc', label: 'KYC', icon: CreditCardIcon },
    { id: 'documents', label: 'Documents', icon: FileTextIcon },
  ];

  const documentOptions = [
    { value: 'aadhar_card', label: 'Aadhaar Card' },
    { value: 'pan_card', label: 'PAN Card' },
    { value: 'bank_statement', label: 'Bank Statement' },
    { value: 'salary_slip', label: 'Salary Slip' },
    { value: 'property_documents', label: 'Property Documents' },
  ];

  // Static fields definition
  const staticBasicFields = [
    { name: 'leadOwner', label: 'Lead Owner', type: 'text', required: false },
    { name: 'firstName', label: 'First Name', type: 'text', required: true },
    { name: 'lastName', label: 'Last Name', type: 'text', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'mobile', label: 'Mobile', type: 'tel', required: true },
    { name: 'company', label: 'Company', type: 'text', required: false },
  ];

  // Memoize handlers
  const handleFormDataChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleKycChange = useCallback((e) => {
    const { name, value } = e.target;
    setKycData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleFileChange = useCallback((e, key) => {
    const file = e.target.files?.[0] || null;
    setKycData(prev => ({ ...prev, [key]: file }));
  }, []);

  const handleImageChange = useCallback((e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFormData(prev => ({ ...prev, leadImage: e.target.files[0] }));
    }
  }, []);

  const handleDocumentUpload = useCallback(() => {
    if (!selectedDocument || !file) return;
    const newDocument = {
      id: Date.now().toString(),
      type: selectedDocument,
      file: file,
      uploadedAt: new Date(),
    };
    setdocumentsMeta(prev => [...prev, newDocument]);
    setSelectedDocument(null);
    setFile(null);
  }, [selectedDocument, file]);

  const handleRemoveDocument = useCallback((id) => {
    setdocumentsMeta(prev => prev.filter(doc => doc.id !== id));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    try {
      const payload = { formData, kycData, documentsMeta };
      console.log("-",payload)
      const res = await sendDocumenstsDetails(payload);
      toast.success("Successfully uploaded lead!");
      console.log(res);
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Failed to submit lead");
    }
  }, [formData, kycData, documentsMeta]);

  const handleVerify = useCallback(async () => {
    const body = {
      panNumber: kycData.panNumber,
      fullName: kycData.panHolderName,
      dob: kycData.panDob,
    };

    const verifyPan = async () => {
      const response = await panVerify(body);
      const profileMatches = response?.result?.profileMatch || [];
      const nameMatch = profileMatches.find(p => p.parameter === "name");
      const dobMatch = profileMatches.find(p => p.parameter === "dob");
      if (nameMatch?.matchResult && dobMatch?.matchResult) {
        return "PAN verified successfully!";
      } else {
        throw new Error("PAN Name or DOB does not match");
      }
    };

    toast.promise(
      verifyPan(),
      {
        pending: 'Verifying PAN details...',
        success: (msg) => msg,
        error: (err) => err.message || "PAN verification failed",
      }
    );
  }, [kycData]);

  // Aadhaar OCR trigger
  useEffect(() => {
    const fetchAadhaarOCR = async () => {
      if (!aadhaarExtract) return;
      if (kycData.aadhaarFront && kycData.aadhaarBack) {
        const formData = new FormData();
        formData.append("aadhaarFront", kycData.aadhaarFront);
        formData.append("aadhaarBack", kycData.aadhaarBack);
        try {
          const response = await getKycOcrData(formData);
          if (response?.aadhaarData) {
            const { name, gender, dob, aadhaarNumber, address } = response.aadhaarData;
            setKycData(prev => ({
              ...prev,
              name: name || prev.name,
              gender: gender || prev.gender,
              dob: convertToDateInputFormat(dob) || prev.dob,
              aadhaarNumber: aadhaarNumber || prev.aadhaarNumber,
              address: address || prev.address,
            }));
          }
        } catch (error) {
          console.error("Aadhaar OCR failed:", error);
          toast.error("Failed to extract Aadhaar data");
        }
      }
    };
    fetchAadhaarOCR();
  }, [aadhaarExtract, kycData.aadhaarFront, kycData.aadhaarBack]);

  // PAN OCR trigger
  useEffect(() => {
    const fetchPanOCR = async () => {
      if (!panExtract) return;
      if (kycData.pan) {
        const formData = new FormData();
        formData.append("pan", kycData.pan);
        try {
          const response = await getKycOcrData(formData);
          if (response?.panData) {
            const { panNumber, dob, name, fatherName } = response.panData;
            setKycData(prev => ({
              ...prev,
              panNumber: panNumber || prev.panNumber,
              panDob: convertToDateInputFormat(dob) || prev.panDob,
              panHolderName: name || prev.panHolderName,
              panFatherName: fatherName || prev.panFatherName,
            }));
          }
        } catch (error) {
          console.error("PAN OCR failed:", error);
          toast.error("Failed to extract PAN data");
        }
      }
    };
    fetchPanOCR();
  }, [panExtract, kycData.pan]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-900 mb-2">Onboard Dealers</h1>
        </div>
        <div className="flex justify-center mb-8">
          <div className="flex bg-white rounded-lg p-1 border-gray-300 border-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${activeTab === tab.id
                      ? 'bg-blue-800 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="space-y-8 w-full">
            {activeTab === 'basic' && (
              <div className="bg-white rounded-xl border-gray-300 border-2 p-6 space-y-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Basic Information</h2>
                <>
                  {/* File Upload for leadImage */}
                  <div className="flex items-center space-x-4">
                    {formData.leadImage ? (
                      <img
                        src={URL.createObjectURL(formData.leadImage)}
                        alt="Profile"
                        className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                        <UserIcon className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <input
                        type="file"
                        onChange={handleImageChange}
                        accept="image/*"
                        className="hidden"
                        id="profile-upload"
                      />
                      <label
                        htmlFor="profile-upload"
                        className="inline-flex items-center px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors"
                      >
                        <UploadIcon className="w-4 h-4 mr-1" />
                        Upload Photo
                      </label>
                    </div>
                  </div>

                  {/* Basic Information Fields */}
                  <div className="grid md:grid-cols-2 gap-4">
                    {staticBasicFields.map((field) => (
                      <InputField
                        key={field.name}
                        label={field.label}
                        name={field.name}
                        type={field.type}
                        value={formData[field.name] || ''}
                        onChange={handleFormDataChange}
                        required={field.required}
                      />
                    ))}
                  </div>

                  {/* Description Field (Textarea) */}
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Description</label>
                    <InputField
                      name="description"
                      type="textarea"
                      value={formData.description || ''}
                      onChange={handleFormDataChange}
                      required={false}
                    />
                  </div>
                </>
              </div>
            )}
            {activeTab === 'kyc' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl border-gray-300 border-2 p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <UserIcon className="w-5 h-5 mr-2 text-blue-500" />
                    Aadhaar Card
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <FileUpload
                      label="Upload Aadhaar Front"
                      file={kycData.aadhaarFront}
                      onChange={(e) => handleFileChange(e, 'aadhaarFront')}
                    />
                    <FileUpload
                      label="Upload Aadhaar Back"
                      file={kycData.aadhaarBack}
                      onChange={(e) => handleFileChange(e, 'aadhaarBack')}
                    />
                  </div>
                  <label className="inline-flex items-center mb-5 cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={aadhaarExtract}
                      onChange={(e) => setAadhaarExtract(e.target.checked)}
                    />
                    <div className="relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-300 dark:peer-focus:ring-blue-800 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-900"></div>
                    <span className="ms-3 text-sm font-medium text-gray-300 dark:text-gray-500">
                      Extract from Document (OCR)
                    </span>
                  </label>
                  <div className="grid md:grid-cols-2 gap-4">
                    <InputField
                      label="Full Name"
                      name="name"
                      value={kycData.name}
                      onChange={handleKycChange}
                    />
                    <InputField
                      label="Gender"
                      name="gender"
                      value={kycData.gender}
                      onChange={handleKycChange}
                      options={[
                        { value: 'Male', label: 'Male' },
                        { value: 'Female', label: 'Female' },
                        { value: 'Other', label: 'Other' },
                      ]}
                    />
                    <InputField
                      label="Date of Birth"
                      name="dob"
                      type="date"
                      value={kycData.dob}
                      onChange={handleKycChange}
                    />
                    <InputField
                      label="Aadhaar Number"
                      name="aadhaarNumber"
                      value={kycData.aadhaarNumber}
                      onChange={handleKycChange}
                    />
                  </div>
                  <div className="mt-4">
                    <InputField
                      label="Address"
                      name="address"
                      value={kycData.address}
                      onChange={handleKycChange}
                    />
                  </div>
                  <div className="flex justify-start mt-3">
                    <button
                      type="button"
                      className="px-4 py-2 bg-green-400 text-white rounded-lg font-medium hover:bg-green-700 duration-200 shadow-lg"
                    >
                      Verify Aadhaar
                    </button>
                  </div>
                </div>
                <div className="bg-white rounded-xl border-gray-300 border-2 p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <CreditCardIcon className="w-5 h-5 mr-2 text-purple-500" />
                    PAN Card
                  </h3>
                  <div className="mb-6">
                    <FileUpload
                      label="Upload PAN Card"
                      file={kycData.pan}
                      onChange={(e) => handleFileChange(e, 'pan')}
                    />
                  </div>
                  <label className="inline-flex items-center mb-5 cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={panExtract}
                      onChange={(e) => setPanExtract(e.target.checked)}
                    />
                    <div className="relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-300 dark:peer-focus:ring-blue-800 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-900"></div>
                    <span className="ms-3 text-sm font-medium text-gray-300 dark:text-gray-500">
                      Extract from Document (OCR)
                    </span>
                  </label>
                  <div className="grid md:grid-cols-2 gap-4">
                    <InputField
                      label="PAN Number"
                      name="panNumber"
                      value={kycData.panNumber}
                      onChange={handleKycChange}
                    />
                    <InputField
                      label="PAN Holder Name"
                      name="panHolderName"
                      value={kycData.panHolderName}
                      onChange={handleKycChange}
                    />
                    <InputField
                      label="Father's Name"
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
                  <div className="flex justify-start mt-3">
                    <button
                      type="button"
                      onClick={handleVerify}
                      className="px-4 py-2 bg-green-400 text-white rounded-lg font-medium hover:bg-green-700 duration-200 shadow-lg"
                    >
                      Verify PAN
                    </button>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'documents' && (
              <div className="bg-white rounded-xl border-gray-300 border-2 p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Additional Documents</h2>
                <div className="space-y-4 mb-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700">Document Type</label>
                      <Select
                        value={selectedDocument}
                        onChange={(option) => setSelectedDocument(option)}
                        options={documentOptions}
                        className="react-select-container"
                        classNamePrefix="react-select"
                        styles={customSelectStyles}
                        isClearable
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700">Upload File</label>
                      <input
                        type="file"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleDocumentUpload}
                    disabled={!selectedDocument || !file}
                    className="inline-flex items-center px-4 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Add Document
                  </button>
                </div>
                {documentsMeta.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-medium text-gray-800">Uploaded Documents</h3>
                    {documentsMeta.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileTextIcon className="w-5 h-5 text-blue-500" />
                          <div>
                            <p className="font-medium text-gray-800">{doc.type.label}</p>
                            <p className="text-sm text-gray-600">{doc.file.name}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveDocument(doc.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <XIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-800 text-white rounded-lg font-medium hover:bg-blue-900 duration-200 shadow-lg"
              >
                Submit Lead
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeadForm;