export interface BusinessDetails {
  companyName: string;
  businessType: string;
  aboutBusiness: string;
  tradeLicenseNo: string;
  vatTrn: string;
  officePhone: string;
  registeredAddresses: RegisteredAddress[];
}

export interface RegisteredAddress {
  id: string;
  label: string;
  fullAddress: string;
}

export interface Contact {
  id: string;
  fullName: string;
  designation: string;
  mobileNumber: string;
  whatsappNumber: string;
  emailAddress: string;
}

export interface Document {
  id: string;
  name: string;
  type: 'trade_license' | 'vat_certificate' | 'passport_owner';
  status: 'pending' | 'uploaded' | 'review' | 'approved' | 'revoked';
  file?: any;
  errorMessage?: string;
}

export interface BankDetails {
  bankName: string;
  ibanNumber: string;
  beneficiaryName: string;
}

export type DocumentStatus =
  | 'pending'
  | 'uploaded'
  | 'review'
  | 'approved'
  | 'revoked';
