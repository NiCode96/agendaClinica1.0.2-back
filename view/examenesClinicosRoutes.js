import { Router } from 'express';
import ExamenesController from '../controller/ExamenesClinicosController.js';

const router = Router();

router.post('/insertarExamen', ExamenesController.insertarExamenController);
router.post('/actualizarExamen', ExamenesController.actualizarExamenController);
router.post('/seleccionarExamen', ExamenesController.seleccionarExamenController);
router.post('/eliminarExamen', ExamenesController.eliminarExamenController);
router.get('/seleccionarTodosExamenes', ExamenesController.seleccionarTodosLosExamenes);

export default router;