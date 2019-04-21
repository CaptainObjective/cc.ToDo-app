// import MainView from './MainView'
import '../scss/main.scss';
import Login from './Login';
import Category from './Category';
import MainView from './MainView'

export const main = document.querySelector('#main');

const login = new Login();
main.appendChild(login.render());

// new MainView()
const mainView = new MainView();
const addCatButton = mainView.addButtonNewCategory();
main.appendChild(addCatButton);

addCatButton.addEventListener('click', mainView.showInputName.bind(mainView))
//Tu leci główny kod Apki