// import MainView from './MainView'
import '../scss/main.scss';
import Login from './Login';
import Category from './Category'

export const main = document.querySelector('#main');

// new MainView()

const login = new Login();
main.appendChild(login.render());



const addCatButton = Category.addButtonNewCategory();
main.appendChild(addCatButton);

addCatButton.addEventListener('click', Category.showInputName)
//Tu leci główny kod Apki