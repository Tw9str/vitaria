import React from "react";

type JsonLdValue = Record<string, unknown> | Array<Record<string, unknown>>;

type JsonLdProps<T extends JsonLdValue> = {
  data: T;
  id?: string;
  nonce?: string;
};

function safeJsonLd(data: unknown) {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}

export default function JsonLd<T extends JsonLdValue>({
  id,
  data,
  nonce,
}: JsonLdProps<T>) {
  return (
    <script
      id={id}
      nonce={nonce}
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: safeJsonLd(data) }}
    />
  );
}
