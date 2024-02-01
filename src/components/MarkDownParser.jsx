import React from "react";
import { marked } from "marked";

function MarkdownParser({ text }) {
  // Convert Markdown text to HTML
  const getMarkdownText = () => {
    var rawMarkup = marked(text, { sanitize: true });
    return { __html: rawMarkup };
  };

  return <div dangerouslySetInnerHTML={getMarkdownText()} />;
}

export default MarkdownParser;
