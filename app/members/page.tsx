import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MemberCard from '@/components/MemberCard';

export default function Members() {
  const members: any[] = [];
  const roles = ['rider', 'volunteer', 'instructor'];

  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="py-20 bg-gradient-to-r from-primary to-secondary text-neutral">
          <div className="container text-center">
            <h1 className="text-5xl font-bold mb-4">Our Members</h1>
            <p className="text-xl">Meet the riders, volunteers, and instructors of ASCA</p>
          </div>
        </section>

        {/* Filters & Members */}
        <section className="py-20 bg-neutral">
          <div className="container">
            {/* Filter Buttons */}
            <div className="flex gap-4 mb-12 justify-center flex-wrap">
              <button className="px-6 py-2 rounded-lg font-semibold bg-primary text-neutral">
                All Members
              </button>
              {roles.map((role) => (
                <button
                  key={role}
                  className="px-6 py-2 rounded-lg font-semibold transition-colors capitalize bg-gray-200 text-primary hover:bg-gray-300"
                >
                  {role}s
                </button>
              ))}
            </div>

            {/* Member Grid */}
            {members.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {members.map((member) => (
                  <MemberCard key={member._id} member={member} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-600">
                No members found in this category.
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
