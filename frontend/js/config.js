// El navegador llama a los microservicios en el mismo host desde el que se sirvió la página
// (localhost, la IP del servidor o su dominio), en los puertos publicados por Docker.
const HOST = location.protocol === 'file:' ? 'localhost' : location.hostname;

const API = {
  partidos: `http://${HOST}:3001/partidos`,
  usuarios: `http://${HOST}:3002/usuarios`,
  apuestas: `http://${HOST}:3003/apuestas`,
  reportes: `http://${HOST}:3004/reportes`
};
