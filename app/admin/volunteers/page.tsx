import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminSection from "@/components/admin/AdminSection";
import AdminEmptyState from "@/components/admin/AdminEmptyState";

export default function VolunteersPage() {
  return (
    <>
      <AdminPageHeader
        title="Volunteers"
        subtitle="Track volunteer interest and assignments."
      />
      <AdminSection>
        <AdminEmptyState
          icon="🙌"
          title="Volunteer management coming soon"
          description="For now, use the Contacts page and tag people with volunteering or community-events."
          action={{ label: "View contacts", href: "/admin/contacts" }}
        />
      </AdminSection>
    </>
  );
}
