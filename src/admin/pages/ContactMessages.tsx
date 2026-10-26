import { SubmissionsList } from "@admin/components/SubmissionsList";

/** Messages from the contact form on /contact. */
export default function ContactMessages() {
  return (
    <SubmissionsList
      table="contact_messages"
      title="Contact messages"
      replySubject={() => "Re: your message to Fwdpod"}
      summary={(s) => s.message ?? ""}
      details={[{ label: "Message", value: (s) => s.message }]}
    />
  );
}
