import DataBase from "../config/Database.js";

export default class FichaCampo{

    constructor(){
    }

    /*
    TABLA: fichaCampo
    COLUMNAS: `id_campo``id_categoria``nombre``requerido``orden``estado`
    * */

    //1 — listarPorCategoria(id_categoria)
    async listarPorCategoria(id_categoria){
        try {
            const conexion = DataBase.getInstance();
            const query = `
            SELECT * FROM fichaCampo
            WHERE 
            id_categoria = ? AND
            estado <> 0`;

            const params = [
                id_categoria
            ];
            const respuesta = await conexion.ejecutarQuery(query, params);
            return respuesta;
        }catch(err){
            console.log(err);
            throw err;
        }
    }


    //2 — obtenerPorId(id_campo)
    async obtenerPorId(id_campo){
        try {
            const conexion = DataBase.getInstance();
            const query = `
            SELECT * FROM fichaCampo
            WHERE 
            id_campo = ? AND
            estado <> 0`;

            const params = [
                id_campo
            ];
            const respuesta = await conexion.ejecutarQuery(query, params);
            return respuesta;
        }catch(err){
            console.log(err);
            throw err;
        }
    }



    //3 — insertarCampo(id_categoria, nombre, requerido, orden)
    async insertarCampo(id_categoria, nombre, requerido, orden){
        try {
            const conexion = DataBase.getInstance();
            const query = `
            INSERT INTO 
            fichaCampo (id_categoria, nombre, requerido, orden)
            VALUES (?,?,?,?)
    `;

            const params = [
                id_categoria, nombre, requerido, orden
            ];
            const respuesta = await conexion.ejecutarQuery(query, params);
            return respuesta;
        }catch(err){
            console.log(err);
            throw err;
        }
    }


    //4 - actualizarCampo(nombre, requerido, orden, id_campo)
    async  actualizarCampo(nombre, requerido, orden, id_campo){
        try {
            const conexion = DataBase.getInstance();
            const query = `
            UPDATE fichaCampo 
            SET 
            nombre = ?, 
            requerido = ? ,
            orden = ?
             
            WHERE
            id_campo = ? 
            
    `;

            const params = [ nombre, requerido, orden, id_campo];

            const respuesta = await conexion.ejecutarQuery(query, params);
            return respuesta;
        }catch(err){
            console.log(err);
            throw err;
        }
    }




    //5 — eliminarCampo(id_campo)
    async  eliminarCampo(id_campo){
        try {
            const conexion = DataBase.getInstance();
            const query = `
            UPDATE fichaCampo 
            SET 
            estado = 0
             
            WHERE
            id_campo = ?`;

            const params = [id_campo];

            const respuesta = await conexion.ejecutarQuery(query, params);
            return respuesta;
        }catch(err){
            console.log(err);
            throw err;
        }
    }


}