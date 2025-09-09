import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ProductFavorite = {
  codigo: string;
  nome: string;
  preco: string;
  imagem: string;
  descricao?: string;
};

type State = {
  favorites: ProductFavorite[];
  toggle: (p: ProductFavorite) => void;
  isFavorito: (codigo: string) => boolean;
  clear: () => void;
};

export const useFavorites = create<State>()(
  persist(
    (set, get) => ({
      favorites: [],
      toggle: (p) => {
        const { favorites } = get();
        const exists = favorites.some((f) => f.codigo === p.codigo);
        set({
          favorites: exists
            ? favorites.filter((f) => f.codigo !== p.codigo)
            : [...favorites, p],
        });
      },
      isFavorito: (codigo) => get().favorites.some((f) => f.codigo === codigo),
      clear: () => set({ favorites: [] }),
    }),
    { name: "favorites-storage" }
  )
);
