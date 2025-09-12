import useSWR from "swr";
import api from "@/lib/api";

export type Product = {
  codigo: string;
  nome: string;
  referencia?: string;
  imagem: string;
  preco: string;
  descricao?: string;
};

function toArray<T = any>(raw: any): T[] {
  if (Array.isArray(raw)) return raw as T[];
  if (Array.isArray(raw?.data)) return raw.data as T[];
  if (Array.isArray(raw?.items)) return raw.items as T[];
  if (Array.isArray(raw?.resultado)) return raw.resultado as T[];
  if (raw && typeof raw === "object") return [raw as T];
  return [];
}

type Params = { queryText: string };

export function useProducts({ queryText }: Params) {
  // chave do SWR muda conforme a busca
  const key = queryText.trim()
    ? ["products:search", queryText.trim()]
    : ["products:list"];

  const { data, error, isLoading, mutate } = useSWR(
    key,
    async () => {
      const url = "/api/innova-dinamica/produtos/listar";

      // decide POST (com filtro) ou GET (lista)
      const isCode = (s: string) =>
        /^\d+$/.test(s) || (/\d/.test(s) && !/\s/.test(s));
      const req = queryText.trim()
        ? api.post(
            url,
            isCode(queryText)
              ? { codigo_produto: queryText }
              : { nome_produto: queryText }
          )
        : api.get(url);

      const res = await req;
      return toArray<Product>(res.data);
    },
    { revalidateOnFocus: false, dedupingInterval: 10_000 }
  );

  return {
    products: data ?? [],
    error,
    isLoading,
    refetch: () => mutate(),
  };
}
