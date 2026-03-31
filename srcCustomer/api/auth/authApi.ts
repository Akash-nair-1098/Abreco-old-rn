import api from "../axiosConf";
import { BankInfoPayload, BusinessInfoPayload, ContactInfoPayload, LoginPayload, RegisterPayload, SendOtpPayload } from "./auth.type";



export const login = async (payload: LoginPayload) => {
  console.log('login api called with', payload);
  const response = await api.post('customers/login', payload);
  console.log('response is', response);
  
  return response.data.results.data;
};


export const registerCustomer = async (data: RegisterPayload) => {
    const response = await api.post('customers/register', data);
   return response.data.results.data;
};


export const registerBusinessInfo = async (data: BusinessInfoPayload) => {
  // Calling the specific endpoint for business info
  const response = await api.put('customers/register-business-info', data);

  // Following your required return pattern
  return response.data.results.data;
};

export const registerContactInfo = async (data: ContactInfoPayload) => {
  // Calling the contact info endpoint
  const response = await api.put('customers/register-contact-info', data);

  // Returning the nested results data as per your pattern
  return response.data.results.data;
};

export const registerKYCDocuments = async (formData: FormData) => {
  // IMPORTANT: Do not set Content-Type header manually when using FormData
  // with Axios; it needs to set the boundary automatically.
  const response = await api.put('customers/register-documents', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data.results.data;
};

export const registerBankDetails = async (data: BankInfoPayload) => {
  console.log('resg bank pay;oad is', data)
  const response = await api.put('customers/register-bank-details', data);
  console.log('bank response is', response)
  return response.data.results.data;
};


export const sendOtpApi = async (data: SendOtpPayload) => {
  // Assuming 'api' is your pre-configured axios instance
  const response = await api.post('https://api.horecahub.ae/api/send-otp', data);
  return response.data;
};


export const getLegalDocs = async () => {
  const response = await api.get('customers/legal-docs');
  
  return response.data.results.data;;
};

export const deleteAccountApi = async () => {
  try {
    const response = await api.delete('customers/delete-account');
    console.log('resp is', response);
    return response.data;
  } catch (error) {
    throw error; // Let the component or thunk handle the error
  }
};


export const setNewPassword = async (data: any) => {
  const response = await api.post('set-new-password', data);
  return response.data;
};


export const getRegisterChoiceList = async () => {
  const response = await api.get('customers/register-choice-list');
  return response.data;
};

 
export const fetchSavedRegistrationData = async (user_id: string | number) => {
  const response = await api.get(`customers/register-fetch-saved-data?user_id=${user_id}`);
  return response.data;
};

export const fetchRegistrationStatus = async (user_id: string) => {
  const response = await api.get(`customers/customer-status-summary?user_id=${user_id}`);
  return response.data;
};