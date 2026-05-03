import Examenes from '../model/ExamenesClinicos.js';

export default class ExamenesController {
    constructor() {
    }

    //FUNCION PARA INSERTAR UN NUEVO EXAMEN
    static async insertarExamenController(req, res) {
        try {
            const { nombre_examen, descripcion_examen, valor_examen } = req.body;
            if (!nombre_examen || !descripcion_examen || !valor_examen) {
                return res.status(400).json({ message: "sindata" });
            }
            const examenClass = new Examenes();
            const resultado = await examenClass.insertarExamenModel(nombre_examen, descripcion_examen, valor_examen);

            if (resultado.affectedRows > 0) {
                res.status(200).json({ message: true });
            } else {
                res.status(500).json({ message: false });
            }
        } catch (error) {
            res.status(500).json({ message: "serverError" });
        }
    }

    //FUNCION PARA ACTUALIZAR UN EXAMEN
    static async actualizarExamenController(req, res) {
        try {
            const { nombre_examen, descripcion_examen, valor_examen, id_examen } = req.body;
            if (!nombre_examen || !descripcion_examen || !valor_examen || !id_examen) {
                return res.status(400).json({ message: "sindata" });
            }
            const examenClass = new Examenes();
            const resultado = await examenClass.actualizarExamenModel(nombre_examen, descripcion_examen, valor_examen, id_examen);

            if (resultado.affectedRows > 0) {
                res.status(200).json({ message: true });
            } else {
                res.status(500).json({ message: false });
            }
        } catch (error) {
            res.status(500).json({ message: "serverError" });
        }
    }

    //FUNCION PARA SELECCIONAR POR ID UN EXAMEN
    static async seleccionarExamenController(req, res) {
        try {
            const { id_examen } = req.body;
            if (!id_examen) {
                return res.status(400).json({ message: "sindata" });
            }
            const examenClass = new Examenes();
            const resultado = await examenClass.seleccionarExamenPorID(id_examen);

            if (resultado) {
                res.status(200).json(resultado);
            } else {
                res.status(500).json({ message: false });
            }
        } catch (error) {
            res.status(500).json({ message: "serverError" });
        }
    }

    //FUNCION PARA ELIMINAR LOGICAMENTE CAMBIANDO ESTADO A CERO UN EXAMEN
    static async eliminarExamenController(req, res) {
        try {
            const { id_examen } = req.body;
            if (!id_examen) {
                return res.status(400).json({ message: "sindata" });
            }
            const examenClass = new Examenes();
            const resultado = await examenClass.eliminarExamenPorId(id_examen);

            if (resultado.affectedRows > 0) {
                res.status(200).json({ message: true });
            } else {
                res.status(500).json({ message: false });
            }
        } catch (error) {
            res.status(500).json({ message: "serverError" });
        }
    }

    //FUNCION PARA SELECCIONAR LISTADO DE EXAMENES
    static async seleccionarTodosLosExamenes(req, res) {
        try {
            const examenClass = new Examenes();
            const resultado = await examenClass.seleccionarExamenes();

            if (resultado) {
                res.status(200).json(resultado);
            } else {
                res.status(500).json({ message: false });
            }
        } catch (error) {
            res.status(500).json({ message: "serverError" });
        }
    }
}