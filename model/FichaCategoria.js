import DataBase from "../config/Database.js";


export default class FichaCategoria{

    constructor(){
}

/*

TABLA : `fichaCategoria`

COLUMNAS:
`id_categoria`
`id_plantilla`
`nombre`
`orden`
`estado`

* */



    //1 — listarPorPlantilla(id_plantilla)
    async listarPorPlantilla(id_plantilla){
        try{
            const conexion = DataBase.getInstance();
            const query = `
            SELECT * FROM fichaCategoria     
                 
            WHERE 
            
            id_plantilla = ? AND
             estado <> 0`;

            const params = [id_plantilla]
            const resulatdo = await conexion.ejecutarQuery(query, params);
            return resulatdo;

        }catch(err){
            console.log(err);
            throw new Error(err);
        }
    }



    //2 — obtenerPorId(id_categoria)
    async obtenerPorId(id_categoria){
        try{
            const conexion = DataBase.getInstance();
            const query = `
            SELECT * FROM fichaCategoria          
            WHERE 
            id_categoria = ? AND
             estado <> 0`;

            const params = [id_categoria]
            const resulatdo = await conexion.ejecutarQuery(query, params);
            return resulatdo;

        }catch(err){
            console.log(err);
            throw new Error(err);
        }
    }




    //3 — insertarCategoria(id_plantilla, nombre, orden)
    async insertarCategoria(id_plantilla, nombre, orden){
        try{
            const conexion = DataBase.getInstance();
            const query = `
            INSERT INTO 
            fichaCategoria(id_plantilla, nombre, orden)
            VALUES (?,?,?)       
          `;

            const params = [id_plantilla, nombre, orden]
            const resulatdo = await conexion.ejecutarQuery(query, params);
            return resulatdo;

        }catch(err){
            console.log(err);
            throw new Error(err);
        }
    }


    //4 — actualizarCategoria(nombre, orden, id_categoria)
    async actualizarCategoria(nombre, orden, id_categoria){
        try{
            const conexion = DataBase.getInstance();
            const query = `
            UPDATE fichaCategoria SET
            nombre = ?,
            orden = ? 
             
             WHERE
             id_categoria = ? AND
             estado <> 0
                  
          `;

            const params = [nombre, orden, id_categoria]
            const resulatdo = await conexion.ejecutarQuery(query, params);
            return resulatdo;

        }catch(err){
            console.log(err);
            throw new Error(err);
        }
    }





    //5 — eliminarCategoria(id_categoria)
    async eliminarCategoria(id_categoria){
        try{
            const conexion = DataBase.getInstance();
            const query = `
            UPDATE fichaCategoria SET
            estado = 0

            WHERE
            id_categoria = ? `;

            const params = [id_categoria]
            const resulatdo = await conexion.ejecutarQuery(query, params);
            return resulatdo;

        }catch(err){
            console.log(err);
            throw new Error(err);
        }
    }



}