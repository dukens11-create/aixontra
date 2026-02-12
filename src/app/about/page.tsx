import Link from "next/link";

export const metadata = {
  title: "About AIXONTRA - Curated AI Music Gallery",
  description: "Learn about AIXONTRA's mission to curate and showcase exceptional AI-generated music from creators worldwide.",
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h1 style={{ marginBottom: '1rem' }}>About AIXONTRA</h1>
        <p className="muted" style={{ fontSize: '1.125rem' }}>
          Curating the future of AI-generated music
        </p>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Our Mission</h2>
        <p style={{ marginBottom: '1rem', lineHeight: '1.7' }}>
          AIXONTRA is a curated platform dedicated to showcasing exceptional AI-generated music. 
          We believe that AI is a powerful creative tool that can augment human creativity and 
          produce unique, high-quality music experiences.
        </p>
        <p style={{ lineHeight: '1.7' }}>
          Unlike other platforms that accept everything, we carefully review each submission to 
          ensure quality, creativity, and artistic merit. Our goal is to build a gallery where 
          every track represents the best of what AI music has to offer.
        </p>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>What Makes AIXONTRA Different</h2>
        <div style={{ display: 'grid', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>🎯 Quality Over Quantity</h3>
            <p className="muted" style={{ lineHeight: '1.7' }}>
              Every track is reviewed by our team to ensure it meets our standards for quality and creativity.
            </p>
          </div>
          <div>
            <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>🎨 Creative Excellence</h3>
            <p className="muted" style={{ lineHeight: '1.7' }}>
              We celebrate innovative uses of AI tools and unique artistic expression in music creation.
            </p>
          </div>
          <div>
            <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>🌐 Global Community</h3>
            <p className="muted" style={{ lineHeight: '1.7' }}>
              Connect with AI music creators from around the world and discover diverse musical styles.
            </p>
          </div>
          <div>
            <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>🔒 Safe & Respectful</h3>
            <p className="muted" style={{ lineHeight: '1.7' }}>
              We maintain a safe, respectful environment free from copyright infringement and inappropriate content.
            </p>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>How to Get Involved</h2>
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>🎵 For Creators</h3>
            <p style={{ marginBottom: '0.75rem', lineHeight: '1.7' }}>
              Are you creating music with AI tools? We'd love to hear your work!
            </p>
            <ol style={{ marginLeft: '1.5rem', lineHeight: '1.7' }}>
              <li>Create an account on AIXONTRA</li>
              <li>Upload your best AI-generated tracks</li>
              <li>Our review team will evaluate your submission</li>
              <li>Approved tracks will be featured in our gallery</li>
            </ol>
            <Link href="/signup" className="btn" style={{ marginTop: '1rem', display: 'inline-block' }}>
              Get Started
            </Link>
          </div>
          <div>
            <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>👂 For Listeners</h3>
            <p style={{ lineHeight: '1.7' }}>
              No account needed to explore! Browse our curated collection, discover new creators, 
              and experience the cutting edge of AI music. Create an account to like tracks and 
              follow your favorite creators.
            </p>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Technology & Tools</h2>
        <p style={{ marginBottom: '1rem', lineHeight: '1.7' }}>
          AIXONTRA features music created with various AI tools, including but not limited to:
        </p>
        <div className="row" style={{ marginBottom: '1rem', flexWrap: 'wrap' }}>
          <span className="badge" style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}>Suno AI</span>
          <span className="badge" style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}>Udio</span>
          <span className="badge" style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}>AIVA</span>
          <span className="badge" style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}>Mubert</span>
          <span className="badge" style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}>Soundraw</span>
          <span className="badge" style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}>Custom AI</span>
        </div>
        <p className="muted" style={{ lineHeight: '1.7' }}>
          We welcome music created with any AI tool, as long as it meets our quality standards 
          and respects copyright and content policies.
        </p>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Our Philosophy on AI Music</h2>
        <p style={{ marginBottom: '1rem', lineHeight: '1.7' }}>
          We believe AI is a tool, not a replacement for human creativity. The best AI music 
          comes from creators who understand music theory, have artistic vision, and use AI 
          tools thoughtfully to realize their creative ideas.
        </p>
        <p style={{ lineHeight: '1.7' }}>
          AI music generation is an art form in itself—it requires skill to craft effective 
          prompts, curate outputs, and arrange AI-generated elements into cohesive compositions. 
          We celebrate this new form of musical artistry.
        </p>
      </div>

      <div className="card">
        <h2 style={{ marginBottom: '1rem' }}>Contact & Support</h2>
        <p style={{ marginBottom: '1rem', lineHeight: '1.7' }}>
          Have questions, suggestions, or need help? We're here for you:
        </p>
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          <p>
            <strong>General Inquiries:</strong>{' '}
            <a href="mailto:hello@aixontra.com" style={{ color: 'hsl(var(--primary))' }}>
              hello@aixontra.com
            </a>
          </p>
          <p>
            <strong>Creator Support:</strong>{' '}
            <a href="mailto:creators@aixontra.com" style={{ color: 'hsl(var(--primary))' }}>
              creators@aixontra.com
            </a>
          </p>
          <p>
            <strong>Report Content:</strong>{' '}
            <a href="mailto:report@aixontra.com" style={{ color: 'hsl(var(--primary))' }}>
              report@aixontra.com
            </a>
          </p>
        </div>
        <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid hsl(var(--border))' }}>
          <p className="muted">
            AIXONTRA is an open-source project. Visit our{' '}
            <Link href="/faq" style={{ color: 'hsl(var(--primary))' }}>FAQ page</Link>
            {' '}for more information about using the platform.
          </p>
        </div>
      </div>
    </div>
  );
}
