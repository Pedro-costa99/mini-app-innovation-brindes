import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AuthUser = {
  codigo_usuario: string;
  nome_usuario: string;
  codigo_grupo: string;
  nome_grupo: string;
} | null;

function clean(s?: string) {
  return (s ?? "").replace(/\s+/g, " ").trim();
}

function normalizeUser(u: any): AuthUser {
  if (!u || typeof u !== "object") return null;
  return {
    codigo_usuario: clean(u.codigo_usuario),
    nome_usuario: clean(u.nome_usuario),
    codigo_grupo: clean(u.codigo_grupo),
    nome_grupo: clean(u.nome_grupo),
  };
}

type State = {
  user: AuthUser;
  setUser: (u: any) => void; // aceita o raw da API e normaliza
  clearUser: () => void;
};

export const useAuthUser = create<State>()(
  persist(
    (set) => ({
      user: null,
      setUser: (u) => set({ user: normalizeUser(u) }),
      clearUser: () => set({ user: null }),
    }),
    { name: "user-storage" } // localStorage
  )
);
