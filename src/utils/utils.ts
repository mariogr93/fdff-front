const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


// Format phone number as (XXX) XXX-XXXX
const formatPhoneNumber = (value: string): string => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
    return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
};


interface Utils {
    phoneRegex: RegExp;
    emailRegex: RegExp;
    formatPhoneNumber: (value: string) => string;
}

const UTILS: Utils = {
    phoneRegex,
    emailRegex,
    formatPhoneNumber,
};


export default UTILS;