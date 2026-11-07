/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  UserPlus, 
  CheckCircle, 
  ArrowLeft, 
  ArrowRight, 
  Copy, 
  Check, 
  CreditCard, 
  Calendar, 
  User, 
  Building, 
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Award
} from 'lucide-react';
import { apiService, EnrolStudentPayload } from '../../services/apiService';

interface StudentEnrolmentFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const StudentEnrolmentForm: React.FC<StudentEnrolmentFormProps> = ({
  onSuccess,
  onCancel
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Success Modal State with Generated Credentials
  const [createdStudentResult, setCreatedStudentResult] = useState<{
    student: any;
    credentials: { studentId: string; username: string; aliasUsername?: string; temporaryPassword?: string };
  } | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Form State matching Screenshot 4
  // Step 1: Personal Details
  const [source, setSource] = useState('Walk-in');
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [dob, setDob] = useState('2000-01-01');
  const [email, setEmail] = useState('');
  const [dontHaveEmail, setDontHaveEmail] = useState(false);
  const [contact, setContact] = useState('');
  const [dontHaveContact, setDontHaveContact] = useState(false);
  const [qualification, setQualification] = useState('Graduate');
  const [address, setAddress] = useState('Main Market Road');
  const [city, setCity] = useState('Banur');
  const [pincode, setPincode] = useState('140601');
  const [state, setState] = useState('Punjab');

  // Step 2: Course & Payment Details
  const [course, setCourse] = useState<'CD-IELTS Academic' | 'CD-IELTS General Training' | 'PTE Academic' | 'CELPIP' | 'Spoken English' | 'Computer Courses' | string>('CD-IELTS Academic');
  const [pack, setPack] = useState('CD-IELTS AC Pay Per Use 30 Mock & 150 Practice Tests(Demo)');
  const [fee, setFee] = useState<number>(1);
  const [discount, setDiscount] = useState<number>(0);
  const [paymentStatus, setPaymentStatus] = useState<'Paid' | 'Partial' | 'Pending'>('Paid');
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'UPI' | 'Card' | 'Net Banking'>('Cash');

  // Step 3: Batch Details
  const [batch, setBatch] = useState('CD-IELTS_Academic_default');
  const [enrolmentDate, setEnrolmentDate] = useState(new Date().toISOString().split('T')[0]);
  const [courseStartDate, setCourseStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [courseEndDate, setCourseEndDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 2);
    return d.toISOString().split('T')[0];
  });
  const [accountStatus, setAccountStatus] = useState<'Active' | 'Inactive'>('Active');

  const handleNextStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError('Student Name is required.');
      return;
    }
    if (!dontHaveContact && !contact.trim()) {
      setError('Contact Number is required (or check "Don\'t have").');
      return;
    }
    setCurrentStep(2);
  };

  const handleNextStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCurrentStep(3);
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const payload: EnrolStudentPayload = {
      name,
      gender,
      dob,
      email: dontHaveEmail ? 'N/A' : email,
      contact: dontHaveContact ? 'N/A' : contact,
      qualification,
      source,
      address,
      city,
      state,
      pincode,
      course,
      courseType: course === 'CD-IELTS General Training' ? 'ielts_general' : course === 'PTE Academic' ? 'pte_academic' : 'ielts_academic',
      pack,
      fee: Number(fee),
      discount: Number(discount),
      paymentStatus,
      paymentMode,
      batch,
      enrolmentDate,
      courseStartDate,
      courseEndDate,
      accountStatus
    };

    try {
      const response = await apiService.enrolStudent(payload);
      setIsSubmitting(false);
      setCreatedStudentResult({
        student: response.student,
        credentials: response.generatedCredentials
      });
    } catch (err: any) {
      setIsSubmitting(false);
      setError(err.message || 'Failed to complete enrolment.');
    }
  };

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-800">
      
      {/* Header & Breadcrumb matching Screenshot 4 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Enrolment Form</h1>
          <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
            <span>Dashboard</span>
            <span>/</span>
            <span>Enrolment</span>
            <span>/</span>
            <span className="text-amber-700 font-semibold">Add Student</span>
          </div>
        </div>

        <button
          onClick={onCancel}
          className="text-xs font-semibold px-4 py-2 border border-slate-300 rounded-xl hover:bg-slate-50 text-slate-700 transition"
        >
          Cancel & Return to Student List
        </button>
      </div>

      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
          {error}
        </div>
      )}

      {/* 3 Steps Wizard Header matching Screenshot 4 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 bg-slate-200 p-1 rounded-2xl text-xs font-bold select-none">
        <button
          onClick={() => setCurrentStep(1)}
          className={`py-3 px-4 rounded-xl transition flex items-center justify-center gap-2 ${
            currentStep === 1
              ? 'bg-[#1e293b] text-white shadow'
              : 'bg-white/60 text-slate-600 hover:bg-white'
          }`}
        >
          <span>1. Personal Information</span>
        </button>

        <button
          onClick={() => currentStep > 1 && setCurrentStep(2)}
          className={`py-3 px-4 rounded-xl transition flex items-center justify-center gap-2 ${
            currentStep === 2
              ? 'bg-[#1e293b] text-white shadow'
              : 'bg-white/60 text-slate-600 hover:bg-white'
          }`}
        >
          <span>2. Course/Payment Details</span>
        </button>

        <button
          onClick={() => currentStep > 2 && setCurrentStep(3)}
          className={`py-3 px-4 rounded-xl transition flex items-center justify-center gap-2 ${
            currentStep === 3
              ? 'bg-[#1e293b] text-white shadow'
              : 'bg-white/60 text-slate-600 hover:bg-white'
          }`}
        >
          <span>3. Batch Details</span>
        </button>
      </div>

      {/* STEP 1: PERSONAL INFORMATION */}
      {currentStep === 1 && (
        <form onSubmit={handleNextStep1} className="bg-[#1c2431] text-white p-6 sm:p-8 rounded-2xl shadow-xl space-y-6 border border-slate-700">
          
          {/* Reference Details */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold tracking-wider text-amber-400 uppercase flex items-center gap-1.5">
              <span># REFERENCE DETAILS</span>
            </h3>
            
            <div className="max-w-md">
              <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Source</label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full bg-white text-slate-900 text-xs px-3.5 py-2.5 rounded-full border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
              >
                <option value="Walk-in">Walk-in</option>
                <option value="Social Media">Social Media</option>
                <option value="Website">Website</option>
                <option value="Referral">Referral</option>
                <option value="Call Enquiry">Call Enquiry</option>
                <option value="Newspaper Ad">Newspaper Ad</option>
              </select>
            </div>
          </div>

          {/* Personal Details */}
          <div className="space-y-4 pt-4 border-t border-slate-700">
            <h3 className="text-xs font-bold tracking-wider text-amber-400 uppercase flex items-center gap-1.5">
              <span>🗎 PERSONAL DETAILS</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Name */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1">*NAME</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jaspreet Singh"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white text-slate-900 text-xs px-4 py-2.5 rounded-full border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1">GENDER</label>
                <div className="grid grid-cols-2 gap-2 bg-white p-1 rounded-full border border-slate-300">
                  <button
                    type="button"
                    onClick={() => setGender('Male')}
                    className={`py-1.5 rounded-full text-xs font-bold transition ${
                      gender === 'Male' ? 'bg-[#1c2431] text-white shadow-sm' : 'text-slate-700 hover:text-black'
                    }`}
                  >
                    Male
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender('Female')}
                    className={`py-1.5 rounded-full text-xs font-bold transition ${
                      gender === 'Female' ? 'bg-[#1c2431] text-white shadow-sm' : 'text-slate-700 hover:text-black'
                    }`}
                  >
                    Female
                  </button>
                </div>
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1">DATE OF BIRTH</label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full bg-white text-slate-900 text-xs px-4 py-2.5 rounded-full border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                />
              </div>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Email */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold uppercase text-slate-300">*EMAIL</label>
                  <label className="text-[10px] text-slate-400 flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={dontHaveEmail}
                      onChange={(e) => setDontHaveEmail(e.target.checked)}
                      className="accent-amber-500"
                    />
                    <span>Don't have</span>
                  </label>
                </div>
                <input
                  type="email"
                  disabled={dontHaveEmail}
                  placeholder={dontHaveEmail ? 'N/A' : 'student@example.com'}
                  value={dontHaveEmail ? '' : email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white disabled:bg-slate-200 text-slate-900 text-xs px-4 py-2.5 rounded-full border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                />
              </div>

              {/* Contact */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold uppercase text-slate-300">*CONTACT</label>
                  <label className="text-[10px] text-slate-400 flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={dontHaveContact}
                      onChange={(e) => setDontHaveContact(e.target.checked)}
                      className="accent-amber-500"
                    />
                    <span>Don't have</span>
                  </label>
                </div>
                <input
                  type="tel"
                  disabled={dontHaveContact}
                  placeholder={dontHaveContact ? 'N/A' : '8054284657'}
                  value={dontHaveContact ? '' : contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="w-full bg-white disabled:bg-slate-200 text-slate-900 text-xs px-4 py-2.5 rounded-full border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                />
              </div>

              {/* Qualification */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1">HIGHEST QUALIFICATION</label>
                <select
                  value={qualification}
                  onChange={(e) => setQualification(e.target.value)}
                  className="w-full bg-white text-slate-900 text-xs px-3.5 py-2.5 rounded-full border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                >
                  <option value="10th Matric">10th Matric</option>
                  <option value="12th Senior Secondary">12th Senior Secondary</option>
                  <option value="Diploma">Diploma / Polytechnic</option>
                  <option value="Graduate">Graduate (B.A / B.Com / B.Sc / B.Tech)</option>
                  <option value="Post Graduate">Post Graduate (M.A / M.Sc / MBA)</option>
                  <option value="Other">Other</option>
                </select>
              </div>

            </div>

            {/* Address */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-300 mb-1">ADDRESS</label>
              <input
                type="text"
                placeholder="House No, Ward, Street address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-white text-slate-900 text-xs px-4 py-2.5 rounded-full border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
              />
            </div>

            {/* City, Pincode, State */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1">*CITY</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-white text-slate-900 text-xs px-4 py-2.5 rounded-full border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1">*PINCODE</label>
                <input
                  type="text"
                  required
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="w-full bg-white text-slate-900 text-xs px-4 py-2.5 rounded-full border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1">*STATE</label>
                <input
                  type="text"
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full bg-white text-slate-900 text-xs px-4 py-2.5 rounded-full border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                />
              </div>
            </div>

          </div>

          {/* Navigation Buttons matching Screenshot 4 */}
          <div className="pt-6 border-t border-slate-700 flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs font-bold text-white transition"
            >
              Previous
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-slate-900 hover:bg-black rounded-lg text-xs font-bold text-white border border-slate-600 transition flex items-center gap-1.5 shadow"
            >
              <span>Next</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </form>
      )}

      {/* STEP 2: COURSE & PAYMENT DETAILS */}
      {currentStep === 2 && (
        <form onSubmit={handleNextStep2} className="bg-[#1c2431] text-white p-6 sm:p-8 rounded-2xl shadow-xl space-y-6 border border-slate-700">
          
          <h3 className="text-xs font-bold tracking-wider text-amber-400 uppercase flex items-center gap-1.5">
            <Award className="w-4 h-4" />
            <span>2. COURSE ENROLMENT & PAYMENT DETAILS</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Course Program</label>
              <select
                value={course}
                onChange={(e) => {
                  const val = e.target.value;
                  setCourse(val);
                  if (val === 'CD-IELTS General Training') {
                    setPack('CD-IELTS GT Pay Per Use 30 Mock & 150 Practice Tests(Demo)');
                    setBatch('CD-IELTS_General_Training_default');
                  } else if (val === 'PTE Academic') {
                    setPack('PTE Academic 79+ Intensive Full Pack');
                    setBatch('PTE_Target_79_default');
                  } else {
                    setPack('CD-IELTS AC Pay Per Use 30 Mock & 150 Practice Tests(Demo)');
                    setBatch('CD-IELTS_Academic_default');
                  }
                }}
                className="w-full bg-white text-slate-900 text-xs px-4 py-2.5 rounded-full border border-slate-300 font-medium"
              >
                <option value="CD-IELTS Academic">CD-IELTS Academic</option>
                <option value="CD-IELTS General Training">CD-IELTS General Training</option>
                <option value="PTE Academic">PTE Academic</option>
                <option value="CELPIP">CELPIP General</option>
                <option value="Spoken English">Spoken English & Accent Neutralization</option>
                <option value="Computer Courses">Computer Courses (DCA / Office)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Selected Pack</label>
              <input
                type="text"
                value={pack}
                onChange={(e) => setPack(e.target.value)}
                className="w-full bg-white text-slate-900 text-xs px-4 py-2.5 rounded-full border border-slate-300 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Course Fee (₹)</label>
              <input
                type="number"
                min="0"
                value={fee}
                onChange={(e) => setFee(Number(e.target.value))}
                className="w-full bg-white text-slate-900 text-xs px-4 py-2.5 rounded-full border border-slate-300 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Discount (₹)</label>
              <input
                type="number"
                min="0"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
                className="w-full bg-white text-slate-900 text-xs px-4 py-2.5 rounded-full border border-slate-300 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Net Payable (₹)</label>
              <div className="w-full bg-slate-800 text-amber-400 font-bold text-xs px-4 py-2.5 rounded-full border border-slate-600 flex items-center">
                ₹{Math.max(0, fee - discount)}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Payment Status</label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as any)}
                className="w-full bg-white text-slate-900 text-xs px-3.5 py-2.5 rounded-full border border-slate-300 font-medium"
              >
                <option value="Paid">Paid</option>
                <option value="Partial">Partial</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Payment Mode</label>
            <div className="grid grid-cols-4 gap-2">
              {['Cash', 'UPI', 'Card', 'Net Banking'].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setPaymentMode(mode as any)}
                  className={`py-2 px-3 rounded-full text-xs font-bold transition border ${
                    paymentMode === mode
                      ? 'bg-amber-500 text-slate-950 border-amber-400'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="pt-6 border-t border-slate-700 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs font-bold text-white transition"
            >
              Previous
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-slate-900 hover:bg-black rounded-lg text-xs font-bold text-white border border-slate-600 transition flex items-center gap-1.5 shadow"
            >
              <span>Next</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </form>
      )}

      {/* STEP 3: BATCH DETAILS & SUBMIT */}
      {currentStep === 3 && (
        <form onSubmit={handleFinalSubmit} className="bg-[#1c2431] text-white p-6 sm:p-8 rounded-2xl shadow-xl space-y-6 border border-slate-700">
          
          <h3 className="text-xs font-bold tracking-wider text-amber-400 uppercase flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            <span>3. BATCH ALLOTMENT & ACCOUNT CREATION</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Batch Assignment</label>
              <select
                value={batch}
                onChange={(e) => setBatch(e.target.value)}
                className="w-full bg-white text-slate-900 text-xs px-4 py-2.5 rounded-full border border-slate-300 font-medium"
              >
                <option value="CD-IELTS_Academic_default">CD-IELTS_Academic_default</option>
                <option value="CD-IELTS_General_Training_default">CD-IELTS_General_Training_default</option>
                <option value="Morning IELTS Master 7.5+">Morning IELTS Master 7.5+</option>
                <option value="General Training Master Fast-track">General Training Master Fast-track</option>
                <option value="PTE_Target_79_default">PTE_Target_79_default</option>
                <option value="Evening PTE Intensive">Evening PTE Intensive</option>
                <option value="Weekend Fast-track">Weekend Fast-track</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Account Status</label>
              <select
                value={accountStatus}
                onChange={(e) => setAccountStatus(e.target.value as any)}
                className="w-full bg-white text-slate-900 text-xs px-4 py-2.5 rounded-full border border-slate-300 font-medium"
              >
                <option value="Active">Active (Candidate can login)</option>
                <option value="Inactive">Inactive (Suspended)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Enrolment Date</label>
              <input
                type="date"
                value={enrolmentDate}
                onChange={(e) => setEnrolmentDate(e.target.value)}
                className="w-full bg-white text-slate-900 text-xs px-4 py-2.5 rounded-full border border-slate-300 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Course Start Date</label>
              <input
                type="date"
                value={courseStartDate}
                onChange={(e) => setCourseStartDate(e.target.value)}
                className="w-full bg-white text-slate-900 text-xs px-4 py-2.5 rounded-full border border-slate-300 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Course Validity / End Date</label>
              <input
                type="date"
                value={courseEndDate}
                onChange={(e) => setCourseEndDate(e.target.value)}
                className="w-full bg-white text-slate-900 text-xs px-4 py-2.5 rounded-full border border-slate-300 font-medium"
              />
            </div>
          </div>

          <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-700 text-xs text-slate-300 space-y-1">
            <span className="font-bold text-amber-400">Automated Security Credentials Generation:</span>
            <p>
              Upon submission, BrowseraIELTS will automatically generate a unique <strong>Student ID (e.g. CR41)</strong>, an institutional <strong>Username</strong>, and a <strong>temporary password</strong>. The credentials will be saved directly into the persistent database.
            </p>
          </div>

          {/* Navigation Buttons */}
          <div className="pt-6 border-t border-slate-700 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs font-bold text-white transition"
            >
              Previous
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-2.5 bg-amber-500 hover:bg-amber-400 rounded-lg text-xs font-black text-slate-950 transition flex items-center gap-1.5 shadow-lg disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4" />
              <span>{isSubmitting ? 'Enrolling & Creating Account...' : 'Complete Enrolment'}</span>
            </button>
          </div>

        </form>
      )}

      {/* CREDENTIALS GENERATION SUCCESS MODAL */}
      {createdStudentResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 border border-slate-200 space-y-6">
            
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-slate-900">Candidate Enrolled Successfully!</h2>
              <p className="text-xs text-slate-600">
                Official student record and secure credentials created in the persistent database.
              </p>
            </div>

            {/* Credentials Card */}
            <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 space-y-3">
              <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center justify-between border-b border-slate-800 pb-2">
                <span>Official Student Credentials</span>
                <span>Browsera Infotech</span>
              </div>

              <div className="space-y-2.5 text-xs font-mono">
                
                {/* Student ID */}
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800">
                  <div>
                    <span className="text-slate-400 text-[10px] block font-sans">STUDENT ID</span>
                    <span className="font-bold text-amber-400 text-sm">{createdStudentResult.credentials.studentId}</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(createdStudentResult.credentials.studentId, 'id')}
                    className="p-1.5 text-slate-400 hover:text-white rounded"
                  >
                    {copiedField === 'id' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                {/* Username */}
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <div>
                    <span className="text-slate-400 text-[10px] block font-sans">PRIMARY USERNAME (MOBILE NUMBER)</span>
                    <span className="font-bold text-white text-sm">{createdStudentResult.credentials.username}</span>
                    {createdStudentResult.credentials.aliasUsername && createdStudentResult.credentials.aliasUsername !== createdStudentResult.credentials.username && (
                      <span className="text-[10px] text-slate-400 font-sans block mt-0.5">
                        Alias ID: <span className="text-amber-400 font-mono">{createdStudentResult.credentials.aliasUsername}</span>
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => copyToClipboard(createdStudentResult.credentials.username, 'user')}
                    className="p-1.5 text-slate-400 hover:text-white rounded"
                  >
                    {copiedField === 'user' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password / Initial PIN */}
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <div>
                    <span className="text-slate-400 text-[10px] block font-sans">PASSWORD / LOGIN PIN</span>
                    <span className="font-bold text-emerald-400 text-sm">
                      {createdStudentResult.credentials.temporaryPassword || 'cdi70906'}
                    </span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(createdStudentResult.credentials.temporaryPassword || 'cdi70906', 'pass')}
                    className="p-1.5 text-slate-400 hover:text-white rounded"
                  >
                    {copiedField === 'pass' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

              </div>

              <div className="text-[11px] text-emerald-400/90 font-medium bg-emerald-950/40 border border-emerald-900/60 p-2.5 rounded-xl">
                ✓ Student can log in immediately on the Sign In page using their mobile number (<span className="font-mono font-bold text-white">{createdStudentResult.credentials.username}</span>) or Student ID (<span className="font-mono font-bold text-white">{createdStudentResult.credentials.studentId}</span>) with password <span className="font-mono font-bold text-white">{createdStudentResult.credentials.temporaryPassword || 'cdi70906'}</span>.
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setCreatedStudentResult(null);
                  onSuccess();
                }}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow transition"
              >
                Done & View in Student Directory
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
