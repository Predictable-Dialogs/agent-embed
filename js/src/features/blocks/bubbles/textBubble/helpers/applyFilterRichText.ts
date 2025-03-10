export const applyFilterText = (
  response: string,
  filter?: (response: string) => string
): string => {
  if (!filter) return response;
  try {
    return filter(response);
  } catch (e) {
    console.warn("Failed to apply filterResponse function to text response.", e);
    return response;
  }
};
