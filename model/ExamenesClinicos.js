
import DataBase from "../config/Database.js";

export default class Examenes {
    constructor(id_examen, nombre_examen, descripcion_examen, valor_examen, estado_examen) {
        this.id_examen = id_examen;
        this.nombre_examen = nombre_examen;
        this.descripcion_examen = descripcion_examen;
        this.valor_examen = valor_examen;
        this.estado_examen = estado_examen;
    }

    // FUNCION PARA INSERTAR UN NUEVO EXAMEN
    async insertarExamenModel(nombre_examen, descripcion_examen, valor_examen) {
        try {
            const conexion = DataBase.getInstance();
            const query = "INSERT INTO examenes_clinicos (nombre_examen, descripcion_examen, valor_examen) VALUES (?, ?, ?)";
            const params = [nombre_examen, descripcion_examen, valor_examen];
            const resultado = await conexion.ejecutarQuery(query, params);
            return resultado;
        } catch (error) {
            throw error;
        }
    }

    // FUNCION PARA ACTUALIZAR UN EXAMEN
    async actualizarExamenModel(nombre_examen, descripcion_examen, valor_examen, id_examen) {
        try {
            const conexion = DataBase.getInstance();
            const query = "UPDATE examenes_clinicos SET nombre_examen = ?, descripcion_examen = ?, valor_examen = ? WHERE id_examen = ?";
            const params = [nombre_examen, descripcion_examen, valor_examen, id_examen];
            const resultado = await conexion.ejecutarQuery(query, params);
            return resultado;
        } catch (error) {
            throw error;
        }
    }

    // FUNCION PARA SELECCIONAR POR ID UN EXAMEN
    async seleccionarExamenPorID(id_examen) {
        try {
            const conexion = DataBase.getInstance();
            const query = "SELECT * FROM examenes_clinicos WHERE id_examen = ? AND estado_examen <> 0";
            const params = [id_examen];
            const resultado = await conexion.ejecutarQuery(query, params);
            return resultado;
        } catch (error) {
            throw error;
        }
    }

    // FUNCION PARA ELIMINAR LOGICAMENTE (CAMBIANDO ESTADO A 0)
    async eliminarExamenPorId(id_examen) {
        try {
            const conexion = DataBase.getInstance();
            const query = "UPDATE examenes_clinicos SET estado_examen = 0 WHERE id_examen = ?";
            const params = [id_examen];
            const resultado = await conexion.ejecutarQuery(query, params);
            return resultado;
        } catch (error) {
            throw error;
        }
    }

    // FUNCION PARA SELECCIONAR TODOS LOS EXAMENES ACTIVOS
    async seleccionarExamenes() {
        try {
            const conexion = DataBase.getInstance();
            const query = "SELECT * FROM examenes_clinicos WHERE estado_examen <> 0";
            const resultado = await conexion.ejecutarQuery(query);
            return resultado;
        } catch (error) {
            throw error;
        }
    }
}
