"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useI18n } from "@/components/providers/I18nProvider";
import { supabaseBrowser } from "@/lib/supabase/browser";

export default function Nav() {
  const [supabaseReady, setSupabaseReady] = useState<ReturnType<typeof supabaseBrowser> | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const { t } = useI18n();

  useEffect(() => {
    try {
      const client = supabaseBrowser();
      setSupabaseReady(client);
      client.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
      const { data: sub } = client.auth.onAuthStateChange((_e, session) => {
        setEmail(session?.user?.email ?? null);
      });
      return () => sub.subscription.unsubscribe();
    } catch {
      setSupabaseReady(null);
      setEmail(null);
      return undefined;
    }
  }, []);

  const signOut = async () => {
    if (!supabaseReady) return;
    await supabaseReady.auth.signOut();
    window.location.href = "/";
  };

  return (
    <div style={{ borderBottom: "1px solid #242436" }}>
      <div className="container row" style={{ justifyContent: "space-between", paddingTop: '1rem', paddingBottom: '1rem' }}>
        <div className="row">
          <Link href="/" style={{ fontWeight: 900, letterSpacing: 1 }}>AIXENTRA</Link>
          <span className="badge">{t('nav.tagline')}</span>
        </div>
        <div className="row" style={{ alignItems: "flex-start" }}>
          <Link href="/generate" className="badge">{t('nav.generate')}</Link>
          <Link href="/lyrics-studio" className="badge">{t('nav.lyricsStudio')}</Link>
          <Link href="/feed" className="badge">{t('nav.feed')}</Link>
          <Link href="/marketplace" className="badge">{t('nav.marketplace')}</Link>
          <Link href="/trending" className="badge">{t('nav.trending')}</Link>
          <Link href="/search" className="badge">{t('nav.search')}</Link>
          <Link href="/library" className="badge">{t('nav.library')}</Link>
          <Link href="/notifications" className="badge">{t('nav.notifications')}</Link>
          <Link href="/terms" className="badge">{t('nav.terms')}</Link>
          <Link href="/privacy" className="badge">{t('nav.privacy')}</Link>
          {email && <Link href="/dashboard/creator" className="badge">{t('nav.creatorHub')}</Link>}
          <Link href="/admin" className="badge">{t('nav.admin')}</Link>
          {!email ? (
            <>
              <Link href="/login" className="badge">{t('nav.login')}</Link>
              <Link href="/signup" className="badge">{t('nav.signup')}</Link>
            </>
          ) : (
            <>
              <span className="muted">{email}</span>
              <button className="btn secondary" onClick={signOut}>{t('nav.signout')}</button>
            </>
          )}
          <LanguageSwitcher />
        </div>
      </div>
    </div>
  );
}
