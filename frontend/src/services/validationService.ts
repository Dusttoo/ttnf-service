import * as Yup from 'yup';

export const validateForm = async (values: any, schema: Yup.ObjectSchema<any>) => {
    try {
        await schema.validate(values, { abortEarly: false });
        return { isValid: true, errors: {} };
    } catch (err: any) {
        const validationErrors: Record<string, string> = {};
        err.inner.forEach((error: Yup.ValidationError) => {
            if (error.path) {
                validationErrors[error.path] = error.message;
            }
        });
        return { isValid: false, errors: validationErrors };
    }
};