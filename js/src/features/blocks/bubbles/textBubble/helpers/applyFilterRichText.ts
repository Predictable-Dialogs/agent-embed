import { TElement, TText, TDescendant } from "@udecode/plate-common";

export const applyFilterRichText = (
  response: TElement | TElement[],
  filter?: (response: string) => string
): TElement | TElement[] => {
  if (!filter) return response;

  const applyFilterToElement = (element: TElement): TElement => {
    if (element.type === "text" && "text" in element) {
      return { ...element, text: filter((element as unknown as TText).text) };
    } else if (Array.isArray(element.children)) {
      return {
        ...element,
        children: element.children.map((child) =>
          applyFilterToDescendant(child)
        ),
      };
    }
    return element;
  };

  const applyFilterToDescendant = (descendant: TDescendant): TDescendant => {
    if (typeof descendant === "string") {
      // Convert string to TText
      return { text: filter(descendant) };
    } else if ("type" in descendant && descendant.type !== "text") {
      return applyFilterToElement(descendant as TElement);
    } else {
      return { ...descendant, text: filter((descendant as TText).text) };
    }
  };

  try {
    if (Array.isArray(response)) {
      return response.map(applyFilterToElement);
    } else {
      return applyFilterToElement(response);
    }
  } catch (e) {
    console.warn("Failed to apply filterResponse function to rich text response.", e);
    return response;
  }
};
