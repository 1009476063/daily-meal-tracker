"use client";

import { createClient, Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

let client: ReturnType<typeof createClient> | null = null;

function getClient() {
  if (client) return client;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  client = createClient(supabaseUrl, supabaseAnonKey);
  return client;
}

export function createSupabaseBrowserClient() {
  return getClient();
}

export function useSupabaseSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const supabase = getClient();
    supabase.auth.getSession().then(({ data }) => {
      if (active) setSession(data.session ?? null);
      if (active) setLoading(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (active) setSession(newSession);
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  return { session, loading };
}
