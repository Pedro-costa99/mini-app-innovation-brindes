import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Navbar from "@/components/Navbar";
import { useAuthUser } from "@/store/authUser";

describe("Navbar", () => {
  it("Exibe o nome do usuário vindo do store", () => {
    useAuthUser.getState().setUser({
      codigo_usuario: "62",
      nome_usuario: "DINAMICA",
      codigo_grupo: "4",
      nome_grupo: "COMPRAS",
    });

    render(<Navbar showLogout={false} showIcons={false} />);
    expect(screen.getByText(/DINAMICA/i)).toBeInTheDocument();
  });
});
