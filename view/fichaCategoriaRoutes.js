import FichaCategoriaController from "../controller/FichaCategoriaController.js";
import {Router} from "express";
const router = Router();

router.post("/listarPorPlantilla", FichaCategoriaController.listarPorPlantilla);
router.post("/obtenerPorId", FichaCategoriaController.obtenerPorId);
router.post("/insertarCategoria", FichaCategoriaController.insertarCategoria);
router.post("/actualizarCategoria", FichaCategoriaController.actualizarCategoria);
router.post("/eliminarCategoria", FichaCategoriaController.eliminarCategoria);



export default router;
