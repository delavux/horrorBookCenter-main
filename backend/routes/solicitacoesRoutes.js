import { Router } from "express";
import solicitacoesController from "../controllers/solicitacoesController.js";

const router = Router();

// Aluno solicita um livro
router.post("/criar", solicitacoesController.criarSolicitacao);

// Listar solicitações pendentes (bibliotecário)
router.get("/pendentes", solicitacoesController.listarPendentes);

// Aprovar ou negar
router.put("/status/:id", solicitacoesController.atualizarStatus);

// Registrar devolução
router.post("/devolucao/:id_solicitacao", solicitacoesController.devolver);

export default router;
