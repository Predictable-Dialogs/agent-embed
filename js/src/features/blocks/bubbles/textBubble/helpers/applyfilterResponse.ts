export const applyFilterResponse = (
  response: string,
  filter?: (response: string) => string
): string => {
  if (filter) {
    return filter(response);
  }
  return response;
};
