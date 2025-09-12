import { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import api from "@/lib/api";
import { setToken } from "@/utils/authStorage";
import { useAuthUser } from "@/store/authUser";

type LoginResponse = {
  status: number; // 1 ok, 0 erro
  message: string;
  token_de_acesso?: string;
  dados_usuario?: {
    codigo_usuario: string;
    nome_usuario: string;
    codigo_grupo: string;
    nome_grupo: string;
  };
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formErr, setFormErr] = useState("");
  const setUser = useAuthUser((s) => s.setUser);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormErr("");
    setLoading(true);
    try {
      const { data } = await api.post<LoginResponse>(
        "/api/innova-dinamica/login/acessar",
        { email, senha: password }
      );

      if (data.status === 1 && data.token_de_acesso) {
        setToken(data.token_de_acesso, remember);
        if (typeof document !== "undefined") {
          document.cookie = `auth_token=${data.token_de_acesso}; path=/; SameSite=Lax`;
        }
        setUser(data.dados_usuario ?? null);
        router.push("/produtos");
      } else {
        setFormErr(data.message || "Email ou password inválidos.");
      }
    } catch {
      setFormErr("Não foi possível conectar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Head>
        <title>Login — Mini App</title>
        <meta
          name="description"
          content="Acesse o Mini App para consultar os produtos."
        />
      </Head>

      <main
        className="relative min-h-screen flex flex-col items-center justify-center"
        style={{
          backgroundImage: "url(/images/bg-app.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/10" aria-hidden />

        <h1 className="relative z-10 mb-6 text-center text-2xl md:text-3xl font-extrabold text-lime-600 drop-shadow-sm">
          Bem-vindo a Innovation Brindes
        </h1>

        <form
          onSubmit={handleSubmit}
          aria-describedby={formErr ? "form-error" : undefined}
          className="relative z-10 w-[92%] max-w-[560px] rounded-3xl bg-[#80BC04] px-10 pt-24 pb-12 shadow-2xl"
          noValidate
        >
          {formErr && (
            <div
              id="form-error"
              role="alert"
              aria-live="assertive"
              className="mb-4 rounded-xl border border-red-200 bg-red-50/90 p-3 text-sm text-red-700"
            >
              {formErr}
            </div>
          )}

          <div className="mx-auto w-[86%] max-w-[400px]">
            <div className="space-y-3">
              {/* Usuário */}
              <label htmlFor="email" className="relative block">
                <span className="sr-only">Usuário</span>
                <span
                  className="pointer-events-none absolute inset-y-0 left-5 flex items-center text-gray-500"
                  aria-hidden="true"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5Z" />
                  </svg>
                </span>
                <input
                  id="email"
                  name="username"
                  type="email"
                  className="h-14 w-full rounded-full bg-white pl-14 pr-4 text-[15px] text-gray-700 placeholder:text-gray-500 outline-none focus:outline-none"
                  placeholder="Usuário"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="username"
                  aria-invalid={formErr ? true : undefined}
                  aria-describedby={formErr ? "form-error" : undefined}
                />
              </label>

              {/* Senha */}
              <label htmlFor="password" className="relative block">
                <span className="sr-only">Senha</span>
                <span
                  className="pointer-events-none absolute inset-y-0 left-5 flex items-center text-gray-500"
                  aria-hidden="true"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M17 9h-1V7a4 4 0 1 0-8 0v2H7a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2Zm-6 0V7a3 3 0 0 1 6 0v2h-6Z" />
                  </svg>
                </span>
                <input
                  id="password"
                  name="password"
                  type="password"
                  className="h-14 w-full rounded-full bg-white pl-14 pr-4 text-[15px] text-gray-700 placeholder:text-gray-500 outline-none focus:outline-none"
                  placeholder="Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  aria-invalid={formErr ? true : undefined}
                  aria-describedby={formErr ? "form-error" : undefined}
                />
              </label>
            </div>

            <div className="mt-3 mb-6 flex items-center justify-between">
              <label
                htmlFor="remember"
                className="inline-flex items-center gap-2 text-[13px] text-white/95"
              >
                <input
                  id="remember"
                  type="checkbox"
                  className="h-4 w-4 rounded border-white/60 bg-white/90 accent-lime-600"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                Manter logado
              </label>

              <a
                href="#"
                className="text-[13px] text-white/95 hover:underline underline-offset-2"
                aria-disabled="true"
              >
                Esqueceu a senha?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              aria-busy={loading}
              className="mx-auto block h-12 w-44 rounded-full bg-white text-base font-semibold text-gray-700 shadow-md hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-80"
            >
              {loading ? "Entrando..." : "Login"}
            </button>
          </div>
        </form>

        <div className="h-8" />
      </main>
    </>
  );
}
