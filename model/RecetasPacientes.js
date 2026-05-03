import DataBase from "../config/Database.js";

export default class RecetasPacientes {
    constructor(id_receta,
                nombre_paciente,
                apellido_paciente,
                rut_paciente,
                id_paciente,
                id_profesional,
                profesional_responsable,
                descripcion_receta,
                estado_receta) {
        this.id_receta = id_receta;
        this.nombre_paciente = nombre_paciente;
        this.apellido_paciente = apellido_paciente;
        this.rut_paciente = rut_paciente;
        this.id_paciente = id_paciente;
        this.id_profesional = id_profesional;
        this.profesional_responsable = profesional_responsable;
        this.descripcion_receta = descripcion_receta;
        this.estado_receta = estado_receta;
    }

    //FUNCION PARA INSERTAR UNA NUEVA RECETA
    async insertarRecetaPacienteModel(
        nombre_paciente,
        apellido_paciente,
        rut_paciente,
        id_paciente,
        id_profesional,
        profesional_responsable,
        descripcion_receta) {
        try {
            const conexion = DataBase.getInstance();
            const query = "INSERT INTO recetas_pacientes (nombre_paciente, apellido_paciente, rut_paciente, id_paciente, id_profesional, profesional_responsable, descripcion_receta) VALUES (?,?,?,?,?,?,?)";
            const params = [nombre_paciente, apellido_paciente, rut_paciente, id_paciente, id_profesional, profesional_responsable, descripcion_receta];
            const resultado = await conexion.ejecutarQuery(query, params);
            if (resultado) {
                return resultado;
            } else {
                return resultado;
            }
        } catch (error) {
            throw error;
        }
    }

    //FUNCION PARA ACTUALIZAR UNA RECETA
    async actualizarRecetaPacienteModel(
        nombre_paciente,
        apellido_paciente,
        rut_paciente,
        id_paciente,
        id_profesional,
        profesional_responsable,
        descripcion_receta,
        id_receta) {
        try {
            const conexion = DataBase.getInstance();
            const query = "UPDATE recetas_pacientes SET nombre_paciente = ?, apellido_paciente = ?, rut_paciente = ?, id_paciente = ?, id_profesional = ?, profesional_responsable = ?, descripcion_receta = ? WHERE id_receta = ?";
            const params = [nombre_paciente, apellido_paciente, rut_paciente, id_paciente, id_profesional, profesional_responsable, descripcion_receta, id_receta];
            const resultado = await conexion.ejecutarQuery(query, params);
            if (resultado) {
                return resultado;
            } else {
                return resultado;
            }
        } catch (error) {
            throw error;
        }
    }

    //FUNCION PARA SELECCIONAR POR ID UNA RECETA
    async seleccionarRecetaPacientePorID(id_receta) {
        try {
            const conexion = DataBase.getInstance();
            const query = "SELECT * FROM recetas_pacientes WHERE id_receta = ? AND estado_receta <> 0";
            const params = [id_receta];
            const resultado = await conexion.ejecutarQuery(query, params);
            if (resultado) {
                return resultado;
            } else {
                return resultado;
            }
        } catch (error) {
            throw error;
        }
    }

    //FUNCION PARA ELIMINAR LOGICAMENTE CAMBIANDO ESTADO DE CERO A UNO UNA RECETA
    async eliminarRecetaPacientePorId(id_receta) {
        try {
            const conexion = DataBase.getInstance();
            const query = "UPDATE recetas_pacientes SET estado_receta = 0 WHERE id_receta = ?";
            const params = [id_receta];
            const resultado = await conexion.ejecutarQuery(query, params);
            if (resultado) {
                return resultado;
            } else {
                return resultado;
            }
        } catch (error) {
            throw error;
        }
    }

    //FUNCION PARA SELECCIONAR UNA RECETA
    async seleccionarRecetasPacientes() {
        try {
            const conexion = DataBase.getInstance();
            const query = "SELECT * FROM recetas_pacientes WHERE estado_receta <> 0";
            const resultado = await conexion.ejecutarQuery(query);
            if (resultado) {
                return resultado;
            } else {
                return resultado;
            }
        } catch (error) {
            throw error;
        }
    }



    //FUNCION PARA ELIMINAR LOGICAMENTE CAMBIANDO ESTADO DE CERO A UNO UNA RECETA
    async seleccionar_todas_Recetas_especificas_pacientes(id_paciente) {
        try {
            const conexion = DataBase.getInstance();
            const query = `
            SELECT 
            recetas_pacientes.*,
            pacienteDatos.id_paciente AS id_tabla_pacientes
            
            FROM recetas_pacientes
            INNER JOIN pacienteDatos ON
            pacienteDatos.id_paciente = recetas_pacientes.id_paciente
            
            WHERE 
            recetas_pacientes.id_paciente = ? AND
            estado_receta <> 0 AND
            estado_paciente <> 0
            `;
            const params = [id_paciente];
            const resultado = await conexion.ejecutarQuery(query, params);
            return resultado;

        } catch (error) {
            throw error;
        }
    }



    //FUNCION PARA SELECCIONAR POR ID UNA RECETA
    async seleccionar_por_profesional_id(id_profesional,id_paciente ) {
        try {
            const conexion = DataBase.getInstance();
            const query = `
            SELECT 
            recetas_pacientes.*,
            pacienteDatos.id_paciente AS id_paciente_tabla_pacientes
            
           FROM recetas_pacientes
           INNER JOIN pacienteDatos ON 
           pacienteDatos.id_paciente = recetas_pacientes.id_paciente
           
           WHERE
           recetas_pacientes.id_profesional = ? AND
           recetas_pacientes.id_paciente = ? AND
           estado_receta <> 0 
            `;
            const params = [id_profesional];
            const resultado = await conexion.ejecutarQuery(query, params);
            return resultado;
        } catch (error) {
            throw error;
        }
    }




}
