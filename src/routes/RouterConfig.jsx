import { BrowserRouter as Router, Route,Switch } from "react-router-dom";

import Home from"../component/pages/Home";
 import perfilAdmin from "../component/pages/admin-dashboard";
 import perfilCliente from "../component/pages/Perfil-Cliente";

 const RouterConfig = () => (
    <Router>
        <Switch>
            <Route exact path="/" compnent={Home}>
            <Route exact path="/perfilAdmin" compnent={perfilAdmin}>
            <Route exact path="/perfilCliente" compnent={perfilCliente}>
            </Route>
            </Route>
            </Route>
        </Switch>
    </Router>
 )