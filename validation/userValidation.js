import Joi from  'joi'

export const registerValidation = Joi.object({
 name: Joi.string()
  .min(3)
  .max(50)
  .pattern(/^[A-Za-z\s]+$/)
  .required()
  .messages({
    'string.empty': 'Name is required.',
    'string.min': 'Name should be at least 3 characters.',
    'string.pattern.base': 'Name can only contain letters and spaces.',
  }),


  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please enter a valid email address.',
      'string.empty': 'Email is required.',
    }),

 password: Joi.string()
  .min(8)
  .pattern(new RegExp('^(?=.[a-z])(?=.[A-Z])(?=.\\d)(?=.[@$!%?&])[A-Za-z\\d@$!%?&]{8,}$'))
  .required()
  .messages({
    'string.min': 'Password must be at least 8 characters long.',
    'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
    'string.empty': 'Password is required.',
  }),


phone: Joi.number()
  .integer()
  .min(1000000000)  // smallest 10-digit number
  .max(9999999999)  // largest 10-digit number
  .required()
  .messages({
    'number.base': 'Phone number must be a number.',
    'number.integer': 'Phone number must be an integer.',
    'number.min': 'Phone number must be exactly 10 digits.',
    'number.max': 'Phone number must be exactly 10 digits.',
    'any.required': 'Phone number is required.',
  }),


  role: Joi.string()
    .valid('host', 'chef', 'admin', 'deliveryBoy')
    .required()
    .messages({
      'any.only': 'Role must be one of host, chef, admin, or deliveryBoy.',
      'any.required': 'Role is required.',
    }),
});

// export const chefValidation = Joi.object({
//   userId: Joi.string()
//     .required()
//     .messages({
//       'string.empty': 'User ID is required.',
//     }),

//   location: Joi.object({
//     lat: Joi.number()
//       .required()
//       .messages({
//         'number.base': 'Latitude must be a number.',
//         'any.required': 'Latitude is required.',
//       }),
//     lng: Joi.number()
//       .required()
//       .messages({
//         'number.base': 'Longitude must be a number.',
//         'any.required': 'Longitude is required.',
//       }),
//   }).required(),

//   experience: Joi.string()
//     .min(1)
//     .max(100)
//     .messages({
//       'string.max': 'Experience description is too long.',
//     }),

//   specialize: Joi.array()
//     .items(Joi.string().min(2).max(30))
//     .min(1)
//     .required()
//     .messages({
//       'array.base': 'Specializations must be an array.',
//       'array.min': 'Please add at least one specialization.',
//     }),

//   certificate: Joi.string()
//     .required()
//     .messages({
//       'string.empty': 'Certificate is required.',
//     }),
// });

// export const loginValidation = Joi.object({
//   email: Joi.string()
//     .email()
//     .required()
//     .messages({
//       'string.email': 'Please enter a valid email address.',
//       'string.empty': 'Email is required.',
//     }),

//   password: Joi.string()
//     .required()
//     .messages({
//       'string.empty': 'Password is required.',
//     }),
// });