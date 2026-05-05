import crypto from "crypto";

const TOKEN_FALLBACK_SECRET = "agenda-clinica-token-dev";

function obtenerSecret() {
    return process.env.NOTIFICACION_TOKEN_SECRET || process.env.TWILIO_AUTH_TOKEN || TOKEN_FALLBACK_SECRET;
}

function base64UrlEncode(valor) {
    return Buffer.from(valor, "utf8").toString("base64url");
}

function base64UrlDecode(valor) {
    return Buffer.from(valor, "base64url").toString("utf8");
}

function firmarPayload(payloadCodificado) {
    return crypto
        .createHmac("sha256", obtenerSecret())
        .update(payloadCodificado)
        .digest("base64url");
}

export function generarTokenReserva({
    id_reserva,
}) {
    if (!id_reserva) {
        return null;
    }

    const idCodificado = Number(id_reserva).toString(36);
    const firma = firmarPayload(idCodificado).slice(0, 22);
    return `${idCodificado}.${firma}`;
}

export function verificarTokenReserva(token) {
    if (!token || typeof token !== "string" || !token.includes(".")) {
        return null;
    }

    const [payloadCodificado, firma] = token.split(".");
    if (!payloadCodificado || !firma) {
        return null;
    }

    const firmaEsperada = firmarPayload(payloadCodificado).slice(0, 22);
    if (firma !== firmaEsperada) {
        return null;
    }

    const id_reserva = parseInt(payloadCodificado, 36);
    if (!Number.isInteger(id_reserva) || id_reserva <= 0) {
        return null;
    }

    return { id_reserva };
}

export function construirEnlacesReservaToken({
    id_reserva,
    nombrePaciente,
    apellidoPaciente,
    fechaInicio,
    horaInicio
}) {
    const token = generarTokenReserva({
        id_reserva,
        nombrePaciente,
        apellidoPaciente,
        fechaInicio,
        horaInicio
    });

    if (!token) {
        return { token: null, urlConfirmar: null, urlCancelar: null };
    }

    const baseUrl = process.env.BACKEND_URL || "https://siluetachic.nativecode.cl";
    return {
        token,
        urlConfirmar: `${baseUrl}/notificacion/confirmar/${token}`,
        urlCancelar: `${baseUrl}/notificacion/cancelar/${token}`
    };
}

export function resolverDatosReservaDesdeRequest(req) {
    const token = req.params?.token || req.query?.token || req.body?.token || null;
    const datosDesdeToken = verificarTokenReserva(token);
    if (datosDesdeToken) {
        return { ...datosDesdeToken, token };
    }

    const origen = req.method === "GET" ? req.query : req.body;
    const {
        id_reserva,
        nombrePaciente,
        apellidoPaciente,
        fechaInicio,
        horaInicio
    } = origen || {};

    if (!id_reserva || !nombrePaciente || !apellidoPaciente || !fechaInicio || !horaInicio) {
        return null;
    }

    return {
        id_reserva,
        nombrePaciente,
        apellidoPaciente,
        fechaInicio,
        horaInicio,
        token: null
    };
}
