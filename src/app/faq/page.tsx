import Link from "next/link";

export const metadata = {
  title: "FAQ - AIXONTRA",
  description: "Frequently asked questions about AIXONTRA, the curated AI music gallery.",
};

export default function FAQPage() {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h1 style={{ marginBottom: '1rem' }}>Frequently Asked Questions</h1>
        <p className="muted" style={{ fontSize: '1.125rem' }}>
          Everything you need to know about AIXONTRA
        </p>
      </div>

      {/* General Questions */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>General Questions</h2>
        
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.125rem', marginBottom: '0.75rem' }}>What is AIXONTRA?</h3>
          <p style={{ lineHeight: '1.7' }}>
            AIXONTRA is a curated music gallery platform dedicated to showcasing high-quality 
            AI-generated music. We review and approve tracks to ensure that every piece in our 
            collection meets our standards for creativity, quality, and artistic merit.
          </p>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.125rem', marginBottom: '0.75rem' }}>Is AIXONTRA free to use?</h3>
          <p style={{ lineHeight: '1.7' }}>
            Yes! Browsing and listening to music on AIXONTRA is completely free. You can create 
            a free account to upload tracks, like music, and interact with the community.
          </p>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.125rem', marginBottom: '0.75rem' }}>Do I need an account to listen to music?</h3>
          <p style={{ lineHeight: '1.7' }}>
            No account is required to browse and listen to approved tracks. However, you'll need 
            an account to upload music, like tracks, or follow creators.
          </p>
        </div>

        <div>
          <h3 style={{ fontSize: '1.125rem', marginBottom: '0.75rem' }}>What makes AIXONTRA different from other music platforms?</h3>
          <p style={{ lineHeight: '1.7' }}>
            Unlike other platforms, AIXONTRA is curated. Every track is reviewed before being 
            published, ensuring that our gallery maintains a high standard of quality. We're 
            focused specifically on AI-generated music and the unique creativity it enables.
          </p>
        </div>
      </div>

      {/* For Creators */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>For Creators</h2>
        
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.125rem', marginBottom: '0.75rem' }}>How do I upload a track?</h3>
          <ol style={{ marginLeft: '1.5rem', lineHeight: '1.7' }}>
            <li>Create an account and log in</li>
            <li>Click "Upload" in the navigation menu</li>
            <li>Fill out the track information (title, genre, mood, AI tool used)</li>
            <li>Upload your audio file (MP3, WAV, or FLAC)</li>
            <li>Optionally upload a cover image</li>
            <li>Submit your track for review</li>
          </ol>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.125rem', marginBottom: '0.75rem' }}>What AI tools can I use to create music?</h3>
          <p style={{ lineHeight: '1.7', marginBottom: '0.75rem' }}>
            We accept music created with any AI tool, including but not limited to:
          </p>
          <div className="row" style={{ flexWrap: 'wrap', marginBottom: '0.75rem' }}>
            <span className="badge">Suno AI</span>
            <span className="badge">Udio</span>
            <span className="badge">AIVA</span>
            <span className="badge">Mubert</span>
            <span className="badge">Soundraw</span>
            <span className="badge">Amper Music</span>
            <span className="badge">Custom AI Models</span>
          </div>
          <p className="muted" style={{ lineHeight: '1.7' }}>
            As long as the music is AI-generated (in whole or in part) and meets our quality 
            standards, we welcome it!
          </p>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.125rem', marginBottom: '0.75rem' }}>How long does the review process take?</h3>
          <p style={{ lineHeight: '1.7' }}>
            Our review team typically evaluates submissions within 24-48 hours. You'll receive 
            a notification once your track has been reviewed, whether it's approved or rejected.
          </p>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.125rem', marginBottom: '0.75rem' }}>What are the criteria for track approval?</h3>
          <p style={{ lineHeight: '1.7', marginBottom: '0.5rem' }}>
            We evaluate tracks based on several factors:
          </p>
          <ul style={{ marginLeft: '1.5rem', lineHeight: '1.7' }}>
            <li><strong>Audio Quality:</strong> Clear, well-mixed audio without major technical issues</li>
            <li><strong>Creativity:</strong> Unique and interesting musical ideas</li>
            <li><strong>Artistic Merit:</strong> Shows thoughtful use of AI tools</li>
            <li><strong>Completeness:</strong> Sounds finished and polished, not like a rough draft</li>
            <li><strong>Appropriateness:</strong> No copyright violations, hate speech, or explicit content without proper labeling</li>
          </ul>
        </div>

        <div>
          <h3 style={{ fontSize: '1.125rem', marginBottom: '0.75rem' }}>What if my track is rejected?</h3>
          <p style={{ lineHeight: '1.7' }}>
            If your track is rejected, you'll receive feedback explaining why. You're welcome to 
            revise your track and resubmit it, or submit different tracks. Rejection isn't personal—
            we're just maintaining our quality standards.
          </p>
        </div>
      </div>

      {/* Technical Questions */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Technical Questions</h2>
        
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.125rem', marginBottom: '0.75rem' }}>What audio formats are supported?</h3>
          <p style={{ lineHeight: '1.7' }}>
            We accept MP3, WAV, and FLAC files. We recommend high-quality formats (320kbps MP3 
            or lossless formats) for the best listening experience.
          </p>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.125rem', marginBottom: '0.75rem' }}>What's the maximum file size for uploads?</h3>
          <p style={{ lineHeight: '1.7' }}>
            Audio files can be up to 50MB. If your file is larger, try converting to a compressed 
            format like MP3 at 320kbps.
          </p>
        </div>

        <div>
          <h3 style={{ fontSize: '1.125rem', marginBottom: '0.75rem' }}>Can I upload cover art?</h3>
          <p style={{ lineHeight: '1.7' }}>
            Yes! You can upload a cover image (JPG or PNG, up to 5MB). We recommend square images 
            at least 1000x1000 pixels for best quality. If you don't upload a cover, a default 
            placeholder will be used.
          </p>
        </div>
      </div>

      {/* AI Music Philosophy */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>AI Music Philosophy</h2>
        
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.125rem', marginBottom: '0.75rem' }}>Is AI-generated music "real" music?</h3>
          <p style={{ lineHeight: '1.7' }}>
            Absolutely! AI is a tool, just like a synthesizer, drum machine, or digital audio 
            workstation. The creativity lies in how you use the tool. Crafting effective prompts, 
            curating outputs, and arranging AI-generated elements requires skill and artistic vision.
          </p>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.125rem', marginBottom: '0.75rem' }}>Does using AI mean I'm not a real musician?</h3>
          <p style={{ lineHeight: '1.7' }}>
            Not at all! Many celebrated musicians use technology to create their art. AI is simply 
            the latest tool in a long history of technological innovation in music. What matters 
            is the final result and the creative vision behind it.
          </p>
        </div>

        <div>
          <h3 style={{ fontSize: '1.125rem', marginBottom: '0.75rem' }}>What about copyright and AI-generated content?</h3>
          <p style={{ lineHeight: '1.7' }}>
            This is an evolving legal area. On AIXONTRA, we require that:
          </p>
          <ul style={{ marginLeft: '1.5rem', lineHeight: '1.7', marginTop: '0.5rem' }}>
            <li>You own the rights to upload and share the music</li>
            <li>The AI tool you used allows you to share the generated content</li>
            <li>Your music doesn't infringe on existing copyrights</li>
            <li>You properly attribute the AI tool(s) used</li>
          </ul>
        </div>
      </div>

      {/* Content & Community */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Content & Community</h2>
        
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.125rem', marginBottom: '0.75rem' }}>What content is not allowed on AIXONTRA?</h3>
          <p style={{ lineHeight: '1.7' }}>
            We prohibit:
          </p>
          <ul style={{ marginLeft: '1.5rem', lineHeight: '1.7', marginTop: '0.5rem' }}>
            <li>Copyrighted content you don't have rights to</li>
            <li>Hate speech or discriminatory content</li>
            <li>Explicit content without proper labeling</li>
            <li>Spam or low-effort submissions</li>
            <li>Content that violates privacy or impersonates others</li>
          </ul>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.125rem', marginBottom: '0.75rem' }}>How do I report inappropriate content?</h3>
          <p style={{ lineHeight: '1.7' }}>
            If you encounter content that violates our policies, please contact us at{' '}
            <a href="mailto:report@aixontra.com" style={{ color: 'hsl(var(--primary))' }}>
              report@aixontra.com
            </a>
            {' '}with details about the content and why you're reporting it.
          </p>
        </div>

        <div>
          <h3 style={{ fontSize: '1.125rem', marginBottom: '0.75rem' }}>Can I delete my tracks or account?</h3>
          <p style={{ lineHeight: '1.7' }}>
            Yes. You can manage your uploaded tracks through your profile. To delete your account, 
            please contact support. Note that deletion is permanent and cannot be undone.
          </p>
        </div>
      </div>

      {/* Contact & Support */}
      <div className="card">
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Still Have Questions?</h2>
        <p style={{ lineHeight: '1.7', marginBottom: '1rem' }}>
          Can't find what you're looking for? We're here to help!
        </p>
        <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <p>
            <strong>General Support:</strong>{' '}
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
        <div style={{ paddingTop: '1.5rem', borderTop: '1px solid hsl(var(--border))' }}>
          <p className="muted">
            For more information about our mission and values, visit our{' '}
            <Link href="/about" style={{ color: 'hsl(var(--primary))' }}>About page</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
