import { Router } from "express";
import livrosController from "../controllers/livrosController.js";

const router = Router();

// Rotas do bibliotecário
router.post("/criar", livrosController.criar);
router.delete("/remover/:id", livrosController.remover);

// Rotas gerais (todos podem ver a lista)
router.get("/", livrosController.listar);

export default router;
