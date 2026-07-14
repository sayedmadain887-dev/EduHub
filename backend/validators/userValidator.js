const Joi = require('joi');

const customMessages = {
    'string.empty': '{{#label}} مطلوب',
    'string.email': '{{#label}} يجب أن يكون بريد إلكتروني صحيح',
    'string.min': '{{#label}} يجب أن يكون {{#limit}} أحرف على الأقل',
    'string.max': '{{#label}} يجب ألا يتجاوز {{#limit}} حرف',
    'any.required': '{{#label}} مطلوب',
    'number.base': '{{#label}} يجب أن يكون رقم',
};


const passwordValidator = (value, helpers) => {
    const missing = [];

    if (!/[a-z]/.test(value)) missing.push("حرف صغير");
    if (!/[A-Z]/.test(value)) missing.push("حرف كبير");
    if (!/\d/.test(value)) missing.push("رقم");
    if (!/[@$!%*?&]/.test(value)) missing.push("رمز خاص (@ $ ! % * ? &)");

    if (missing.length > 0) {
        return helpers.message(`كلمة المرور تفتقد إلى: ${missing.join('، ')}`);
    }

    return value;
};


const registerSchema = Joi.object({
    fullName: Joi.string()
        .min(3)
        .max(50)
        .pattern(/^[\u0600-\u06FFa-zA-Z\s]+$/)
        .required()
        .messages({
            ...customMessages,
            'string.pattern.base': 'الاسم يجب أن يحتوي على حروف فقط',
        }),

    email: Joi.string()
        .email({ tlds: { allow: false } })
        .lowercase()
        .required()
        .messages(customMessages),

    phone: Joi.string()
        .pattern(/^01[0125][0-9]{8}$/)
        .required()
        .messages({
            'string.pattern.base': 'رقم الهاتف يجب أن يكون مصري صحيح (مثال: 01012345678)',
            ...customMessages,
        }),

    // ⬇️⬇️ استبدلنا .pattern() بـ .custom() هنا ⬇️⬇️
    password: Joi.string()
        .min(8)
        .max(128)
        .required()
        .custom(passwordValidator)
        .messages(customMessages),
    // ⬆️⬆️ ⬆️⬆️

    confirmPassword: Joi.string()
        .valid(Joi.ref('password'))
        .required()
        .messages({
            'any.only': 'كلمتا المرور غير متطابقتين',
            ...customMessages,
        }),
});

const loginSchema = Joi.object({
    email: Joi.string()
        .email({ tlds: { allow: false } })
        .lowercase()
        .required()
        .messages(customMessages),

    password: Joi.string()
        .required()
        .messages(customMessages),
});

const updateProfileSchema = Joi.object({
    fullName: Joi.string()
        .min(3)
        .max(50)
        .pattern(/^[\u0600-\u06FFa-zA-Z\s]+$/)
        .optional()
        .messages({
            ...customMessages,
            'string.pattern.base': 'الاسم يجب أن يحتوي على حروف فقط',
        }),

    email: Joi.string()
        .email({ tlds: { allow: false } })
        .lowercase()
        .optional()
        .messages(customMessages),

    phone: Joi.string()
        .pattern(/^01[0125][0-9]{8}$/)
        .optional()
        .messages({
            'string.pattern.base': 'رقم الهاتف يجب أن يكون مصري صحيح',
        }),

    password: Joi.string()
        .required()
        .messages({
            ...customMessages,
            'any.required': 'كلمة المرور مطلوبة للتأكيد',
        }),
}).or('fullName', 'email', 'phone');

module.exports = {
    registerSchema,
    loginSchema,
    updateProfileSchema,
};