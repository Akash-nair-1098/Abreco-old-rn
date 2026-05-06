export interface LoginPayload {
//   role: number | undefined;
  username: string;
  password: string;
  language: string;
}


export interface RegisterPayload {
  company_name: string;
  email: string;
  ph_cc: string;
  phone_number: string;
  otp: string;
  password: string;
  confirm_password: string;
  is_terms_and_condition_agreed: boolean;
}

export interface BusinessAddress {
  location_name: string;
  address: string;
  city?: string;
  phone_number: string;
  latitude?: string;
  longitude?: string;
  id?: string;
}

export interface BusinessInfoPayload {
  secret_token: string;
  user_id: string;
  phone_number: string;
  first_name: string;
  business_type: string;
  about_business: string;
  trade_license_number: string;
  trade_license_expiry?: string; 
  vat_trn: string;
  vat_expiry?: string;
  office_phone_number: string;
  addresses: BusinessAddress[];
}
export interface ContactItem {
  full_name: string;
  designation: string;
  phone_number: string;
  whatsapp_number: string;
  email: string;
}

export interface ContactInfoPayload {
  secret_token: string;
  user_id:  string;
  phone_number: string;
  contacts: ContactItem[];
}

export interface BankInfoPayload {
  secret_token: string;
  user_id:  string;
  phone_number: string;
  bank_name: string;
  iban_number: string;
  beneficiary_name: string;
}

export interface SendOtpPayload {
  email: string;
  ph_cc: string;
  phone_number: string;
}