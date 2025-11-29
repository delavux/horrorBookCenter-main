import { Router } from "express";
import usuariosController from "../controllers/usuariosController.js";

const router = Router();

router.post("/cadastro", usuariosController.cadastrar);
router.post("/login", usuariosController.login);

export default router;
