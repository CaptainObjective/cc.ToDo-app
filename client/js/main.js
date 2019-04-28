import '../scss/main.scss';
import Login from './Login';

export const main = document.querySelector('#main');

const login = new Login();
const token = sessionStorage.getItem("x-token");
if (token) 
{
    login.autoLogin(token)
    .then(() => {})
    .catch(err => 
    {
        main.appendChild(login.render())
    });
}
else main.appendChild(login.render());

//Tu leci główny kod Apki