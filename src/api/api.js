import axios from "axios";
import axiosInstance from "./axiosInstance";
import { Email, Password } from "@mui/icons-material";

// ✅ Function to get OCR data
export const getKycOcrData = async (formData) => {
  try {
    const response = await axiosInstance.post("/ocr/extract", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("OCR request failed:", error);
    throw error;
  }
};

// ✅ Function to verify PAN
export const panVerify = async (body) => {
  console.log("this is body", body);
  const response = await axiosInstance.post("/kyc/pan-verify", body);
  return response.data;
};

export const getToken = async (body) => {
  const response = await axiosInstance.post("/auth/login", body);
  return response;
};
export const createUser = async (body) => {
  const res = await axiosInstance.post("/users/create", body);
  return res;
};

export async function sendDocumenstsDetails({
  formData,
  kycData,
  documentsMeta,
}) {
  const fd = new FormData();

  // Build payload JSON
  const payload = {
    formData,
    kycData,
    documentsMeta: documentsMeta.map((d) => ({
      type: d.type?.value || d.type, // e.g. "bank_statement"
      filename: d.file?.name || "", // helps map files to meta by index
    })),
  };
  fd.append("payload", JSON.stringify(payload));

  // Single-file fields (optional)
  if (formData.leadImage) fd.append("leadImage", formData.leadImage);
  if (kycData.aadhaarFront) fd.append("aadhaarFront", kycData.aadhaarFront);
  if (kycData.aadhaarBack) fd.append("aadhaarBack", kycData.aadhaarBack);
  if (kycData.pan) fd.append("pan", kycData.pan);

  // Variable documents – order matters (must align with documentsMeta array)
  documentsMeta.forEach((d) => {
    if (d.file) fd.append("documents", d.file);
  });

  // Send request
  const res = await axiosInstance.post("/leads", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export const fetchLeadFieldDefs = async () => {
  const { data } = await axiosInstance.get("/admin/lead-fields");
  return data;
};

export const createLead = async (payload) => {
  const { data } = await axiosInstance.post("/leads", payload);
  return data;
};

//get leads-field

export const getleadfield = async () => {
  const data = await axiosInstance.get("/lead-fields");
  return data;
};

export const addleadfield = async (payload) => {
  const data = await axiosInstance.post("/lead-fields", payload);
  return data;
};

export const deletefield = async (field) => {
  const data = await axiosInstance.delete(`/lead-fields/${field}`);
  return data;
};
