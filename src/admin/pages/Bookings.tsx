import { SubmissionsList } from "@admin/components/SubmissionsList";

/** "Book a 30-minute call" requests from /configure. */
export default function Bookings() {
  return (
    <SubmissionsList
      table="booking_requests"
      title="Bookings"
      replySubject={(s) => `Your call with Fwdpod: ${s.company}`}
      summary={(s) => [s.need, s.engagement, s.role_or_outcome].filter(Boolean).join(" · ")}
      details={[
        { label: "What they need", value: (s) => s.need },
        { label: "Role or outcome", value: (s) => s.role_or_outcome },
        { label: "Preferred engagement", value: (s) => s.engagement },
        { label: "Ideal start date", value: (s) => s.start_date },
        { label: "Anything else", value: (s) => s.message },
      ]}
    />
  );
}
