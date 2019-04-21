// import MainView from './MainView'
import '../scss/main.scss';
import Login from './Login';

export const main = document.querySelector('#main');

const login = new Login();
main.appendChild(login.render());

//Tu leci główny kod Apki