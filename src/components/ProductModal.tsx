"use client";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { useEffect, useState } from "react";
import Image from "next/image";

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
        <DialogPanel
          id="product-modal"
          className="w-full max-w-lg rounded-2xl bg-white p-6 shadow"
        >
          <DialogTitle className="text-xl font-bold text-black">
            {product.nome
              ? product.nome.charAt(0).toUpperCase() +
                product.nome.slice(1).toLowerCase()
              : ""}
          </DialogTitle>

          <div className="relative mt-3 h-60 w-full overflow-hidden rounded">
            <Image
              src={product.imagem}
              alt={product.nome || "Produto"}
              fill
              sizes="(max-width: 640px) 90vw, 600px"
              className="object-cover"
            />
          </div>

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
