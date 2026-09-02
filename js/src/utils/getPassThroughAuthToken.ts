export type GetAuthToken = () => Promise<string>;

export const getPassThroughAuthToken = async (
  getAuthToken?: GetAuthToken,
): Promise<string | undefined> => {
  if (typeof getAuthToken !== 'function') {
    return undefined;
  }

  try {
    const token = await getAuthToken();
    const normalizedToken = typeof token === 'string' ? token.trim() : '';
    return normalizedToken || undefined;
  } catch (error) {
    console.error('[Agent] getAuthToken failed', error);
    return undefined;
  }
};
