import Hero from '@/components/Hero';
import MemberCard from '@/components/Cards/MemberCard';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getSettings, getTheme, getMembers } from '@/lib/db/queries';

export default async function Members() {
  const [settings, theme, members] = await Promise.all([
    getSettings(),
    getTheme(),
    getMembers(),
  ]);

  const membersByRole = members.reduce((acc: any, member: any) => {
    const role = member.role || 'Other';
    if (!acc[role]) acc[role] = [];
    acc[role].push(member);
    return acc;
  }, {});

  return (
    <>
      <style>{`
        :root {
          --color-primary: ${theme.colors.primary};
          --color-secondary: ${theme.colors.secondary};
          --color-accent: ${theme.colors.accent};
          --color-neutral: ${theme.colors.neutral};
        }
      `}</style>
      <Header />
      <main>
        <Hero
          image={settings.heroes?.members?.image || '/images/hero/members.jpg'}
          title={settings.heroes?.members?.title || 'Our Team'}
          subtitle={settings.heroes?.members?.subtitle || 'Meet the people who make ASCA happen'}
        />

        {Object.entries(membersByRole).map(([role, groupMembers]: [string, any]) => (
          <section key={role} className="py-20">
            <div className="container">
              <div className="mb-12 text-center">
                <p className="section-label">{role}</p>
                <h2 className="section-title">Meet The Team</h2>
              </div>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {groupMembers.map((member: any) => (
                  <MemberCard
                    key={member._id.toString()}
                    name={member.name}
                    role={member.role}
                    bio={member.bio}
                    image={member.image}
                    email={member.email}
                  />
                ))}
              </div>
            </div>
          </section>
        ))}

        {members.length === 0 && (
          <section className="py-20">
            <div className="container text-center">
              <p className="text-brand-fg-secondary">Team members coming soon.</p>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
