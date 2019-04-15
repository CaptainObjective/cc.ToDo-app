// import MainView from './MainView'
import '../scss/main.scss';
import Login from './Login'

const main = document.querySelector('#main');

// new MainView()
const login = new Login();
main.appendChild(login.render());

//Tu leci główny kod Apki