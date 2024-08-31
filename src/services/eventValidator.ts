export const validateEvent = (
  eventName: string,
  userEmail: string
): string | null => {
  if (!eventName || typeof eventName !== "string") {
    return "Invalid or missing eventName";
  }

  const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
  if (!userEmail || !emailRegex.test(userEmail)) {
    return "Invalid or missing userEmail";
  }

  return null;
};
