export default function Home() {
  return (
    <main className="min-h-screen">
      <section className="hero py-20 bg-gradient-to-r from-primary to-secondary text-neutral">
        <div className="container">
          <h1 className="text-5xl font-bold mb-4">Atlanta Saddle Club Association</h1>
          <p className="text-xl mb-8">We Ride To Inspire</p>
          <div className="flex gap-4">
            <button className="btn-primary">Get Involved</button>
            <button className="btn-secondary">Learn More</button>
          </div>
        </div>
      </section>

      <section className="py-20 bg-neutral">
        <div className="container">
          <h2 className="text-4xl font-bold mb-12 text-center">Welcome</h2>
          <p className="text-lg text-center max-w-2xl mx-auto">
            Phase 1 foundation is live. Database connected. API routes ready. Admin panel coming next.
          </p>
        </div>
      </section>
    </main>
  )
}
