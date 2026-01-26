'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MemberCard from '@/components/MemberCard';
import { IMember } from '@/lib/models/Member';

export default function Members() {
  const [members, setMembers] = useState<IMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const roles = ['rider', 'volunteer', 'instructor'];

  useEffect(() => {
    const url = selectedRole ? `/api/members?role=${selectedRole}` : '/api/members';
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setMembers(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selectedRole]);

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
              <button
                onClick={() => setSelectedRole(null)}
                className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                  selectedRole === null
                    ? 'bg-primary text-neutral'
                    : 'bg-gray-200 text-primary hover:bg-gray-300'
                }`}
              >
                All Members
              </button>
              {roles.map((role) => (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={`px-6 py-2 rounded-lg font-semibold transition-colors capitalize ${
                    selectedRole === role
                      ? 'bg-primary text-neutral'
                      : 'bg-gray-200 text-primary hover:bg-gray-300'
                  }`}
                >
                  {role}s
                </button>
              ))}
            </div>

            {/* Member Grid */}
            {loading ? (
              <div className="text-center py-12">Loading members...</div>
            ) : members.length > 0 ? (
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
