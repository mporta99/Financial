import { BrowserRouter, Route, Routes } from "react-router-dom";
import AppShell from "./components/AppShell";
import HomePage from "./pages/HomePage";
import CarteirasPage from "./pages/CarteirasPage";
import SubcontasPage from "./pages/SubcontasPage";
import CategoriasPage from "./pages/CategoriasPage";
import LancamentosPage from "./pages/LancamentosPage";
import TransferenciasPage from "./pages/TransferenciasPage";
import MovimentarDinheiroPage from "./pages/MovimentarDinheiroPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppShell />}>
          <Route index element={<HomePage />} />
          <Route path="carteiras" element={<CarteirasPage />} />
          <Route path="subcontas" element={<SubcontasPage />} />
          <Route path="categorias" element={<CategoriasPage />} />
          <Route path="lancamentos" element={<LancamentosPage />} />
          <Route path="transferencias" element={<TransferenciasPage />} />
          <Route path="movimentar-dinheiro" element={<MovimentarDinheiroPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
