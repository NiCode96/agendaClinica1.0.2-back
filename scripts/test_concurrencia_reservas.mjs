const BASE_URL = process.env.TEST_RESERVA_BASE_URL || "http://localhost:3001";
const CONCURRENCY = Number(process.env.TEST_RESERVA_CONCURRENCY || 8);
const ID_PROFESIONAL = Number(process.env.TEST_RESERVA_ID_PROFESIONAL || 1);
const RUTA_INSERT = `${BASE_URL}/reservaPacientes/insertarReservaPacienteFicha`;
const RUTA_LISTAR = `${BASE_URL}/reservaPacientes/seleccionarPorProfesional`;

function pad(value) {
    return String(value).padStart(2, "0");
}

function construirHorarioPrueba() {
    if (process.env.TEST_RESERVA_FECHA && process.env.TEST_RESERVA_HORA_INICIO && process.env.TEST_RESERVA_HORA_FIN) {
        return {
            fechaInicio: process.env.TEST_RESERVA_FECHA,
            fechaFinalizacion: process.env.TEST_RESERVA_FECHA,
            horaInicio: process.env.TEST_RESERVA_HORA_INICIO,
            horaFinalizacion: process.env.TEST_RESERVA_HORA_FIN
        };
    }

    const inicio = new Date(Date.now() + 35 * 24 * 60 * 60 * 1000);
    inicio.setSeconds(0, 0);
    inicio.setMinutes(0);
    inicio.setHours(11 + (inicio.getMinutes() % 5));

    const fin = new Date(inicio.getTime() + 30 * 60 * 1000);

    return {
        fechaInicio: `${inicio.getFullYear()}-${pad(inicio.getMonth() + 1)}-${pad(inicio.getDate())}`,
        fechaFinalizacion: `${fin.getFullYear()}-${pad(fin.getMonth() + 1)}-${pad(fin.getDate())}`,
        horaInicio: `${pad(inicio.getHours())}:${pad(inicio.getMinutes())}:00`,
        horaFinalizacion: `${pad(fin.getHours())}:${pad(fin.getMinutes())}:00`
    };
}

function construirPayloadComun(horario) {
    return {
        ...horario,
        estadoReserva: "reservada",
        id_profesional: ID_PROFESIONAL
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

async function obtenerReservasDelHorario(horario) {
    const resultado = await postJson(RUTA_LISTAR, {id_profesional: ID_PROFESIONAL});
    if (!resultado.ok || !Array.isArray(resultado.data)) {
        throw new Error(`No se pudo consultar las reservas del profesional ${ID_PROFESIONAL}`);
    }

    return resultado.data.filter((reserva) =>
        String(reserva.fechaInicio).slice(0, 10) === horario.fechaInicio &&
        String(reserva.fechaFinalizacion).slice(0, 10) === horario.fechaFinalizacion &&
        String(reserva.horaInicio) === horario.horaInicio &&
        String(reserva.horaFinalizacion) === horario.horaFinalizacion &&
        Number(reserva.id_profesional) === ID_PROFESIONAL &&
        reserva.estadoReserva !== "cancelada"
    );
}

async function main() {
    const horario = construirHorarioPrueba();
    const payloadBase = construirPayloadComun(horario);

    console.log("Prueba de concurrencia");
    console.log(JSON.stringify({
        baseUrl: BASE_URL,
        endpoint: RUTA_INSERT,
        concurrency: CONCURRENCY,
        id_profesional: ID_PROFESIONAL,
        horario
    }, null, 2));

    const requests = Array.from({length: CONCURRENCY}, (_, index) => {
        const correlativo = index + 1;
        const payload = {
            ...payloadBase,
            nombrePaciente: `Stress${correlativo}`,
            apellidoPaciente: "Reserva",
            rut: `99${String(Date.now()).slice(-6)}${pad(correlativo)}-K`,
            telefono: `+5699000${pad(correlativo)}${pad(correlativo)}`,
            email: `stress.reserva.${Date.now()}.${correlativo}@test.local`
        };

        return postJson(RUTA_INSERT, payload);
    });

    const resultados = await Promise.all(requests);

    const resumen = resultados.reduce((acc, item) => {
        const key = `${item.status}:${item.data?.message ?? item.data?.error ?? "sin-mensaje"}`;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
    }, {});

    const reservasCreadas = await obtenerReservasDelHorario(horario);

    console.log("\nResultados por respuesta:");
    console.table(resumen);

    console.log("\nReservas existentes en ese horario:");
    console.table(reservasCreadas.map((reserva) => ({
        id_reserva: reserva.id_reserva,
        nombrePaciente: reserva.nombrePaciente,
        fechaInicio: String(reserva.fechaInicio).slice(0, 10),
        horaInicio: reserva.horaInicio,
        fechaFinalizacion: String(reserva.fechaFinalizacion).slice(0, 10),
        horaFinalizacion: reserva.horaFinalizacion,
        estadoReserva: reserva.estadoReserva
    })));

    if (reservasCreadas.length !== 1) {
        console.error(`\nFALLO: se esperaban 1 reserva creada para el horario, pero hay ${reservasCreadas.length}.`);
        process.exit(1);
    }

    const exitosas = resultados.filter((item) => item.data?.message === true).length;
    const conflictos = resultados.filter((item) => item.data?.message === "conflicto").length;

    if (exitosas !== 1 || conflictos !== CONCURRENCY - 1) {
        console.error(`\nFALLO: se esperaba 1 éxito y ${CONCURRENCY - 1} conflictos. Éxitos=${exitosas}, conflictos=${conflictos}.`);
        process.exit(1);
    }

    console.log(`\nOK: solo una solicitud creó la reserva y las otras ${conflictos} fueron rechazadas por conflicto.`);
}

main().catch((error) => {
    console.error("\nError ejecutando prueba de concurrencia:", error);
    process.exit(1);
});
