import Paragraph from "@tiptap/extension-paragraph";

export const ClaimedParagraph = Paragraph.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      claim: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-claim"),
        renderHTML: (attributes) =>
          attributes.claim ? { "data-claim": attributes.claim } : {},
      },
    };
  },
});
