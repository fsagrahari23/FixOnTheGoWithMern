// Lightweight reusable form validation utilities

const regex = {
  email: /^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/,
  phone: /^[0-9+\-()\s]{7,20}$/,
  number: /^-?\d+(\.\d+)?$/,
  name: /^[a-zA-Z\s]+$/,
};

export function validate(values, rules) {
  const errors = {};
  if (!rules) return { errors, isValid: true };

  Object.entries(rules).forEach(([field, fieldRules]) => {
    const value = values[field];
    for (const r of fieldRules) {
      const { type, message, min, max, pattern, validate: fn } = r;

      if (type === 'required') {
        const empty = value === undefined || value === null || (typeof value === 'string' && value.trim() === '') || (Array.isArray(value) && value.length === 0);
        if (empty) { errors[field] = message || 'This field is required'; break; }
      }
      if (type === 'email' && value) {
        if (!regex.email.test(String(value))) { errors[field] = message || 'Enter a valid email'; break; }
      }
      if (type === 'phone' && value) {
        if (!regex.phone.test(String(value))) { errors[field] = message || 'Enter a valid phone number'; break; }
      }
      if (type === 'name' && value) {
        if (!regex.name.test(String(value))) { errors[field] = message || 'Name can only contain letters and spaces'; break; }
      }
      if (type === 'number' && value !== '' && value !== undefined && value !== null) {
        if (!regex.number.test(String(value))) { errors[field] = message || 'Enter a valid number'; break; }
      }
      if (type === 'minLength' && value) {
        if (String(value).length < (min ?? 0)) { errors[field] = message || `Minimum ${min} characters`; break; }
      }
      if (type === 'maxLength' && value) {
        if (String(value).length > (max ?? Infinity)) { errors[field] = message || `Maximum ${max} characters`; break; }
      }
      if (type === 'min' && value !== '' && value !== undefined && value !== null) {
        if (Number(value) < min) { errors[field] = message || `Minimum value is ${min}`; break; }
      }
      if (type === 'max' && value !== '' && value !== undefined && value !== null) {
        if (Number(value) > max) { errors[field] = message || `Maximum value is ${max}`; break; }
      }
      if (type === 'pattern' && value) {
        const re = pattern instanceof RegExp ? pattern : new RegExp(pattern);
        if (!re.test(String(value))) { errors[field] = message || 'Invalid format'; break; }
      }
      if (type === 'file' && value) {
        // supports single File or FileList/Array of Files
        const files = Array.isArray(value) ? value : (value?.length !== undefined ? Array.from(value) : [value]);
        for (const f of files) {
          if (!f) continue;
          if (r.maxSize && f.size > r.maxSize) { errors[field] = message || `File too large (max ${(r.maxSize/1024/1024).toFixed(1)}MB)`; break; }
          if (r.accept && Array.isArray(r.accept)) {
            const ok = r.accept.some((t) => f.type?.includes(t) || f.name?.toLowerCase().endsWith(t));
            if (!ok) { errors[field] = message || `Unsupported file type`; break; }
          }
        }
        if (errors[field]) break;
      }
      if (typeof fn === 'function') {
        const res = fn(value, values);
        if (res === false) { errors[field] = message || 'Invalid value'; break; }
        if (typeof res === 'string' && res) { errors[field] = res; break; }
      }
    }
  });
  return { errors, isValid: Object.keys(errors).length === 0 };
}

export function fieldError(errors, name) {
  const msg = errors?.[name];
  if (!msg) return null;
  return msg;
}
