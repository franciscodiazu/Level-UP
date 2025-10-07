import React, { userState } from "react";
import Input from "../atoms/Input";
import Button from "../atoms/Button";
import {validarRun} from"../../utils/validacion" 
import{addUser} from "../../services/firestoreService"
/*import {useHistory}*/

const UserFrom=()=>{
    const[from, setForm]=userState([run:"",nombre:"",correo:"",clave:"",fecha:""]);
    const[msg,setMsg]=userState("");
    const history = userHistory();


    const handlechange = e => setForm({...form,[e.target.id]: e.target.value});
    const handleSubmit = async e => {
        e.preventDefault();
        const {run, nombre, correo,clave,fecha}=form;
        if (!validarRun(run)) return setMsg("Run Incorrecto");
        if (!nombre) return setMsg("Nombre esta vacio");
        if (!validarcorreo(correo)) return setMsg("Correo Incorrecto");
        if (!esMayorEdad(fecha)) return setMsg("debe ser mayor a 18 años");

        await addUser (form);
        setMsg("Formulario se envio Correctamente");
        setTimeout(()=>{
            history.push(correo === "admin@duoc.cl"? "/perfil-admin?nombre"+nombre:"/perfil-Cliente?nombre"+nombre);
        },1000);
    }
    return(
        <form onSubmit={handleSubmit}>
            <Input id="run" value={form.run} onChange={handlechange} placeholder="RUN" />
            <Input id="nombre" value={form.nombre} onChange={handlechange} placeholder="Nombre" />
            <Input id="correo" value={form.correo} onChange={handlechange} placeholder="Correo" />
            <Input id="clave" value={form.clave} onChange={handlechange} placeholder="Clave" type="password" />
            <Input id="fecha" value={form.fecha} onChange={handlechange} placeholder="Fecha de nacimiento" type="date" />
            <Button type="submit">Enviar</Button>
            {msg && <div>{msg}</div>}
        </form>
    )
}

export default UserFrom;