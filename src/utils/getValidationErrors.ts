import { ValidationError } from 'yup';

interface Errors {
  [Key: string]: string;
}

export default function getValidationErrors(err: ValidationError): Errors {
  const validationErros: Errors = {};

  err.inner.forEach((error) => {
    validationErros[error.path] = error.message;
  });

  return validationErros;
}
