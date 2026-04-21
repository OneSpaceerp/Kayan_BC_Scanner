export const ENDPOINTS = {
  login: "/api/method/login",
  generateKeys: "/api/method/frappe.core.doctype.user.user.generate_keys",
  getLoggedUser: "/api/method/frappe.auth.get_logged_user",
  user: (email: string) => `/api/resource/User/${encodeURIComponent(email)}`,
  campaigns: "/api/resource/Campaign",
  leads: "/api/resource/Lead",
  addComment: "/api/method/frappe.desk.form.utils.add_comment",
  uploadFile: "/api/method/upload_file",
} as const;
