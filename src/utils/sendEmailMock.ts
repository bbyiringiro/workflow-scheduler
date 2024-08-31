export const sendEmail = async (): Promise<boolean> => {
  // Generate a random number between 0 and 1
  const randomNumber = Math.random();

  // Simulate an asynchronous operation, e.g., sending an email
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // 95% chance to return true, 5% chance to return false (emails fail)
  return randomNumber < 0.95 ? true : false;
};
