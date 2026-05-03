import FichaCampoController from '../controller/FichaCampoController.js';
import {Router} from "express";
const router = Router();

router.post("/listarPorCategoria", FichaCampoController.listarPorCategoria);
router.post("/obtenerPorId", FichaCampoController.obtenerPorId);
router.post("/insertarCampo", FichaCampoController.insertarCampo);
router.post("/actualizarCampo", FichaCampoController.actualizarCampo);
router.post("/eliminarCampo", FichaCampoController.eliminarCampo);



export default router;
