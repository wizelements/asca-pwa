import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminSection from "@/components/admin/AdminSection";
import AdminEmptyState from "@/components/admin/AdminEmptyState";

export default function TemplatesPagePage() {
  return (
    <>
      <AdminPageHeader
        title="TemplatesPage"
        subtitle="This section is planned for a future stage."
      />
      <AdminSection>
        <AdminEmptyState
          icon="🚧"
          title="Coming soon"
          description="This feature is not implemented yet. It is reserved in the navigation for future expansion."
        />
      </AdminSection>
    </>
  );
}
