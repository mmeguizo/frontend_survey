export interface SurveyService {
  id: string;
  label: string;
  /**
   * INTERNAL/EXTERNAL classification. All services are tagged INTERNAL for
   * now; authoritative values are pending. When authoritative values are
   * provided, update only this field without redesigning the UI.
   */
  internalExternal: 'INTERNAL' | 'EXTERNAL';
}

export interface SurveyOffice {
  id: string;
  label: string;
  services: SurveyService[];
}

export const OFFICE_SERVICES: SurveyOffice[] = [
  {
    id: 'alumni-relations',
    label: 'Alumni Relations Office',
    services: [
      { id: 'release-of-yearbook-graduation-pictures', label: 'Request for Release of Yearbook & Graduation Pictures', internalExternal: 'INTERNAL' },
    ],
  },
  {
    id: 'business-affairs',
    label: 'Business Affairs Office',
    services: [
      { id: 'rental-of-facilities', label: 'Application for Rental of Facilities', internalExternal: 'INTERNAL' },
      { id: 'bookstore-services', label: 'Request for Bookstore Services', internalExternal: 'INTERNAL' },
      { id: 'printing-services', label: 'Request for Printing Services', internalExternal: 'INTERNAL' },
      { id: 'shop-services', label: 'Request for Shop Services', internalExternal: 'INTERNAL' },
    ],
  },
  {
    id: 'cao-administrative-division',
    label: 'Chief Administrative Officer – Administrative Division Office',
    services: [
      { id: 'booking-of-facilities-dining-function-hall', label: 'Application for Booking of Facilities (Dining and Function Hall)', internalExternal: 'INTERNAL' },
    ],
  },
  {
    id: 'dental-services',
    label: 'Dental Services Office',
    services: [
      { id: 'consultation-and-treatment', label: 'Request for Consultation and Treatment', internalExternal: 'INTERNAL' },
    ],
  },
  {
    id: 'financial-management-services-division',
    label: 'Financial Management Services Division',
    services: [
      { id: 'collection-of-school-and-other-fees', label: 'Collection of School and Other Fees', internalExternal: 'INTERNAL' },
      { id: 'releasing-of-checks-fund-transfer', label: 'Releasing of Checks / Fund Transfer', internalExternal: 'INTERNAL' },
      { id: 'assessment-of-student-fees', label: 'Request for Assessment of Student Fees', internalExternal: 'INTERNAL' },
      { id: 'signing-of-clearance-enrolled-students', label: 'Signing of Clearance of Enrolled Students', internalExternal: 'INTERNAL' },
    ],
  },
  {
    id: 'general-services',
    label: 'General Services Office',
    services: [
      { id: 'manpower-assistance', label: 'Request for Manpower Assistance', internalExternal: 'INTERNAL' },
      { id: 'repair-and-maintenance-services', label: 'Request for Repair and Maintenance Services', internalExternal: 'INTERNAL' },
    ],
  },
  {
    id: 'human-resource-management',
    label: 'Human Resource Management Office',
    services: [
      { id: 'certification', label: 'Request for Certification (employment; leave with or without pay; no pending administrative or criminal case)', internalExternal: 'INTERNAL' },
      { id: 'leave-credits-service-credit-balance', label: 'Request for Leave Credits / Service Credit Balance', internalExternal: 'INTERNAL' },
      { id: 'service-record', label: 'Request for Service Record', internalExternal: 'INTERNAL' },
    ],
  },
  {
    id: 'ict-office',
    label: 'Information and Communication Technology Office',
    services: [
      { id: 'ict-support-services', label: 'Request for ICT Support Services for Talisay Campus', internalExternal: 'INTERNAL' },
    ],
  },
  {
    id: 'library-services',
    label: 'Library Services Office',
    services: [
      { id: 'borrowing-of-books', label: 'Borrowing of Books', internalExternal: 'INTERNAL' },
      { id: 'returning-of-books', label: 'Returning of Books', internalExternal: 'INTERNAL' },
    ],
  },
  {
    id: 'medical-services',
    label: 'Medical Services Office',
    services: [
      { id: 'treatment-of-minor-injuries-common-ailments', label: 'Treatment of Minor Injuries and Common Ailments', internalExternal: 'INTERNAL' },
    ],
  },
  {
    id: 'office-of-guidance-service',
    label: 'Office of the Guidance Service',
    services: [
      { id: 'administration-of-admission-test', label: 'Administration of Admission Test', internalExternal: 'INTERNAL' },
      { id: 'request-for-counseling', label: 'Request for Counseling', internalExternal: 'INTERNAL' },
      { id: 'student-individual-inventory', label: 'Request for Student Individual Inventory (SII)', internalExternal: 'INTERNAL' },
    ],
  },
  {
    id: 'office-of-student-affairs-and-services',
    label: 'Office of the Students Affairs and Services',
    services: [
      { id: 'good-moral-certificate', label: 'Request for Issuance of Good Moral Certificate', internalExternal: 'INTERNAL' },
    ],
  },
  {
    id: 'university-deans-education',
    label: 'Office of the University Deans - Education',
    services: [
      { id: 'signing-of-students-clearance', label: "Signing of Student's Clearance", internalExternal: 'INTERNAL' },
    ],
  },
  {
    id: 'university-deans-engineering',
    label: 'Office of the University Deans - Engineering',
    services: [
      { id: 'signing-of-students-clearance', label: "Signing of Student's Clearance", internalExternal: 'INTERNAL' },
    ],
  },
  {
    id: 'procurement-management',
    label: 'Procurement Management Office',
    services: [
      { id: 'completion-of-procurement-issuance-of-po-ntp', label: 'Completion of Procurement and Issuance of Purchase Order (PO)/Notice to Proceed (NTP)', internalExternal: 'INTERNAL' },
      { id: 'processing-of-purchase-request', label: 'Request for Processing of Purchase Request', internalExternal: 'INTERNAL' },
      { id: 'sale-of-bidding-documents', label: 'Sale of Bidding Documents', internalExternal: 'INTERNAL' },
    ],
  },
  {
    id: 'property-and-supply-management',
    label: 'Property and Supply Management Office',
    services: [
      { id: 'receiving-of-deliveries', label: 'Receiving of Deliveries', internalExternal: 'INTERNAL' },
      { id: 'issuance-of-common-use-supplies-and-equipment', label: 'Request for Issuance of Common-use Supplies and Equipment', internalExternal: 'INTERNAL' },
      { id: 'signing-of-clearance-retiring-resigning', label: 'Signing of clearance for Retiring/Resigning Faculty and Staff', internalExternal: 'INTERNAL' },
    ],
  },
  {
    id: 'records-management',
    label: 'Records Management Office',
    services: [
      { id: 'request-for-authentication', label: 'Request for Authentication', internalExternal: 'INTERNAL' },
      { id: 'receiving-of-documents', label: 'Request for Receiving of Documents', internalExternal: 'INTERNAL' },
      { id: 'releasing-of-documents', label: 'Request for Releasing of Documents', internalExternal: 'INTERNAL' },
    ],
  },
  {
    id: 'registrar',
    label: "Registrar's Office",
    services: [
      { id: 'enrollment-of-continuing-students', label: 'Enrollment of (Regular and Irregular) Continuing Students', internalExternal: 'INTERNAL' },
      { id: 'certification-authentication-verification-cav', label: 'Request for Certification, Authentication, and Verification (CAV)', internalExternal: 'INTERNAL' },
      { id: 'official-transcript-of-record', label: 'Request for Official Transcript of Record (School Records)', internalExternal: 'INTERNAL' },
      { id: 'various-certification-and-documents', label: 'Request for Various Certification and Documents', internalExternal: 'INTERNAL' },
    ],
  },
];