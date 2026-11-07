import { notFound } from "next/navigation";

/* Any unknown URL inside a language renders that language's 404. */
export default function Missing() {
  notFound();
}
