import React, { useState } from "react";
import Input from "../atoms/Input";
import Button from "../atoms/Button";
import { validarRun, validarCorreo, esMayorEdad } from "../../utils/validacion";
import { addUser } from "../../services/firestoreService";
import { useNavigate } from "react-router-dom";

const UserForm = () => {
    const [form, setForm] = useState({ 
        run: "", 
        nombre: "", 
        correo: "", 
        clave: "", 
        fecha: "" 
    });
    const [msg, setMsg] = useState("");
    const navigate = useNavigate();

    const handleChange = e => setForm({ 
        ...form, 
        [e.target.id]: e.target.value 
    });

    const handleSubmit = async e => {
        e.preventDefault();
        const { run, nombre, correo, clave, fecha } = form;
        
        if (!validarRun(run)) return setMsg("Run Incorrecto");
        if (!nombre) return setMsg("Nombre está vacío");
        if (!validarCorreo(correo)) return setMsg("Correo Incorrecto");
        if (!esMayorEdad(fecha)) return setMsg("Debe ser mayor a 18 años");
        if (!clave) return setMsg("La clave es obligatoria");

        try {
            await addUser(form);
            setMsg("Formulario se envió correctamente");
            
            setTimeout(() => {
                const destino = correo === "admin@duoc.cl" 
                    ? `/perfil-admin?nombre=${encodeURIComponent(nombre)}`
                    : `/perfil-cliente?nombre=${encodeURIComponent(nombre)}`;
                navigate(destino);
            }, 1000);
        } catch (error) {
            setMsg("Error al enviar el formulario: " + error.message);
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <Input 
                id="run" 
                value={form.run} 
                onChange={handleChange} 
                placeholder="RUN" 
            />
            <Input 
                id="nombre" 
                value={form.nombre} 
                onChange={handleChange} 
                placeholder="Nombre" 
            />
            <Input 
                id="correo" 
                value={form.correo} 
                onChange={handleChange} 
                placeholder="Correo" 
                type="email"
            />
            <Input 
                id="clave" 
                value={form.clave} 
                onChange={handleChange} 
                placeholder="Clave" 
                type="password" 
            />
            <Input 
                id="fecha" 
                value={form.fecha} 
                onChange={handleChange} 
                placeholder="Fecha de nacimiento" 
                type="date" 
            />
            <Button type="submit">Enviar</Button>
            {msg && <div>{msg}</div>}
        </form>
    )
}

export default UserForm;