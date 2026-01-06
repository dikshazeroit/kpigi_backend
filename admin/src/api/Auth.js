import apiClient from './ApiClient.js';
import CryptoJS from "crypto-js";
const SECRET_KEY = "my_super_secret_key";

// Login Service Component
const loginService = {
  async execute(email, password) {
    const response = await apiClient.post('/login', { email, password });
    console.info(response, "this============================== is response")
    const token = response.data.payload.token;
    const name = response.data.payload.name;
    const image = response.data.payload.image;

    localStorage.setItem('name', name);
    localStorage.setItem('adminImage', image);
    tokenManager.set(token);
    return response.data;
  }
};

// Password Reset Service Component
const passwordResetService = {
  async forgot(email) {
    const response = await apiClient.post('/forgot-password', { email });
    return response.data;
  },

  async verify(email, otp) {
    const response = await apiClient.post('/verify-otp', { email, otp });
    return response.data;
  },

  async reset(email, newPassword, confirmPassword) {
    const response = await apiClient.post('/set-new-password', {
      email,
      newPassword,
      confirmPassword,
    });
    return response.data;
  }
};

// ============================================
// TOKEN MANAGEMENT COMPONENT
// ============================================
const tokenManager = {
  set(token) {
    localStorage.setItem('token', token);
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  },

  get() {
    return localStorage.getItem('token');
  },

  remove() {
    localStorage.removeItem('token');
    delete apiClient.defaults.headers.common['Authorization'];
  },

  exists() {
    return !!localStorage.getItem('token');
  }
};
// ============================================
// Permission MANAGEMENT COMPONENT
// ============================================

export const Permissions = () => {
  const encrypted = localStorage.getItem("adminPermissions");
  if (!encrypted) return [];

  try {
    const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decrypted) || [];
  } catch (err) {
    console.error("Failed to decrypt permissions:", err);
    return [];
  }
};




export const hasPermission = (permissionName) => {
  try {
    const encrypted = localStorage.getItem("adminPermissions");
    if (!encrypted) return false;

    // decrypt
    const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);

    if (!decrypted) return false;

    const permissions = JSON.parse(decrypted);

    // check if permission exists
    return permissions.includes(permissionName);
  } catch (err) {
    console.error("Permission check failed:", err);
    return false;
  }
};



// ============================================
// AUTH STATUS COMPONENT
// ============================================
const authStatus = {
  isAuthenticated() {
    return tokenManager.exists();
  },

  logout() {
    tokenManager.remove();
    window.location.href = '/admin/login';
  }
};

// ============================================
// EXPORT COMPONENTS
// ============================================
export {
  loginService,
  passwordResetService,
  tokenManager,
  authStatus,
};

// ============================================
// LEGACY EXPORTS (for backward compatibility)
// ============================================
export const loginAdmin = loginService.execute;
export const forgotPassword = passwordResetService.forgot;
export const verifyOtp = passwordResetService.verify;
export const resetPassword = passwordResetService.reset;
export const logoutAdmin = authStatus.logout;
export const getAuthToken = tokenManager.get;
export const isAuthenticated = authStatus.isAuthenticated;
