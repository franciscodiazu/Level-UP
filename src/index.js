import {addUser} from './services/firestoreService.js';
import {esMayorDeEdad,validarApellidos,validarContrasenas,validarCorreo,validarDireccion,validarNombre,validarRunCompleto,validarSeleccion} from './utils/validacion.js';

document.addEventListener("DOMContentLoaded",()=>{
    const form = document.getElementById("formUsuario");
  const runInput = document.getElementById("run");
  const nombreInput = document.getElementById("nombre");
  const apellidoInput= document.getElementById("apellido");
  const correoInput = document.getElementById("correo"); 
  const claveInput = document.getElementById("clave"); 
  const fechaInput = document.getElementById("fecha"); 
  const mensaje = document.getElementById("mensaje");

  if (!form) return console.log("No se encontro #formUsuario")

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    mensaje.innerText = "";

    const run = runInput.value.trim().toUpperCase();
    const nombre = nombreInput.value.trim();
    const correo = correoInput.value.trim();
    const clave = claveInput.value;
    const fecha = fechaInput.value;

    //Validar el ingreso correcto de los datos para el registro
    if(!validarRunCompleto(run)) return mensaje.innerText = "Run incorrecto";
    if(!nombre) return mensaje.innerText = "Nombre en blanco";
    if(!validarCorreo(correo)) return mensaje.innerText = "Correo incorrecto";
    if(!esMayorDeEdad(fecha)) return mensaje.innerText = "Debe ser mayor de 18 años";

    try {
      await addUser({ run, nombre, correo, clave, fecha});
      mensaje.innerText = "Formulario se envio correctamente";

      setTimeout(() => {
        window.location.href =
          correo.toLowerCase() === "admin@duoc.cl"
          ? `assets/page/perfilAdmin.html?nombre=${encodeURIComponent(nombre)}`
          : `assets/page/perfilCliente.html?nombre=${encodeURIComponent(nombre)}`
      }, 1000);
    } catch(error) {
      console.error("Error al guardar usuario: ", error);
      mensaje.innerText = "Error al guardar usuario en Firebase"

    }
  });
});