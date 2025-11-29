import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import usuariosRoutes from './routes/usuariosRoutes.js';
import livrosRoutes from './routes/livrosRoutes.js';
import solicitacoesRoutes from './routes/solicitacoesRoutes.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/usuarios", usuariosRoutes);
app.use("/api/livros", livrosRoutes);
app.use("/api/solicitacoes", solicitacoesRoutes);

app.listen(process.env.PORT || 3000, () => {
    console.log("Servidor rodando na porta", process.env.PORT || 3000);
});