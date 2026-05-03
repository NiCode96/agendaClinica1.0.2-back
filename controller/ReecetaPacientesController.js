import RecetasPacientes from '../model/RecetasPacientes.js';

export default class ReecetaPacientesController {

    constructor() {
    }

    //FUNCION PARA INSERTAR UNA NUEVA RECETA
    static async insertarRecetaPacienteController(req, res) {
        try{
            const { nombre_paciente, apellido_paciente, rut_paciente, id_paciente, id_profesional, profesional_responsable, descripcion_receta } = req.body;
            if (!nombre_paciente || !apellido_paciente || !rut_paciente || !id_paciente || !id_profesional || !profesional_responsable || !descripcion_receta) {
                return res.status(400).json({ message: "sindata" });
            }
            const recetaClass = new RecetasPacientes();
            const resultado = await recetaClass.insertarRecetaPacienteModel(
                nombre_paciente,
                apellido_paciente,
                rut_paciente,
                id_paciente,
                id_profesional,
                profesional_responsable,
                descripcion_receta);
            if (resultado.affectedRows > 0) {
                res.status(200).json({ message: true });
            } else {
                res.status(500).json({ message: false });
            }
        } catch (error) {
            res.status(500).json({ message: "serverError" });
        }
    }

    //FUNCION PARA ACTUALIZAR UNA RECETA
    static async actualizarRecetaPacienteController(req, res) {
        try{
            const { nombre_paciente, apellido_paciente, rut_paciente, id_paciente, id_profesional, profesional_responsable, descripcion_receta, id_receta } = req.body;
            if (!nombre_paciente || !apellido_paciente || !rut_paciente || !id_paciente || !id_profesional || !profesional_responsable || !descripcion_receta || !id_receta) {
                return res.status(400).json({ message: "sindata" });
            }

            const recetaClass = new RecetasPacientes();
            const resultado = await recetaClass.actualizarRecetaPacienteModel(nombre_paciente, apellido_paciente, rut_paciente, id_paciente, id_profesional, profesional_responsable, descripcion_receta, id_receta);

            if (resultado.affectedRows > 0) {
                res.status(200).json({ message: true });
            } else {
                res.status(500).json({ message: false });
            }
        } catch (error) {
            res.status(500).json({ message: "serverError" });
        }
    }

    //FUNCION PARA SELECCIONAR POR ID UNA RECETA
    static async seleccionarRecetaPacienteController(req, res) {
        try{
            const {id_receta} = req.body;
            if (!id_receta) {
                return res.status(400).json({ message: "sindata" });
            }
            const recetaClass = new RecetasPacientes();
            const resultado = await recetaClass.seleccionarRecetaPacientePorID(id_receta);

            if (resultado) {
                res.status(200).json(resultado);
            } else {
                res.status(500).json({ message: false });
            }
        } catch (error) {
            res.status(500).json({ message: "serverError" });
        }
    }

    //FUNCION PARA ELIMINAR LOGICAMENTE CAMBIANDO ESTADO DE CERO A UNO UNA RECETA
    static async eliminarRecetaPacienteController(req, res) {
        try {
            const {id_receta} = req.body;
            if (!id_receta) {
                return res.status(400).json({message: "sindata"});
            }
            const recetaClass = new RecetasPacientes();
            const resultado = await recetaClass.eliminarRecetaPacientePorId(id_receta);

            if (resultado.affectedRows > 0) {
                res.status(200).json({message: true});
            } else {
                res.status(500).json({message: false});
            }
        } catch (error) {
            res.status(500).json({message: "serverError"});
        }
    }

    //FUNCION PARA SELECCIONAR LISTADO DE RECETAS
    static async seleccionarTodasLasRecetas(req, res) {
        try{
            const recetaClass = new RecetasPacientes();
            const resultado = await recetaClass.seleccionarRecetasPacientes();

            if (resultado) {
                res.status(200).json(resultado);
            } else {
                res.status(500).json({message: false});
            }
        } catch (error) {
            res.status(500).json({message: "serverError"});
        }
    }





    static async seleccionar_todas_Recetas_especificas_pacientes(req, res) {
        try {
            const {id_paciente} = req.body;
            if (!id_paciente) {
                return res.status(400).json({message: "sindata"});
            }
            const recetaClass = new RecetasPacientes();
            const resultado = await recetaClass.seleccionar_todas_Recetas_especificas_pacientes(id_paciente);

            if (Array.isArray(resultado) && (resultado.length > 0)) {
                res.status(200).json(resultado);
            } else {
                res.status(200).json([]);
            }
        } catch (error) {
            res.status(500).json({message: "serverError"});
        }
    }









    //SELECCIONAR RECETAS POR ID ESPECIFICO DE PROFESIONAL ASIGANDO
    static async seleccionar_por_profesional_id(req, res) {
        try {
            const {id_profesional, id_paciente} = req.body;
            if (!id_profesional, id_paciente) {
                return res.status(400).json({message: "sindata"});
            }
            const recetaClass = new RecetasPacientes();
            const resultado = await recetaClass.seleccionar_por_profesional_id(id_profesional, id_paciente);

            if (Array.isArray(resultado) && (resultado.length > 0)) {
                res.status(200).json(resultado);
            } else {
                res.status(200).json([]);
            }
        } catch (error) {
            res.status(500).json({message: "serverError"});
        }
    }



}
