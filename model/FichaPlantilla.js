import DataBase from "../config/Database.js";

/*
Nombres de la tabla `fichaPlantilla`:
CAMPOS DE LA TABLA:
`id_plantilla`
`nombre`
`descripcion`
`estado`
`fechaCreacion`
* */

export default class FichaPlantilla{
    constructor(){
    }


    //Función 1 — listarPlantillas()
    async listarPlantillas(){
        try{
            const conexion = DataBase.getInstance();
            const query = `
            SELECT * FROM fichaPlantilla WHERE estado <> 0
            ORDER BY nombre ASC
            `;
            const respuesta = await conexion.ejecutarQuery(query);
            return respuesta;
        }catch(err){
            throw err;
        }
    }


    //Función 2 — obtenerPorId(id_plantilla)
    async obtenerPorId(id_plantilla){
        try{
            const conexion = DataBase.getInstance();
            const query = `
            SELECT * FROM 
            fichaPlantilla 
         
            WHERE 
       
            estado <> 0 AND
            id_plantilla = ?
            `;

            const params = [id_plantilla];

            const respuesta = await conexion.ejecutarQuery(query, params);
            return respuesta;
        }catch(err){
            throw err;
        }
    }


    //Función 3 — insertarPlantilla(nombre, descripcion)
    async insertarPlantilla(nombre, descripcion){
        try{
            const conexion = DataBase.getInstance();
            const query = `
            INSERT INTO
            fichaPlantilla (nombre, descripcion)
            VALUES (?,?)
            `;
            const params = [nombre, descripcion];

            const respuesta = await conexion.ejecutarQuery(query, params);
            return respuesta;
        }catch(err){
            throw err;
        }
    }


    //Función 4 — actualizarPlantilla(id_plantilla, nombre, descripcion)
    async actualizarPlantilla(nombre, descripcion, id_plantilla){
        try{
            const conexion = DataBase.getInstance();
            const query = `
            UPDATE fichaPlantilla
            SET
            nombre = ?,
            descripcion = ?
            
            WHERE 
            id_plantilla = ?
            `;

            const params = [nombre, descripcion, id_plantilla];

            const respuesta = await conexion.ejecutarQuery(query, params);
            return respuesta;
        }catch(err){
            throw err;
        }
    }


    //Función 5 — eliminarPlantilla(id_plantilla)
    async eliminarPlantilla(id_plantilla){
        try{
            const conexion = DataBase.getInstance();
            const query = `
            UPDATE fichaPlantilla
            SET
            estado = 0
          
            WHERE 
            id_plantilla = ?
            `;

            const params = [id_plantilla];

            const respuesta = await conexion.ejecutarQuery(query, params);
            return respuesta;
        }catch(err){
            throw err;
        }
    }



    //Función 6 — obtenerPlantillaCompleta(id_plantilla)
    async obtenerPlantillaCompleta(id_plantilla){
        try{
            const conexion = DataBase.getInstance();
            const query = `
    SELECT
    
    fichaPlantilla.id_plantilla,                                                                         
    fichaPlantilla.nombre AS plantilla_nombre,                                                         
    fichaPlantilla.descripcion,
    
    fichaCategoria.id_categoria,
    fichaCategoria.nombre AS categoria_nombre,
    fichaCategoria.orden AS categoria_orden,
    
    fichaCampo.id_campo,
    fichaCampo.nombre AS campo_nombre,
    fichaCampo.requerido,
    fichaCampo.orden AS campo_orden
    
    FROM fichaPlantilla
    LEFT JOIN fichaCategoria
    ON fichaCategoria.id_plantilla = fichaPlantilla.id_plantilla
    AND fichaCategoria.estado <> 0
    
    LEFT JOIN fichaCampo
    ON fichaCampo.id_categoria = fichaCategoria.id_categoria
    AND fichaCampo.estado <> 0
    
    WHERE fichaPlantilla.id_plantilla = ?
    AND fichaPlantilla.estado <> 0
    ORDER BY fichaCategoria.orden ASC, fichaCampo.orden ASC `;

            const params = [id_plantilla];

            const respuesta = await conexion.ejecutarQuery(query, params);
            return respuesta;
        }catch(err){
            throw err;
        }
    }





}