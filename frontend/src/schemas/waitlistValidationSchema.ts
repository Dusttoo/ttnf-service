import * as Yup from 'yup';

const phoneRegExp = /^(\d{3})-(\d{3})-(\d{4})$/;

export const waitlistFormSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    email: Yup.string().email('Invalid email format').required('Email is required'),
    phone: Yup.string()
        .matches(phoneRegExp, 'Phone number is not valid, must be in the format 123-456-7890')
        .required('Phone number is required'),
    genderPreference: Yup.mixed().oneOf(['Male', 'Female']).optional(),
    colorPreference: Yup.string().optional(),
    additionalInfo: Yup.string().optional(),
    sire_ids: Yup.array().of(Yup.number()).optional(),
    dam_ids: Yup.array().of(Yup.number()).optional(),
});