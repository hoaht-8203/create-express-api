/* eslint-disable @typescript-eslint/no-explicit-any */
export const handleValidate = (requestBody: any, schema: any) => {
  const validate = schema.safeParse(requestBody)
  if (!validate.success) {
    throw validate.error
  }
}
