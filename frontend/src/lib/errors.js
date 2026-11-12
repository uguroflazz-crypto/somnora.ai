/**
 * Extracts a human-readable message from an axios/Supabase error.
 * @param {unknown} error
 * @param {string} fallback
 * @returns {string}
 */
export const getErrorMessage = (error, fallback) => {
  const detail = error?.response?.data?.detail;
  if (typeof detail === 'string' && detail.trim()) return detail;
  if (Array.isArray(detail) && typeof detail[0]?.msg === 'string') return detail[0].msg;
  if (typeof error?.message === 'string' && error.message.trim() && !error.response) return error.message;
  return fallback;
};
