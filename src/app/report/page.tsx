import { redirect } from "next/navigation";

/* Подача наводок переехала в раздел «Сообщество» */
export default function ReportPage() {
  redirect("/community");
}
