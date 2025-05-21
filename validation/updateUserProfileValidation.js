export const updateUserProfileValidation=(name,phone)=>{
let obj = {};
  if (name !== undefined) obj.name = name;
  if (phone !== undefined) obj.phone = phone;
  return obj;
}