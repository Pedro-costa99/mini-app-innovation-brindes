import Head from "next/head";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import api from "@/lib/api";
import { getToken, clearToken } from "@/utils/authStorage";
import useDebounce from "@/hooks/useDebounce";
import useIntersection from "@/hooks/useIntersection";
import { useFavorites } from "@/store/useFavorites";
import Navbar from "@/components/Navbar";
import Image from "next/image";

const ProductModal = dynamic(() => import("@/components/ProductModal"), {
  ssr: false,
});

type Product = {
  codigo: string;
  nome: string;
  referencia?: string;
  imagem: string;
  preco: string;
  descricao?: string;
};

const BATCH_SIZE = 12;

function toArray<T = any>(raw: any): T[] {
  if (Array.isArray(raw)) return raw as T[];
  if (Array.isArray(raw?.data)) return raw.data as T[];
  if (Array.isArray(raw?.items)) return raw.items as T[];
  if (Array.isArray(raw?.resultado)) return raw.resultado as T[];
  if (raw && typeof raw === "object") return [raw as T];
  return [];
}

export default function ProductsPage() {
  const router = useRouter();
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
    } else {
      setAuthReady(true);
    }
  }, [router]);

  if (!authReady) return null;
  return <ProductsContent />;
}

function ProductsContent() {
  const router = useRouter();
  const [search, setBusca] = useState("");
  const debouncedSearch = useDebounce(search, 400);
  const [order, setOrder] = useState<
    "" | "nome-asc" | "nome-desc" | "preco-asc" | "preco-desc"
  >("");
  const [onlyFav, setOnlyFav] = useState(false);

  // dados
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadTick, setReloadTick] = useState(0);

  // infinite scroll
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const { ref: sentinelRef, isIntersecting } = useIntersection({
    root: null,
    rootMargin: "200px",
    threshold: 0,
  });
  const loadingMoreRef = useRef(false);

  // favorites
  const { favorites, toggle, isFavorito } = useFavorites();

  // modal
  const [selected, setSelected] = useState<Product | null>(null);

  // ===== BUSCA (carga inicial + search) =====
  useEffect(() => {
    function normalizeSearch(text: string): string {
      return text
        .normalize("NFD") // separa acentos
        .replace(/[\u0300-\u036f]/g, "") // remove marcas de acento
        .replace(/\s+/g, " ") // reduz múltiplos espaços
        .trim()
        .toLowerCase(); // força minúsculo
    }

    const queryText = normalizeSearch(debouncedSearch);
    const controller = new AbortController();

    async function run() {
      setError("");
      setLoading(true);
      try {
        const url = "/api/innova-dinamica/produtos/listar";
        const isCode = (s: string) =>
          /^\d+$/.test(s) || (/\d/.test(s) && !/\s/.test(s));

        const request = queryText
          ? api.post(
              url,
              isCode(queryText)
                ? { codigo_produto: queryText }
                : { nome_produto: queryText },
              { signal: controller.signal }
            )
          : api.get(url, { signal: controller.signal });

        const { data } = await request;
        if (controller.signal.aborted) return;

        setProducts(toArray<Product>(data));
        setPage(1); // reseta paginação ao trocar a fonte de dados
        setLoadingMore(false);
        loadingMoreRef.current = false;
      } catch (e: any) {
        if (e?.code === "ERR_CANCELED") return;
        if (e?.response?.status === 401) {
          clearToken();
          router.replace("/login");
          return;
        }
        setError("Não foi possível carregar os products. Tente novamente.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    run();
    return () => controller.abort();
    // reloadTick permite "Tentar novamente"
  }, [debouncedSearch, reloadTick, router]);

  // ===== BASE LIST (favoritos) =====
  const baseList: Product[] = useMemo(() => {
    const productsSaved = Array.isArray(products) ? products : [];
    if (!onlyFav) return productsSaved;
    const favSafe = Array.isArray(favorites) ? favorites : [];
    const favMap = new Map(favSafe.map((f) => [f.codigo, true]));
    return productsSaved.filter((p) => favMap.has(p.codigo));
  }, [products, onlyFav, favorites]);

  // ===== ORDENAÇÃO =====
  const productsOrdered = useMemo<Product[]>(() => {
    const arr = [...(Array.isArray(baseList) ? baseList : [])];
    switch (order) {
      case "nome-asc":
        return arr.sort((a, b) =>
          a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" })
        );
      case "nome-desc":
        return arr.sort((a, b) =>
          b.nome.localeCompare(a.nome, "pt-BR", { sensitivity: "base" })
        );
      case "preco-asc":
        return arr.sort((a, b) => Number(a.preco) - Number(b.preco));
      case "preco-desc":
        return arr.sort((a, b) => Number(b.preco) - Number(a.preco));
      default:
        return arr;
    }
  }, [baseList, order]);

  // ===== PAGINAÇÃO CLIENT =====
  const total = productsOrdered.length;
  const maxPages = Math.max(1, Math.ceil(total / BATCH_SIZE));
  const safePage = Math.min(page, maxPages);
  const visible = productsOrdered.slice(0, safePage * BATCH_SIZE);
  const hasMore = !onlyFav && safePage < maxPages;

  // reset página ao mudar ordenação/fav
  useEffect(() => {
    setPage(1);
    setLoadingMore(false);
    loadingMoreRef.current = false;
  }, [order, onlyFav]);

  // ===== INFINITE SCROLL OBSERVER =====
  useEffect(() => {
    if (!isIntersecting) return;
    if (!hasMore) return;
    if (loading) return;
    if (loadingMoreRef.current) return;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    setPage((p) => p + 1);

    setLoadingMore(false);
    loadingMoreRef.current = false;
  }, [isIntersecting, hasMore, loading]);

  return (
    <>
      <Head>
        <title>Produtos — Mini App</title>
        <meta
          name="description"
          content="Catálogo de products com search, ordenação, favorites, modal e infinite scroll."
        />
      </Head>
      <Navbar />

      <main className="min-h-screen bg-gray-50 p-6">
        {/* Header com filtros */}
        <header className="mx-auto mb-4 flex max-w-6xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1">
            <input
              value={search}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome ou código..."
              className="w-full rounded-lg border bg-white p-2 text-black placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500"
              disabled={onlyFav}
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="relative inline-block w-48">
              <select
                value={order}
                onChange={(e) => setOrder(e.target.value as any)}
                className="w-full appearance-none rounded-[2px] border border-gray-300 bg-white px-4 py-2 pr-10 text-sm text-gray-700 shadow-sm outline-none focus:border-[#80BC04] focus:ring-2 focus:ring-[#80BC04]/40"
                aria-label="Ordenar"
              >
                <option value="">Ordenar por</option>
                <option value="nome-asc">Nome (A → Z)</option>
                <option value="nome-desc">Nome (Z → A)</option>
                <option value="preco-asc">Preço (low → high)</option>
                <option value="preco-desc">Preço (high → low)</option>
              </select>

              {/* seta custom */}
              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
                <svg
                  className="h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </span>
            </div>

            <button
              onClick={() => setOnlyFav((v) => !v)}
              aria-pressed={onlyFav}
              title="Show only favorites"
              className={`inline-flex items-center gap-2 rounded-[2px] border px-2 py-1 text-sm font-medium shadow-sm transition ${
                onlyFav
                  ? "bg-yellow-400 text-black border-yellow-400 hover:bg-yellow-500"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              <span className="text-lg">{onlyFav ? "★" : "☆"}</span>
              Favoritos
            </button>
          </div>
        </header>

        {/* Erro */}
        {error && (
          <div className="mx-auto mb-4 max-w-6xl rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}{" "}
            <button
              onClick={() => setReloadTick((n) => n + 1)}
              className="underline"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {loading ? (
          <section className="mx-auto grid max-w-6xl grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {Array.from({ length: BATCH_SIZE }).map((_, i) => (
              <div key={i} className="rounded-lg border bg-white p-4 shadow">
                <div className="h-40 w-full animate-pulse rounded bg-gray-200" />
                <div className="mt-3 h-4 w-3/4 animate-pulse rounded bg-gray-200" />
                <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-gray-200" />
                <div className="mt-3 h-8 w-full animate-pulse rounded bg-gray-200" />
              </div>
            ))}
          </section>
        ) : visible.length === 0 ? (
          <p className="mx-auto max-w-6xl text-gray-500">
            Nenhum produto encontrado.
          </p>
        ) : (
          <>
            <section className="mx-auto grid max-w-6xl grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
              {visible.map((p, i) => (
                <article
                  key={`${p.codigo || "item"}-${i}`}
                  className="relative"
                >
                  <header className="mb-2 text-center">
                    <h2 className="text-[17px] font-semibold leading-tight text-black truncate">
                      {p.nome
                        ? p.nome.charAt(0).toUpperCase() +
                          p.nome.slice(1).toLowerCase()
                        : ""}
                    </h2>
                    <p className="-mt-0.5 text-[13px] font-normal text-gray-700">
                      {p.codigo}
                    </p>
                  </header>

                  <div className="relative rounded-[2px] border border-gray-200 bg-white p-3 shadow-sm">
                    <button
                      onClick={() => toggle(p)}
                      className="absolute left-2 top-2 text-xl leading-none text-gray-600 hover:text-amber-500"
                      aria-label={
                        isFavorito(p.codigo)
                          ? "Remover dos favorites"
                          : "Adicionar aos favorites"
                      }
                      title="Favoritar"
                    >
                      {isFavorito(p.codigo) ? "★" : "☆"}
                    </button>
                    <span className="absolute bg-cyan-500/10 right-2 top-2 text-[12px] font-bold uppercase tracking-wide text-sky-600">
                      EXCLUSIVO!
                    </span>
                    <div className="mt-5">
                      <img
                        src={p.imagem}
                        alt={p.nome}
                        className="mx-auto h-44 w-full rounded object-contain"
                        loading="lazy"
                      />
                    </div>
                    <div className="mt-3 inline-flex items-center rounded-r border border-l-0 border-gray-300 bg-white px-2.5 py-1.5">
                      <Image
                        src="/images/img-box.png"
                        alt="Com embalagem especial"
                        width={50}
                        height={50}
                        className="shrink-0"
                      />
                      <div className="ml-2 leading-tight">
                        <span className="block text-[12px] font-semibold text-gray-700">
                          com embalagem
                        </span>
                        <span className="block text-[12px] font-bold text-gray-700">
                          especial
                        </span>
                      </div>
                    </div>
                    <p className="mt-2 line-clamp-2 text-[13px] leading-snug text-gray-700">
                      {p.descricao ||
                        "Caneta plástica com funções esferográfica e marca texto, com..."}
                    </p>
                    <div className="mt-3">
                      <p className="text-[12px] font-semibold text-gray-700">
                        Cores:
                      </p>
                      <div className="mt-1 inline-grid grid-cols-6 gap-x-2 gap-y-2">
                        {[
                          "#7C2D12",
                          "#2563EB",
                          "#4B5563",
                          "#60A5FA",
                          "#65A30D",
                          "#374151",
                          "#F3F4F6",
                          "#9A3412",
                          "#22C55E",
                          "#06B6D4",
                          "#38BDF8",
                          "#F97316",
                          "#FACC15",
                          "#4C1D95",
                        ].map((c, idx) => (
                          <span
                            key={idx}
                            className="h-3.5 w-3.5 rounded-full border border-black/10"
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="mt-3 flex justify-end text-right">
                      <div>
                        <p className="text-[12px] text-gray-500">a partir de</p>
                        <p className="leading-[1.1] text-2xl font-extrabold text-gray-900">
                          {Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(Number(p.preco))}
                        </p>
                        <p className="text-[10px] text-gray-400 -mt-0.5">
                          gerado pela melhor oferta
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelected(p)}
                    className="mt-3 inline-flex h-8 w-full items-center justify-center rounded-[2px] bg-[#7CB800] text-base font-extrabold uppercase tracking-wide leading-none text-white hover:brightness-95"
                  >
                    CONFIRA
                  </button>
                </article>
              ))}
            </section>

            {!onlyFav && (
              <>
                {hasMore ? (
                  <div
                    ref={sentinelRef}
                    className="mx-auto flex h-12 max-w-6xl items-center justify-center"
                  >
                    {loadingMore && (
                      <span className="text-sm text-gray-500">
                        Carregando mais...
                      </span>
                    )}
                  </div>
                ) : (
                  total > 0 && (
                    <div className="mx-auto flex h-10 max-w-6xl items-center justify-center">
                      <span className="text-sm text-gray-400">
                        Fim da lista
                      </span>
                    </div>
                  )
                )}

                {hasMore && !loadingMore && (
                  <div className="mx-auto mt-2 max-w-6xl text-center">
                    <button
                      onClick={() => setPage((p) => p + 1)}
                      className="rounded border bg-white px-4 py-2 text-sm shadow hover:bg-gray-50"
                    >
                      Carregar mais
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}

        <ProductModal product={selected} onClose={() => setSelected(null)} />
      </main>
    </>
  );
}
