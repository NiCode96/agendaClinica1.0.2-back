const BASE_URL = process.env.TEST_RESERVA_BASE_URL || "http://localhost:3001";
const ID_PROFESIONAL = Number(process.env.TEST_RESERVA_ID_PROFESIONAL || 1);
const RUTA_INSERT = `${BASE_URL}/reservaPacientes/insertarReservaPacienteFicha`;
const RUTA_ACTUALIZAR = `${BASE_URL}/reservaPacientes/actualizarReservacion`;
const RUTA_LISTAR = `${BASE_URL}/reservaPacientes/seleccionarPorProfesional`;
const RUTA_ELIMINAR = `${BASE_URL}/reservaPacientes/eliminarReserva`;

function pad(value) {
    return String(value).padStart(2, "0");
}

function formatearFecha(date) {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function formatearHora(date) {
    return `${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
}

function construirHorarios() {
    const base = new Date(Date.now() + 36 * 24 * 60 * 60 * 1000);
    base.setSeconds(0, 0);
    base.setMinutes(0);
    base.setHours(9);

    const slotAInicio = new Date(base);
    const slotAFin = new Date(base.getTime() + 30 * 60 * 1000);

    const slotBInicio = new Date(base.getTime() + 30 * 60 * 1000);
    const slotBFin = new Date(base.getTime() + 60 * 60 * 1000);

    const destinoInicio = new Date(base.getTime() + 2 * 60 * 60 * 1000);
    const destinoFin = new Date(base.getTime() + 2.5 * 60 * 60 * 1000);

    return {
        slotA: {
            fechaInicio: formatearFecha(slotAInicio),
            fechaFinalizacion: formatearFecha(slotAFin),
            horaInicio: formatearHora(slotAInicio),
            horaFinalizacion: formatearHora(slotAFin)
        },
        slotB: {
            fechaInicio: formatearFecha(slotBInicio),
            fechaFinalizacion: formatearFecha(slotBFin),
            horaInicio: formatearHora(slotBInicio),
            horaFinalizacion: formatearHora(slotBFin)
        },
        destino: {
            fechaInicio: formatearFecha(destinoInicio),
            fechaFinalizacion: formatearFecha(destinoFin),
            horaInicio: formatearHora(destinoInicio),
            horaFinalizacion: formatearHora(destinoFin)
        }
    };
}

async function postJson(url, body) {
    const response = await fetch(url, {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });

    const data = await response.json().catch(() => ({}));
    return {status: response.status, ok: response.ok, data};
}

async function obtenerReservasProfesional() {
    const resultado = await postJson(RUTA_LISTAR, {id_profesional: ID_PROFESIONAL});
    if (!resultado.ok || !Array.isArray(resultado.data)) {
        throw new Error(`No se pudo consultar las reservas del profesional ${ID_PROFESIONAL}`);
    }
    return resultado.data;
}

async function crearReservaInicial(sufijo, horario) {
    const timestamp = Date.now();
    const payload = {
        nombrePaciente: `Move${sufijo}`,
        apellidoPaciente: "Stress",
        rut: `88${String(timestamp).slice(-6)}${pad(sufijo)}-K`,
        telefono: `+5698111${pad(sufijo)}${pad(sufijo)}`,
        email: `move.stress.${timestamp}.${sufijo}@test.local`,
        fechaInicio: horario.fechaInicio,
        horaInicio: horario.horaInicio,
        fechaFinalizacion: horario.fechaFinalizacion,
        horaFinalizacion: horario.horaFinalizacion,
        estadoReserva: "reservada",
        id_profesional: ID_PROFESIONAL
    };

    const resultado = await postJson(RUTA_INSERT, payload);
    if (!resultado.ok || resultado.data?.message !== true) {
        throw new Error(`No se pudo crear la reserva inicial ${sufijo}: ${JSON.stringify(resultado.data)}`);
    }

    const reservas = await obtenerReservasProfesional();
    const creada = reservas.find((reserva) =>
        reserva.nombrePaciente === payload.nombrePaciente &&
        reserva.apellidoPaciente === payload.apellidoPaciente &&
        String(reserva.fechaInicio).slice(0, 10) === horario.fechaInicio &&
        String(reserva.horaInicio) === horario.horaInicio
    );

    if (!creada?.id_reserva) {
        throw new Error(`No se pudo identificar el id_reserva creado para ${payload.nombrePaciente}`);
    }

    return {
        id_reserva: creada.id_reserva,
        nombrePaciente: creada.nombrePaciente,
        apellidoPaciente: creada.apellidoPaciente,
        rut: creada.rut,
        telefono: creada.telefono,
        email: creada.email,
        estadoReserva: creada.estadoReserva,
        id_profesional: creada.id_profesional
    };
}

async function eliminarReservaSilencioso(id_reserva) {
    if (!id_reserva) return;
    try {
        await postJson(RUTA_ELIMINAR, {id_reserva});
    } catch (_) {
    }
}

async function main() {
    const horarios = construirHorarios();
    const reservasCreadas = [];

    console.log("Prueba de concurrencia en actualizacion");
    console.log(JSON.stringify({
        baseUrl: BASE_URL,
        id_profesional: ID_PROFESIONAL,
        horarios
    }, null, 2));

    try {
        const reservaA = await crearReservaInicial(1, horarios.slotA);
        reservasCreadas.push(reservaA.id_reserva);

        const reservaB = await crearReservaInicial(2, horarios.slotB);
        reservasCreadas.push(reservaB.id_reserva);

        const actualizacionA = postJson(RUTA_ACTUALIZAR, {
            ...reservaA,
            ...horarios.destino
        });

        const actualizacionB = postJson(RUTA_ACTUALIZAR, {
            ...reservaB,
            ...horarios.destino
        });

        const resultados = await Promise.all([actualizacionA, actualizacionB]);

        const resumen = resultados.reduce((acc, item) => {
            const key = `${item.status}:${item.data?.message ?? "sin-mensaje"}`;
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});

        console.log("\nResultados por respuesta:");
        console.table(resumen);

        const reservas = await obtenerReservasProfesional();
        const enDestino = reservas.filter((reserva) =>
            [reservaA.id_reserva, reservaB.id_reserva].includes(reserva.id_reserva) &&
            String(reserva.fechaInicio).slice(0, 10) === horarios.destino.fechaInicio &&
            String(reserva.horaInicio) === horarios.destino.horaInicio &&
            String(reserva.horaFinalizacion) === horarios.destino.horaFinalizacion
        );

        console.log("\nReservas de prueba en horario destino:");
        console.table(enDestino.map((reserva) => ({
            id_reserva: reserva.id_reserva,
            nombrePaciente: reserva.nombrePaciente,
            fechaInicio: String(reserva.fechaInicio).slice(0, 10),
            horaInicio: reserva.horaInicio,
            horaFinalizacion: reserva.horaFinalizacion,
            estadoReserva: reserva.estadoReserva
        })));

        const exitosas = resultados.filter((item) => item.data?.message === true).length;
        const conflictos = resultados.filter((item) => item.data?.message === "conflicto").length;

        if (exitosas !== 1 || conflictos !== 1 || enDestino.length !== 1) {
            console.error(`\nFALLO: se esperaba 1 actualizacion exitosa, 1 conflicto y 1 sola reserva en destino. Exitos=${exitosas}, conflictos=${conflictos}, enDestino=${enDestino.length}.`);
            process.exitCode = 1;
            return;
        }

        console.log("\nOK: solo una reserva se movio al horario destino y la otra fue rechazada por conflicto.");
    } finally {
        await Promise.all(reservasCreadas.map((id_reserva) => eliminarReservaSilencioso(id_reserva)));
    }
}

main().catch((error) => {
    console.error("\nError ejecutando prueba de concurrencia de actualizacion:", error);
    process.exit(1);
});
