import NotificacionAgendamiento from "../services/notificacionAgendamiento.js";
import ReservaPacientes from "../model/ReservaPacientes.js";
import { enviarMensajeTextoWhatsApp } from "../services/notificacionWhatsApp.js";
import { resolverDatosReservaDesdeRequest } from "../services/notificacionReservaToken.js";

const LOGO_SISTEMA = "data:image/png;base64,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...truncated";

function parsearPayloadRespuestaWhatsApp(payload = "") {
  const valor = String(payload || "").trim();
  if (!valor.includes(":")) return null;

  const [accion, idReservaTexto] = valor.split(":");
  const id_reserva = Number(idReservaTexto);
  if (!accion || Number.isNaN(id_reserva) || id_reserva <= 0) return null;

  return { accion, id_reserva };
}

function formatearFechaCorta(fecha) {
  if (!fecha) return "";

  const valor = String(fecha).slice(0, 10);
  const [year, month, day] = valor.split("-");
  if (!year || !month || !day) return String(fecha);
  const meses = [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre"
  ];
  const mesIndice = Number(month) - 1;
  const mesTexto = meses[mesIndice] || month;
  return `${Number(day)} de ${mesTexto} de ${year}`;
}

function formatearHoraCorta(hora) {
  if (!hora) return "";
  return String(hora).slice(0, 5);
}

async function completarDatosReservaDesdeId(datosReserva) {
  if (!datosReserva?.id_reserva) return null;
  if (datosReserva.nombrePaciente && datosReserva.apellidoPaciente && datosReserva.fechaInicio && datosReserva.horaInicio) {
    return datosReserva;
  }

  const reservaPacienteClass = new ReservaPacientes();
  const dataReserva = await reservaPacienteClass.seleccionarFichasReservadasEspecifica(datosReserva.id_reserva);
  const reserva = Array.isArray(dataReserva) && dataReserva.length > 0 ? dataReserva[0] : null;
  if (!reserva) return null;

  return {
    ...datosReserva,
    nombrePaciente: reserva.nombrePaciente,
    apellidoPaciente: reserva.apellidoPaciente,
    fechaInicio: reserva.fechaInicio,
    horaInicio: reserva.horaInicio
  };
}

export default class NotificacionAgendamientoController {

