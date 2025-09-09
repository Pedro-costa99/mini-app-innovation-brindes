"use client";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { useEffect, useState } from "react";

type Product = {
  codigo: string;
  nome: string;
  referencia?: string;
  imagem: string;
  preco: string;
  descricao?: string;
};

export default function ProductModal({
  product,
  onClose,
}: {
  product: Product | null;
  onClose: () => void;
}) {
  const [open, setOpen] = useState(!!product);
  useEffect(() => setOpen(!!product), [product]);
  if (!product) return null;

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-lg rounded-2xl bg-white p-6 shadow">
          <DialogTitle className="text-xl font-bold">
            {product.nome}
          </DialogTitle>

          <img
            src={product.imagem}
            alt={product.nome}
            className="mt-3 h-60 w-full rounded object-cover"
          />

          <div className="mt-3 text-sm text-gray-600">
            <p>
              <span className="font-semibold">Código:</span> {product.codigo}
            </p>
            {product.referencia && (
              <p>
                <span className="font-semibold">Ref.:</span>{" "}
                {product.referencia}
              </p>
            )}
          </div>

          <p className="mt-2 text-lg font-bold text-blue-600">
            {Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(Number(product.preco))}
          </p>

          <p className="mt-2 text-gray-700">
            {product.descricao ?? "Sem descrição."}
          </p>

          <button
            onClick={onClose}
            className="mt-6 w-full rounded bg-blue-600 py-2 font-semibold text-white hover:bg-blue-700"
          >
            Fechar
          </button>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
