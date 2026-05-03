import FichaPlantillaController from "../controller/FichaPlantillaController.js";
import {Router} from "express";
const router = Router();

router.get("/listarPlantillas", FichaPlantillaController.listarPlantillas);
router.post("/obtenerPorId", FichaPlantillaController.obtenerPorId);
router.post("/insertarPlantilla", FichaPlantillaController.insertarPlantilla);
router.post("/actualizarPlantilla", FichaPlantillaController.actualizarPlantilla);
router.post("/eliminarPlantilla", FichaPlantillaController.eliminarPlantilla);
router.post("/obtenerPlantillaCompleta", FichaPlantillaController.obtenerPlantillaCompleta);



export default router;
