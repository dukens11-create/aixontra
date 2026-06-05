import { AdminApprovalQueue } from '@/components/voice-marketplace/AdminApprovalQueue';
import { VoiceCard } from '@/components/voice-marketplace/VoiceCard';
import { VoiceUploadForm } from '@/components/voice-marketplace/VoiceUploadForm';
import { filterVoiceModels, getTrendingVoices, getVoiceApprovalQueue, getVoiceCategories, VOICE_MODELS_TABLE_SCHEMA_SQL } from '@/lib/platform/voiceMarketplace';

type PageProps = {
  searchParams?: {
    q?: string;
    category?: string;
    trending?: string;
  };
};

export default function VoiceMarketplacePage({ searchParams }: PageProps) {
  const query = searchParams?.q ?? '';
  const category = searchParams?.category ?? 'all';
  const trendingOnly = searchParams?.trending === '1';

  const filteredVoices = filterVoiceModels(query, category, trendingOnly);
  const trendingVoices = getTrendingVoices(3);
  const categories = getVoiceCategories();
  const approvalQueue = getVoiceApprovalQueue();

  return (
    <div className="space-y-4 pb-6">
      <section className="card bg-white/5">
        <h1>AI Voice Marketplace</h1>
        <p className="muted mt-2">Upload and license AI voice models with moderation, commercial controls, and creator royalties.</p>
      </section>

      <section className="card bg-black/30">
        <h2>Voice model schema</h2>
        <p className="muted mt-2">Database schema placeholder for voice metadata, pricing, licensing, and moderation workflow.</p>
        <pre className="mt-3 overflow-x-auto rounded-xl border border-white/10 bg-black/40 p-3 text-xs text-slate-300">{VOICE_MODELS_TABLE_SCHEMA_SQL}</pre>
      </section>

      <VoiceUploadForm />

      <section className="card bg-white/5">
        <h2>Search & filters</h2>
        <form method="get" className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-4">
          <input name="q" defaultValue={query} className="input" placeholder="Search voices, tags, creator..." />
          <select name="category" defaultValue={category} className="select">
            <option value="all">All categories</option>
            {categories.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <label className="row rounded-xl border border-white/10 px-3 py-2">
            <input type="checkbox" name="trending" value="1" defaultChecked={trendingOnly} />
            <span>Trending voices only</span>
          </label>
          <button className="btn" type="submit">Apply filters</button>
        </form>
      </section>

      <section className="card bg-white/5">
        <h2>Trending voices</h2>
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
          {trendingVoices.map((voice) => <VoiceCard key={voice.id} voice={voice} />)}
        </div>
      </section>

      <section>
        <h2 className="mb-2">Voice cards</h2>
        {filteredVoices.length === 0 ? (
          <div className="card bg-white/5">
            <p className="muted">No voices found for current filters. Try another category or keyword.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {filteredVoices.map((voice) => <VoiceCard key={voice.id} voice={voice} />)}
          </div>
        )}
      </section>

      <AdminApprovalQueue initialQueue={approvalQueue} />
    </div>
  );
}
