/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface EnrolStudentPayload {
  name: string;
  gender: 'Male' | 'Female' | 'Other';
  dob: string;
  email: string;
  contact: string;
  qualification: string;
  source: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  course: 'CD-IELTS' | 'CD-IELTS Academic' | 'CD-IELTS General Training' | 'PTE Academic' | 'CELPIP' | 'Spoken English' | 'Computer Courses' | string;
  courseType?: 'ielts_academic' | 'ielts_general' | 'pte_academic' | 'spoken_english' | 'computer_courses';
  pack: string;
  fee: number;
  discount: number;
  paymentStatus: 'Paid' | 'Partial' | 'Pending';
  paymentMode: 'Cash' | 'UPI' | 'Card' | 'Net Banking';
  batch: string;
  enrolmentDate: string;
  courseStartDate: string;
  courseEndDate?: string;
  accountStatus: 'Active' | 'Inactive';
}

const TOKEN_KEY = 'browsera_auth_token';

export const apiService = {
  getToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  setToken(token: string | null) {
    try {
      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
      } else {
        localStorage.removeItem(TOKEN_KEY);
      }
    } catch {
      // ignore
    }
  },

  getHeaders(customHeaders: Record<string, string> = {}) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...customHeaders
    };
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  },

  async getMe() {
    try {
      const res = await fetch('/api/auth/me', {
        headers: this.getHeaders(),
        credentials: 'include'
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.user || null;
    } catch {
      return null;
    }
  },

  async login(username: string, password: string) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Login failed');
    }
    if (data.token) {
      this.setToken(data.token);
    }
    return data;
  },

  async logout() {
    try {
      await fetch('/api/auth/logout', { 
        method: 'POST',
        headers: this.getHeaders(),
        credentials: 'include'
      });
    } catch (err) {
      console.warn('Logout notice:', err);
    } finally {
      this.setToken(null);
    }
  },

  async getStudents() {
    try {
      const res = await fetch('/api/students', {
        headers: this.getHeaders(),
        credentials: 'include'
      });
      if (!res.ok) return [];
      const data = await res.json();
      return data.students || [];
    } catch (err) {
      console.warn('Failed to fetch students, using empty list:', err);
      return [];
    }
  },

  async enrolStudent(payload: EnrolStudentPayload) {
    const res = await fetch('/api/students/enrol', {
      method: 'POST',
      headers: this.getHeaders(),
      credentials: 'include',
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to enrol student');
    }
    return data;
  },

  async updateStudentStatus(id: string, accountStatus: 'Active' | 'Inactive') {
    const res = await fetch(`/api/students/${id}/status`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      credentials: 'include',
      body: JSON.stringify({ accountStatus })
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to update student status');
    }
    return data;
  },

  async updateStudent(id: string, updates: Record<string, any>) {
    const res = await fetch(`/api/students/${id}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      credentials: 'include',
      body: JSON.stringify(updates)
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to update student record');
    }
    return data;
  },

  async resetPassword(id: string, newPassword?: string) {
    const res = await fetch(`/api/students/${id}/reset-password`, {
      method: 'POST',
      headers: this.getHeaders(),
      credentials: 'include',
      body: JSON.stringify({ newPassword })
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to reset password');
    }
    return data;
  },

  async getTests(filter?: { courseType?: string; testType?: string; module?: string }) {
    try {
      const params = new URLSearchParams();
      if (filter?.courseType) params.set('courseType', filter.courseType);
      if (filter?.testType) params.set('testType', filter.testType);
      if (filter?.module) params.set('module', filter.module);

      const res = await fetch(`/api/tests?${params.toString()}`, {
        headers: this.getHeaders(),
        credentials: 'include'
      });
      if (!res.ok) return [];
      const data = await res.json();
      return data.tests || [];
    } catch (err) {
      console.warn('Failed to fetch tests, using empty list:', err);
      return [];
    }
  },

  async getAssignments() {
    try {
      const res = await fetch('/api/assignments', {
        headers: this.getHeaders(),
        credentials: 'include'
      });
      if (!res.ok) return [];
      const data = await res.json();
      return data.assignments || [];
    } catch (err) {
      console.warn('Failed to fetch assignments, using empty list:', err);
      return [];
    }
  },

  async assignTest(payload: {
    targetType: 'student' | 'batch';
    testId: string;
    studentId?: string;
    batchName?: string;
    courseType?: string;
    dueDate: string;
    availability?: 'Immediate' | 'Scheduled';
    allowDuplicate?: boolean;
  }) {
    const res = await fetch('/api/assignments/assign', {
      method: 'POST',
      headers: this.getHeaders(),
      credentials: 'include',
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to assign test');
    }
    return data;
  },

  async getSubmissions() {
    try {
      const res = await fetch('/api/submissions', {
        headers: this.getHeaders(),
        credentials: 'include'
      });
      if (!res.ok) return [];
      const data = await res.json();
      return data.submissions || [];
    } catch (err) {
      console.warn('Failed to fetch submissions, using empty list:', err);
      return [];
    }
  },

  async submitTest(payload: any) {
    const res = await fetch('/api/submissions', {
      method: 'POST',
      headers: this.getHeaders(),
      credentials: 'include',
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to save test submission');
    }
    return data.submission;
  },

  async submitEnquiry(payload: {
    formName: string;
    formType: 'assessment' | 'student_portal' | 'general';
    name: string;
    phone: string;
    email?: string;
    course: string;
    message?: string;
    _hp?: string;
  }) {
    const res = await fetch('/api/enquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to submit enquiry. Please try again.');
    }
    return data;
  }
};
