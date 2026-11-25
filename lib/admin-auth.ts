export function getAdminPin(): string {
  const pin = process.env.ADMIN_PIN?.trim();
  return pin && pin.length > 0 ? pin : "1234";
}

export function isUsingDefaultPin(): boolean {
  return !process.env.ADMIN_PIN?.trim();
}

export function verifyAdminPinHeader(request: Request): boolean {
  const provided = request.headers.get("x-admin-pin")?.trim() ?? "";
  return provided.length > 0 && provided === getAdminPin();
}
