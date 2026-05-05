import NotificacionAgendamiento from "../services/notificacionAgendamiento.js";
import ReservaPacientes from "../model/ReservaPacientes.js";
import { enviarMensajeTextoWhatsApp } from "../services/notificacionWhatsApp.js";
import { resolverDatosReservaDesdeRequest } from "../services/notificacionReservaToken.js";

function parsearPayloadRespuestaWhatsApp(payload = "") {
  const valor = String(payload || "").trim();
  if (!valor.includes(":")) return null;

  const [accion, idReservaTexto] = valor.split(":");
  const id_reserva = Number(idReservaTexto);
  if (!accion || Number.isNaN(id_reserva) || id_reserva <= 0) return null;

  return { accion, id_reserva };
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
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            .container {
              background: white;
              padding: 40px;
              border-radius: 10px;
              box-shadow: 0 10px 40px rgba(0,0,0,0.2);
              text-align: center;
              max-width: 500px;
            }
            h1 { color: #10b981; margin-bottom: 20px; }
            p { color: #374151; line-height: 1.6; margin-bottom: 10px; }
            .icon { font-size: 64px; margin-bottom: 20px; }
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
            .btn-confirm { background: #10b981; color: white; }
            .btn-confirm:hover { background: #059669; }
            .detail-box {
              background: #f3f4f6;
              padding: 15px;
              border-radius: 8px;
              margin: 20px 0;
              text-align: left;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="icon">📅</div>
            <h1>¿Confirmar tu cita?</h1>
            <p>Estás a punto de confirmar la siguiente cita:</p>
            <div class="detail-box">
              <p><strong>Paciente:</strong> ${nombrePaciente} ${apellidoPaciente}</p>
              <p><strong>Fecha:</strong> ${fechaInicio}</p>
              <p><strong>Hora:</strong> ${horaInicio}</p>
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
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                }
                .container {
                  background: white;
                  padding: 40px;
                  border-radius: 10px;
                  box-shadow: 0 10px 40px rgba(0,0,0,0.2);
                  text-align: center;
                  max-width: 500px;
                }
                h1 { color: #10b981; margin-bottom: 20px; }
                p { color: #374151; line-height: 1.6; margin-bottom: 10px; }
                .icon { font-size: 64px; margin-bottom: 20px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="icon">✅</div>
                <h1>¡Cita Confirmada!</h1>
                <p><strong>${nombrePaciente} ${apellidoPaciente}</strong></p>
                <p>Tu cita para el <strong>${new Date(fechaInicio).toLocaleDateString("es-CL", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</strong> a las <strong>${horaInicio}</strong> ha sido confirmada exitosamente.</p>
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
              background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            }
            .container {
              background: white;
              padding: 40px;
              border-radius: 10px;
              box-shadow: 0 10px 40px rgba(0,0,0,0.2);
              text-align: center;
              max-width: 500px;
            }
            h1 { color: #ef4444; margin-bottom: 20px; }
            p { color: #374151; line-height: 1.6; margin-bottom: 10px; }
            .icon { font-size: 64px; margin-bottom: 20px; }
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
            .btn-cancel { background: #ef4444; color: white; }
            .btn-cancel:hover { background: #dc2626; }
            .detail-box {
              background: #fef2f2;
              padding: 15px;
              border-radius: 8px;
              margin: 20px 0;
              text-align: left;
              border: 1px solid #fecaca;
            }
            .warning {
              background: #fef3c7;
              border: 1px solid #f59e0b;
              padding: 12px;
              border-radius: 6px;
              margin: 15px 0;
              font-size: 14px;
              color: #92400e;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="icon">⚠️</div>
            <h1>¿Cancelar tu cita?</h1>
            <p>Estás a punto de cancelar la siguiente cita:</p>
            <div class="detail-box">
              <p><strong>Paciente:</strong> ${nombrePaciente} ${apellidoPaciente}</p>
              <p><strong>Fecha:</strong> ${fechaInicio}</p>
              <p><strong>Hora:</strong> ${horaInicio}</p>
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
                  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                }
                .container {
                  background: white;
                  padding: 40px;
                  border-radius: 10px;
                  box-shadow: 0 10px 40px rgba(0,0,0,0.2);
                  text-align: center;
                  max-width: 500px;
                }
                h1 { color: #ef4444; margin-bottom: 20px; }
                p { color: #374151; line-height: 1.6; margin-bottom: 10px; }
                .icon { font-size: 64px; margin-bottom: 20px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="icon">❌</div>
                <h1>Cita Cancelada</h1>
                <p><strong>${nombrePaciente} ${apellidoPaciente}</strong></p>
                <p>Tu cita para el <strong>${new Date(fechaInicio).toLocaleDateString("es-CL", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</strong> a las <strong>${horaInicio}</strong> ha sido cancelada.</p>
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
