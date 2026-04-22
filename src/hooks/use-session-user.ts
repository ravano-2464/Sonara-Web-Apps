"use client";

import { useSyncExternalStore } from "react";
import type { User } from "@supabase/supabase-js";

import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

interface SessionUserSnapshot {
  user: User | null;
  loading: boolean;
}

const INITIAL_SNAPSHOT: SessionUserSnapshot = {
  user: null,
  loading: true,
};

let snapshot = INITIAL_SNAPSHOT;
let initialized = false;
const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

async function hydrateSessionUser() {
  try {
    const supabase = getSupabaseBrowserClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    snapshot = {
      user: session?.user ?? null,
      loading: false,
    };
  } catch {
    snapshot = {
      user: null,
      loading: false,
    };
  }

  notifyListeners();
}

function initializeSessionStore() {
  if (initialized) {
    return;
  }

  initialized = true;

  const supabase = getSupabaseBrowserClient();

  void hydrateSessionUser();

  supabase.auth.onAuthStateChange((_event, session) => {
    snapshot = {
      user: session?.user ?? null,
      loading: false,
    };

    notifyListeners();
  });
}

function subscribe(listener: () => void) {
  initializeSessionStore();
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function useSessionUser() {
  const currentSnapshot = useSyncExternalStore(
    subscribe,
    () => snapshot,
    () => INITIAL_SNAPSHOT,
  );

  return currentSnapshot;
}
