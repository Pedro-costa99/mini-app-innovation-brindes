import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProductModal from "@/components/ProductModal";

const product = {
  codigo: "123",
  nome: "CANETA XYZ",
  referencia: "REF-9",
  imagem: "/images/placeholder.png",
  preco: "12.34",
  descricao: "Uma caneta legal",
};

describe("ProductModal", () => {
  it("Exibe infos do produto selecionado e fecha", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(<ProductModal product={product} onClose={onClose} />);
    expect(screen.getByText("Caneta xyz")).toBeInTheDocument();
    expect(screen.getByText(/R\$\s?12,34/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /fechar/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
