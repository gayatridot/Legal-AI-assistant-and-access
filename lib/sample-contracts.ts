/**
 * @fileoverview Realistic Legal Contract Templates for Instant Testing & Demonstration.
 * Includes Commercial Leases, NDAs, Freelance Services, and Employment Agreements.
 */

export interface SampleContract {
  id: string;
  title: string;
  category: string;
  description: string;
  badge: string;
  text: string;
}

export const SAMPLE_CONTRACTS: SampleContract[] = [
  {
    id: 'commercial-lease',
    title: 'Commercial Retail Store Lease Agreement',
    category: 'Real Estate & Property',
    badge: 'High Risk Traps',
    description: 'Contains aggressive auto-renewal clauses, triple-net maintenance surprises, and unilateral landlord indemnity.',
    text: `COMMERCIAL LEASE AGREEMENT

This Commercial Lease Agreement (the "Agreement") is entered into as of January 15, 2026, by and between METROPOLIS REALTY HOLDINGS LLC ("Landlord"), and GREENLEAF COFFEE ROASTERS LLC ("Tenant").

SECTION 1. LEASED PREMISES AND TERM
Landlord hereby leases to Tenant the commercial suite located at 742 Evergreen Blvd, Suite 102. The initial term of this Lease shall be thirty-six (36) months commencing March 1, 2026.

SECTION 2. AUTOMATIC RENEWAL AND ESCALATION
Unless Tenant provides written notice of non-renewal via certified mail exactly one hundred and eighty (180) days prior to the expiration of the Initial Term, this Lease shall automatically renew for an additional sixty (60) month term. Upon any renewal, Base Rent shall automatically escalate by nine percent (9%) per annum, compounded annually.

SECTION 3. TRIPLE NET (NNN) OPERATING EXPENSES AND CAPITAL EXPENDITURES
In addition to Base Rent, Tenant shall pay its proportionate share (42%) of all Operating Expenses. Operating Expenses shall include, without limitation, all real estate taxes, property insurance, routine HVAC maintenance, and any capital improvements or structural roof replacements undertaken by Landlord during the term. Landlord shall provide an annual estimate, and Tenant shall pay within five (5) days of billing. Failure to dispute any expense in writing within ten (10) days shall constitute irrevocable acceptance.

SECTION 4. UNILATERAL INDEMNIFICATION AND WAIVER OF SUBROGATION
Tenant shall defend, indemnify, and hold harmless Landlord, its agents, directors, and lenders from and against any and all claims, liabilities, lawsuits, damages, environmental cleanup costs, and attorney's fees arising out of Tenant's occupancy or operations, regardless of whether caused in part by the active negligence or omission of Landlord. Landlord shall have zero reciprocal indemnification duty toward Tenant.

SECTION 5. IMMEDIATE TERMINATION AND RE-ENTRY
Upon any failure by Tenant to pay rent within three (3) business days of the due date, Landlord may, at its sole discretion, terminate this Agreement immediately without prior notice or cure period, lock out Tenant, accelerate all rent remaining due over the entire 5-year lease term, and seize Tenant's equipment and inventory as liquidated damages.

SECTION 6. JURY TRIAL WAIVER AND EXCLUSIVE VENUE
Tenant expressly waives any and all constitutional rights to a trial by jury in any action or proceeding arising out of or related to this Lease. Any legal action must be brought exclusively in the state courts of Dover, Delaware, and Tenant waives any objection based on forum non conveniens.`,
  },
  {
    id: 'freelance-master-agreement',
    title: 'Master Independent Contractor Agreement',
    category: 'Gig & Technology',
    badge: 'IP & Liability Flags',
    description: 'Contains unlimited contractor liability, immediate assignment of prior IP, and severe non-compete covenants.',
    text: `MASTER INDEPENDENT CONTRACTOR SERVICES AGREEMENT

This Master Services Agreement ("Agreement") is made between APEX ENTERPRISE SYSTEMS INC. ("Company") and JANE DOE CONSULTING ("Contractor").

SECTION 1. ENGAGEMENT AND DELIVERABLES
Contractor agrees to perform custom software engineering and systems architecture as specified in individual Statements of Work ("SOW"). Contractor shall devote full business time and best efforts exclusively to Company.

SECTION 2. INTELLECTUAL PROPERTY AND MORAL RIGHTS ASSIGNMENT
Contractor agrees that all deliverables, code, algorithms, notes, inventions, and derivative works conceived or developed during the term, whether during business hours or personal time, constitute "Works Made for Hire". To the extent any work does not qualify, Contractor hereby irrevocably transfers and assigns to Company in perpetuity, worldwide, all right, title, and interest in and to such works, including all moral rights. This assignment takes effect immediately upon creation, irrespective of whether Company has paid Contractor's invoices.

SECTION 3. INDEMNIFICATION AND UNLIMITED CONSEQUENTIAL DAMAGES
Contractor shall indemnify, defend, and hold Company and its affiliates harmless against any third-party claim, infringement allegation, or loss. IN NO EVENT SHALL COMPANY'S AGGREGATE LIABILITY EXCEED $500. IN CONTRAST, CONTRACTOR'S LIABILITY FOR BREACH OR INDEMNITY SHALL BE UNLIMITED AND SHALL INCLUDE INCIDENTAL, PUNITIVE, AND CONSEQUENTIAL DAMAGES.

SECTION 4. NON-COMPETE AND NON-SOLICITATION
During the term of this Agreement and for a period of twenty-four (24) months following termination for any reason, Contractor shall not directly or indirectly provide consulting, advisory, or software services to any entity that develops enterprise software or competes in any manner with Company anywhere in North America.

SECTION 5. PAYMENT AND LATE BILLING FORFEITURE
Invoices must be submitted within seven (7) days of milestone completion. Any invoice submitted later than fourteen (14) days shall be deemed permanently waived and forfeited by Contractor. Company shall pay undisputed invoices within ninety (90) days (Net 90).`,
  },
  {
    id: 'mutual-nda',
    title: 'Corporate Mutual Non-Disclosure Agreement',
    category: 'Corporate & M&A',
    badge: 'Balanced / Standard',
    description: 'Standard NDA with perpetual confidentiality definition and trade secret carve-outs.',
    text: `MUTUAL NON-DISCLOSURE AGREEMENT

This Mutual Non-Disclosure Agreement ("Agreement") is entered into as of February 10, 2026, between SYNAPSE DYNAMICS INC. ("Disclosing Party" or "Receiving Party") and VELOCITY VENTURES LLC ("Disclosing Party" or "Receiving Party").

SECTION 1. PURPOSE
The parties wish to explore a potential strategic business collaboration and investment transaction (the "Purpose") and desire to protect proprietary and confidential business information exchanged in connection therewith.

SECTION 2. DEFINITION OF CONFIDENTIAL INFORMATION
"Confidential Information" means all non-public, technical, financial, customer, or business information disclosed by either party, whether orally or in writing, that is designated as confidential or that reasonably should be understood to be confidential given the nature of the information.

SECTION 3. EXCLUSIONS FROM CONFIDENTIALITY
Confidential Information does not include information that: (a) is or becomes publicly known through no breach by Receiving Party; (b) was already in Receiving Party's lawful possession prior to disclosure; (c) is independently developed without reference to Confidential Information; or (d) is rightfully received from an unrestricted third party.

SECTION 4. OBLIGATIONS AND DUTY OF CARE
Each party agrees: (a) to protect Confidential Information with the same degree of care it uses for its own confidential assets, but not less than reasonable care; (b) to use Confidential Information solely for the Purpose; and (c) to restrict access to employees and legal counsel with a legitimate need to know.

SECTION 5. TERM AND SURVIVAL
This Agreement shall govern disclosures made within two (2) years of the effective date. The confidentiality obligations herein shall survive for three (3) years from disclosure, provided that obligations regarding Trade Secrets shall endure for so long as permitted under applicable law.

SECTION 6. INJUNCTIVE RELIEF AND GOVERNING LAW
Both parties recognize that unauthorized disclosure may cause irreparable harm for which monetary damages alone would be inadequate. Therefore, the non-breaching party shall be entitled to seek temporary and permanent injunctive relief. This Agreement is governed by the laws of the State of California.`,
  },
];