  /**
   * CONFIRMAR CITA - Muestra página con formulario POST (seguro contra pre-carga de correos)
   * GET: Muestra la página de confirmación con un botón/formulario
   * El formulario usa POST para ejecutar la acción real
   */
  static async confirmarCita(req, res) {
    try {
      const datosReserva = await completarDatosReservaDesdeId(resolverDatosReservaDesdeRequest(req));

      const empresa = process.env.NOMBRE_EMPRESA || "Clinica";
      const nombreSistema = "AgendaClinica Healthcare Information System";

      if (!datosReserva) {
        return res.status(400).json({
          ok: false,
          message: "Faltan parámetros requeridos"
        });
      }

      const {
        id_reserva,
        nombrePaciente,
        apellidoPaciente,
        fechaInicio,
        horaInicio,
        token
      } = datosReserva;
      const fechaFormateada = formatearFechaCorta(fechaInicio);
      const horaFormateada = formatearHoraCorta(horaInicio);
      const logoSistema = LOGO_SISTEMA;

      // GET siempre muestra la página de confirmación con formulario POST
      // Los clientes de correo NO ejecutan formularios POST, solo GET
      return res.send(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Confirmar Cita - ${empresa}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              background: linear-gradient(180deg, #dbeafe 0%, #93c5fd 100%);
            }
            .container {
              background: white;
              padding: 40px;
              border-radius: 10px;
              box-shadow: 0 18px 48px rgba(15, 23, 42, 0.18);
              text-align: center;
              max-width: 500px;
              border: 1px solid #dbeafe;
            }
            h1 { color: #0f4c81; margin-bottom: 20px; }
            p { color: #334155; line-height: 1.6; margin-bottom: 10px; }
            .brandmark {
              width: 108px;
              height: 108px;
              object-fit: contain;
              margin: 0 auto 20px;
              display: block;
            }
            .eyebrow {
              color: #1d4ed8;
              font-size: 12px;
              font-weight: 700;
              letter-spacing: 0.08em;
              text-transform: uppercase;
              margin-bottom: 16px;
            }
            .btn {
              display: inline-block;
              padding: 14px 32px;
              border-radius: 8px;
              border: none;
              font-size: 16px;
              font-weight: 600;
              cursor: pointer;
              margin: 10px;
            }
            .btn-confirm { background: #1d4ed8; color: white; }
            .btn-confirm:hover { background: #1e40af; }
            .detail-box {
              background: #eff6ff;
              padding: 15px;
              border-radius: 8px;
              margin: 20px 0;
              text-align: left;
              border: 1px solid #bfdbfe;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="eyebrow">${nombreSistema}</div>
            <img src="${logoSistema}" alt="AgendaClinica" class="brandmark" />
            <h1>¿Confirmar tu cita?</h1>
            <p>Estás a punto de confirmar la siguiente cita:</p>
            <div class="detail-box">
              <p><strong>Paciente:</strong> ${nombrePaciente} ${apellidoPaciente}</p>
              <p><strong>Fecha:</strong> ${fechaFormateada}</p>
              <p><strong>Hora:</strong> ${horaFormateada}</p>
            </div>
            <p>Haz clic en el botón para confirmar tu asistencia:</p>
            <form method="POST" action="/notificacion/confirmar/ejecutar" style="margin-top: 20px;">
              <input type="hidden" name="id_reserva" value="${id_reserva}" />
              <input type="hidden" name="nombrePaciente" value="${nombrePaciente}" />
              <input type="hidden" name="apellidoPaciente" value="${apellidoPaciente}" />
              <input type="hidden" name="fechaInicio" value="${fechaInicio}" />
              <input type="hidden" name="horaInicio" value="${horaInicio}" />
              ${token ? `<input type="hidden" name="token" value="${token}" />` : ""}
              <button type="submit" class="btn btn-confirm">✅ Sí, confirmar mi cita</button>
            </form>
            <p style="margin-top: 30px; color: #6b7280; font-size: 12px;">
              Si no solicitaste esta acción, puedes cerrar esta página.
            </p>
          </div>
        </body>
        </html>
      `);

    } catch (error) {
      console.error("[CONFIRMAR CITA] Error:", error);
      return res.status(500).json({
        ok: false,
        message: "Error al confirmar la cita"
      });
    }
  }

  /**
   * EJECUTAR CONFIRMACIÓN - Solo acepta POST (seguro)
   * Esta ruta ejecuta la acción real de confirmar la cita
   */
  static async ejecutarConfirmacion(req, res) {
    try {
      const datosReserva = await completarDatosReservaDesdeId(resolverDatosReservaDesdeRequest(req));

      const empresa = process.env.NOMBRE_EMPRESA || "Clinica";
      const nombreSistema = "AgendaClinica Healthcare Information System";

      if (!datosReserva) {
        return res.status(400).json({
          ok: false,
          message: "Faltan parámetros requeridos"
        });
      }

      const {
        id_reserva,
        nombrePaciente,
        apellidoPaciente,
        fechaInicio,
        horaInicio
      } = datosReserva;
      const fechaFormateada = formatearFechaCorta(fechaInicio);
      const horaFormateada = formatearHoraCorta(horaInicio);
      const logoSistema = LOGO_SISTEMA;

      const reservaPacienteClass = new ReservaPacientes();
      const estadoReserva = "CONFIRMADA";
      const respuestaBackend = await reservaPacienteClass.actualizarEstado(estadoReserva, id_reserva);

      // SOLO enviar correo si la actualización fue exitosa
      if(respuestaBackend && respuestaBackend.affectedRows > 0) {
          console.log("[CONFIRMAR CITA] Reserva confirmada correctamente. ID:", id_reserva);

          // Enviar correo de confirmación al equipo SOLO si se actualizó correctamente
          await NotificacionAgendamiento.enviarCorreoConfirmacionEquipo({
              nombrePaciente,
              apellidoPaciente,
              fechaInicio,
              horaInicio,
              accion: "CONFIRMADA",
              id_reserva
          });

          // Mostrar página de éxito
          return res.send(`
            <!DOCTYPE html>
            <html lang="es">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Cita Confirmada</title>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  min-height: 100vh;
                  margin: 0;
                  background: linear-gradient(180deg, #dbeafe 0%, #93c5fd 100%);
                }
                .container {
                  background: white;
                  padding: 40px;
                  border-radius: 10px;
                  box-shadow: 0 18px 48px rgba(15, 23, 42, 0.18);
                  text-align: center;
                  max-width: 500px;
                  border: 1px solid #dbeafe;
                }
                h1 { color: #0f4c81; margin-bottom: 20px; }
                p { color: #334155; line-height: 1.6; margin-bottom: 10px; }
                .brandmark {
                  width: 108px;
                  height: 108px;
                  object-fit: contain;
                  margin: 0 auto 20px;
                  display: block;
                }
                .eyebrow {
                  color: #1d4ed8;
                  font-size: 12px;
                  font-weight: 700;
                  letter-spacing: 0.08em;
                  text-transform: uppercase;
                  margin-bottom: 16px;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="eyebrow">${nombreSistema}</div>
                <img src="${logoSistema}" alt="AgendaClinica" class="brandmark" />
                <h1>¡Cita Confirmada!</h1>
                <p><strong>${nombrePaciente} ${apellidoPaciente}</strong></p>
                <p>Tu cita para el <strong>${fechaFormateada}</strong> a las <strong>${horaFormateada}</strong> ha sido confirmada exitosamente.</p>
                <p>Hemos notificado a nuestro equipo de tu confirmacion.</p>
                <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
                  Nos vemos pronto en ${empresa}.
                </p>
              </div>
            </body>
            </html>
          `);
      } else {
          // La actualización falló - NO enviar correo
          console.log("[CONFIRMAR CITA] No se pudo confirmar la reserva: no existe o ya está confirmada. ID:", id_reserva);
          return res.send(`
            <!DOCTYPE html>
            <html lang="es">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Error - ${empresa}</title>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  min-height: 100vh;
                  margin: 0;
                  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
                }
                .container {
                  background: white;
                  padding: 40px;
                  border-radius: 10px;
                  box-shadow: 0 10px 40px rgba(0,0,0,0.2);
                  text-align: center;
                  max-width: 500px;
                }
                h1 { color: #f59e0b; margin-bottom: 20px; }
                p { color: #374151; line-height: 1.6; margin-bottom: 10px; }
                .icon { font-size: 64px; margin-bottom: 20px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="icon">⚠️</div>
                <h1>Cita no encontrada</h1>
                <p>La cita que intentas confirmar no existe o ya fue procesada anteriormente.</p>
                <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
                  Si tienes dudas, contáctanos directamente.
                </p>
              </div>
            </body>
            </html>
          `);
      }

    } catch (error) {
      console.error("[CONFIRMAR CITA] Error:", error);
      return res.status(500).json({
        ok: false,
        message: "Error al confirmar la cita"
      });
    }
  }











  /**
   * CANCELAR CITA - Muestra página con formulario POST (seguro contra pre-carga de correos)
   * GET: Muestra la página de cancelación con un botón/formulario
   * El formulario usa POST para ejecutar la acción real
   */
  static async cancelarCita(req, res) {
    try {
      const datosReserva = await completarDatosReservaDesdeId(resolverDatosReservaDesdeRequest(req));

      const empresa = process.env.NOMBRE_EMPRESA || "Clinica";
      const nombreSistema = "AgendaClinica Healthcare Information System";

      if (!datosReserva) {
        return res.status(400).json({
          ok: false,
          message: "Faltan parámetros requeridos"
        });
      }

      const {
        id_reserva,
        nombrePaciente,
        apellidoPaciente,
        fechaInicio,
        horaInicio,
        token
      } = datosReserva;
      const fechaFormateada = formatearFechaCorta(fechaInicio);
      const horaFormateada = formatearHoraCorta(horaInicio);
      const logoSistema = LOGO_SISTEMA;

      // GET siempre muestra la página de confirmación con formulario POST
      return res.send(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Cancelar Cita - ${empresa}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              background: linear-gradient(180deg, #dbeafe 0%, #93c5fd 100%);
            }
            .container {
              background: white;
              padding: 40px;
              border-radius: 10px;
              box-shadow: 0 18px 48px rgba(15, 23, 42, 0.18);
              text-align: center;
              max-width: 500px;
              border: 1px solid #dbeafe;
            }
            h1 { color: #0f4c81; margin-bottom: 20px; }
            p { color: #334155; line-height: 1.6; margin-bottom: 10px; }
            .brandmark {
              width: 108px;
              height: 108px;
              object-fit: contain;
              margin: 0 auto 20px;
              display: block;
            }
            .eyebrow {
              color: #1d4ed8;
              font-size: 12px;
              font-weight: 700;
              letter-spacing: 0.08em;
              text-transform: uppercase;
              margin-bottom: 16px;
            }
            .btn {
              display: inline-block;
              padding: 14px 32px;
              border-radius: 8px;
              border: none;
              font-size: 16px;
              font-weight: 600;
              cursor: pointer;
              margin: 10px;
            }
            .btn-cancel { background: #1e3a8a; color: white; }
            .btn-cancel:hover { background: #1e40af; }
            .detail-box {
              background: #eff6ff;
              padding: 15px;
              border-radius: 8px;
              margin: 20px 0;
              text-align: left;
              border: 1px solid #bfdbfe;
            }
            .warning {
              background: #e0f2fe;
              border: 1px solid #7dd3fc;
              padding: 12px;
              border-radius: 6px;
              margin: 15px 0;
              font-size: 14px;
              color: #0f4c81;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="eyebrow">${nombreSistema}</div>
            <img src="${logoSistema}" alt="AgendaClinica" class="brandmark" />
            <h1>¿Cancelar tu cita?</h1>
            <p>Estás a punto de cancelar la siguiente cita:</p>
            <div class="detail-box">
              <p><strong>Paciente:</strong> ${nombrePaciente} ${apellidoPaciente}</p>
              <p><strong>Fecha:</strong> ${fechaFormateada}</p>
              <p><strong>Hora:</strong> ${horaFormateada}</p>
            </div>
            <div class="warning">
              ⚠️ <strong>Importante:</strong> Esta acción no se puede deshacer. Si cancelas, deberás agendar una nueva cita.
            </div>
            <p>¿Estás seguro/a de que deseas cancelar?</p>
            <form method="POST" action="/notificacion/cancelar/ejecutar" style="margin-top: 20px;">
              <input type="hidden" name="id_reserva" value="${id_reserva}" />
              <input type="hidden" name="nombrePaciente" value="${nombrePaciente}" />
              <input type="hidden" name="apellidoPaciente" value="${apellidoPaciente}" />
              <input type="hidden" name="fechaInicio" value="${fechaInicio}" />
              <input type="hidden" name="horaInicio" value="${horaInicio}" />
              ${token ? `<input type="hidden" name="token" value="${token}" />` : ""}
              <button type="submit" class="btn btn-cancel">❌ Sí, cancelar mi cita</button>
            </form>
            <p style="margin-top: 30px; color: #6b7280; font-size: 12px;">
              Si no solicitaste esta acción, puedes cerrar esta página.
            </p>
          </div>
        </body>
        </html>
      `);

    } catch (error) {
      console.error("[CANCELAR CITA] Error:", error);
      return res.status(500).json({
        ok: false,
        message: "Error al cancelar la cita"
      });
    }
  }

  /**
   * EJECUTAR CANCELACIÓN - Solo acepta POST (seguro)
   * Esta ruta ejecuta la acción real de cancelar la cita
   */
  static async ejecutarCancelacion(req, res) {
    try {
      const datosReserva = await completarDatosReservaDesdeId(resolverDatosReservaDesdeRequest(req));

      const empresa = process.env.NOMBRE_EMPRESA || "Clinica";
      const nombreSistema = "AgendaClinica Healthcare Information System";

      if (!datosReserva) {
        return res.status(400).json({
          ok: false,
          message: "Faltan parámetros requeridos"
        });
      }

      const {
        id_reserva,
        nombrePaciente,
        apellidoPaciente,
        fechaInicio,
        horaInicio
      } = datosReserva;
      const fechaFormateada = formatearFechaCorta(fechaInicio);
      const horaFormateada = formatearHoraCorta(horaInicio);
      const logoSistema = LOGO_SISTEMA;

      const reservaPacienteClass = new ReservaPacientes();
      const estadoReserva = "ANULADA";
      const respuestaBackend = await reservaPacienteClass.actualizarEstado(estadoReserva, id_reserva);

      // SOLO enviar correo si la actualización fue exitosa
      if(respuestaBackend && respuestaBackend.affectedRows > 0) {
          console.log("[ANULAR CITA] Reserva ANULADA correctamente. ID:", id_reserva);

          // Enviar correo de cancelación al equipo SOLO si se actualizó correctamente
          await NotificacionAgendamiento.enviarCorreoConfirmacionEquipo({
            nombrePaciente,
            apellidoPaciente,
            fechaInicio,
            horaInicio,
            accion: "CANCELADA",
            id_reserva,
          });

          // Mostrar página de éxito
          return res.send(`
            <!DOCTYPE html>
            <html lang="es">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Cita Cancelada</title>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  min-height: 100vh;
                  margin: 0;
                  background: linear-gradient(180deg, #dbeafe 0%, #93c5fd 100%);
                }
                .container {
                  background: white;
                  padding: 40px;
                  border-radius: 10px;
                  box-shadow: 0 18px 48px rgba(15, 23, 42, 0.18);
                  text-align: center;
                  max-width: 500px;
                  border: 1px solid #dbeafe;
                }
                h1 { color: #0f4c81; margin-bottom: 20px; }
                p { color: #334155; line-height: 1.6; margin-bottom: 10px; }
                .brandmark {
                  width: 108px;
                  height: 108px;
                  object-fit: contain;
                  margin: 0 auto 20px;
                  display: block;
                }
                .eyebrow {
                  color: #1d4ed8;
                  font-size: 12px;
                  font-weight: 700;
                  letter-spacing: 0.08em;
                  text-transform: uppercase;
                  margin-bottom: 16px;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="eyebrow">${nombreSistema}</div>
                <img src="${logoSistema}" alt="AgendaClinica" class="brandmark" />
                <h1>Cita Cancelada</h1>
                <p><strong>${nombrePaciente} ${apellidoPaciente}</strong></p>
                <p>Tu cita para el <strong>${fechaFormateada}</strong> a las <strong>${horaFormateada}</strong> ha sido cancelada.</p>
                <p>Hemos notificado a nuestro equipo de tu cancelacion.</p>
                <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
                  Esperamos verte pronto en ${empresa}.
                </p>
              </div>
            </body>
            </html>
          `);
      } else {
          // La actualización falló - NO enviar correo
          console.log("[ANULAR CITA] No se pudo ANULAR la reserva: no existe o ya está ANULADA. ID:", id_reserva);
          return res.send(`
            <!DOCTYPE html>
            <html lang="es">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Error - ${empresa}</title>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  min-height: 100vh;
                  margin: 0;
                  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
                }
                .container {
                  background: white;
                  padding: 40px;
                  border-radius: 10px;
                  box-shadow: 0 10px 40px rgba(0,0,0,0.2);
                  text-align: center;
                  max-width: 500px;
                }
                h1 { color: #f59e0b; margin-bottom: 20px; }
                p { color: #374151; line-height: 1.6; margin-bottom: 10px; }
                .icon { font-size: 64px; margin-bottom: 20px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="icon">⚠️</div>
                <h1>Cita no encontrada</h1>
                <p>La cita que intentas cancelar no existe o ya fue procesada anteriormente.</p>
                <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
                  Si tienes dudas, contáctanos directamente.
                </p>
              </div>
            </body>
            </html>
          `);
      }

    } catch (error) {
      console.error("[CANCELAR CITA] Error:", error);
      return res.status(500).json({
        ok: false,
        message: "Error al cancelar la cita"
      });
    }
  }

  static async procesarRespuestaWhatsApp(req, res) {
    try {
      const {
        ButtonPayload,
        ButtonText,
        From
      } = req.body;

      const respuesta = parsearPayloadRespuestaWhatsApp(ButtonPayload);

      if (!respuesta) {
        console.warn("[WSP-INBOUND] Payload inválido:", ButtonPayload, "| ButtonText:", ButtonText);
        return res.status(200).send("OK");
      }

      const { accion, id_reserva } = respuesta;
      const reservaPacienteClass = new ReservaPacientes();
      const dataReserva = await reservaPacienteClass.seleccionarFichasReservadasEspecifica(id_reserva);
      const reserva = Array.isArray(dataReserva) && dataReserva.length > 0 ? dataReserva[0] : null;

      if (!reserva) {
        console.warn("[WSP-INBOUND] No se encontró reserva para id_reserva:", id_reserva);
        await enviarMensajeTextoWhatsApp({
          telefono: From,
          mensaje: "No encontramos la cita asociada a tu respuesta. Si necesitas ayuda, contáctanos directamente."
        });
        return res.status(200).send("OK");
      }

      let estadoReserva;
      let mensajePaciente;
      let accionEquipo;

      if (accion === "CONFIRMAR_RESERVA") {
        estadoReserva = "CONFIRMADA";
        accionEquipo = "CONFIRMADA";
        mensajePaciente = `Tu cita del ${String(reserva.fechaInicio).slice(0, 10)} a las ${reserva.horaInicio} ha sido confirmada correctamente.`;
      } else if (accion === "CANCELAR_RESERVA") {
        estadoReserva = "ANULADA";
        accionEquipo = "CANCELADA";
        mensajePaciente = `Tu cita del ${String(reserva.fechaInicio).slice(0, 10)} a las ${reserva.horaInicio} ha sido anulada correctamente.`;
      } else {
        console.warn("[WSP-INBOUND] Acción no soportada:", accion);
        return res.status(200).send("OK");
      }

      const respuestaBackend = await reservaPacienteClass.actualizarEstado(estadoReserva, id_reserva);
      if (!respuestaBackend || respuestaBackend.affectedRows <= 0) {
        await enviarMensajeTextoWhatsApp({
          telefono: From,
          mensaje: "No fue posible procesar tu respuesta en este momento. Intenta nuevamente o contáctanos."
        });
        return res.status(200).send("OK");
      }

      try {
        await NotificacionAgendamiento.enviarCorreoConfirmacionEquipo({
          nombrePaciente: reserva.nombrePaciente,
          apellidoPaciente: reserva.apellidoPaciente,
          fechaInicio: reserva.fechaInicio,
          horaInicio: reserva.horaInicio,
          accion: accionEquipo,
          id_reserva
        });
      } catch (errorCorreo) {
        console.error("[WSP-INBOUND] Error notificando al equipo:", errorCorreo);
      }

      await enviarMensajeTextoWhatsApp({
        telefono: reserva.telefono || From,
        mensaje: mensajePaciente
      });

      return res.status(200).send("OK");
    } catch (error) {
      console.error("[WSP-INBOUND] Error procesando respuesta:", error);
      return res.status(200).send("OK");
    }
  }
}
