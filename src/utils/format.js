export const formatValidationErrors = (errors) => {
  if (!errors || !errors.issues) {
    return 'An unknown validation error occurred.';
  }   
  if (Array.isArray(errors.issues)) {
    return errors.issues.map(issue => issue.message).join(', ');
  }
  return JSON.stringify(errors);
}; 