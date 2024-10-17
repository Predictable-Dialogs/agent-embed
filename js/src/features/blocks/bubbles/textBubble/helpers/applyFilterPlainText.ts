export const applyFilterPlainText = (
  response: string,
  filter?: (response: string) => string
): string => {
  if (filter) {
    try {
      return filter(response);
    } catch(e) {
      console.warn("Failed to apply filterResponse function to plain text response.", e)
    }
  }
  return response;
};
