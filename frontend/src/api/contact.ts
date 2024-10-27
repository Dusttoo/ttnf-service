import { axiosWithTimeout } from './axiosInstance';

interface ContactFormData {
    name: string;
    email: string;
    message: string;
}

export const submitContactForm = async (data: ContactFormData): Promise<void> => {
    console.log(data);
    try {
        const response = await axiosWithTimeout(
            {
                method: 'post',
                url: '/contact',
                data,
                headers: {
                    'Content-Type': 'application/json',
                },
            },
            10000,
        );
        return response.data;
    } catch (error) {
        console.error('Failed to submit contact form:', error);
        throw new Error('Failed to send message. Please try again later.');
    }
};