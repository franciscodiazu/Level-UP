import { useLocation} from"react-router-dom";
function userQuery (){return new URLSearchParams(useLocation().search());}

const perfilAdmin= ()=> {
    const q = userQuery();
    return <h1>Bienvenido{q.get("nombre")}</h1>;

}
export default perfilAdmin;