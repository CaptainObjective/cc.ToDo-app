import '../scss/main.scss';
import Login from './Login';

export const main = document.querySelector('#main');

const login = new Login();
const token = sessionStorage.getItem("x-token");
if (token) login.autoLogin(token);
else main.appendChild(login.render());

//Tu leci główny kod Apki