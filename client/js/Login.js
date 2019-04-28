import MainView from "./MainView"

class Login {
    constructor() {
        this._passLength = 6;
        this._nameLength = 3;
        this._text = {
            email: "Adres e-mail",
            reEmail: "Potwierdź adres e-mail",
            name: "Imię",
            password: "Hasło ",
            rePassword: "Powtórz hasło",
            submit: "Zaloguj się",
            lostPassword: "Odzyskaj hasło",
            lostPasswordSure: "Na pewno chcesz zresetować hasło?",
            reSubmit: "Zarejestruj się",
            signUp: "Nie mam konta",
            "login-email-error": "Błędny adres e-mail",
            "login-password-error": "Hasło powinno zawierać wielką literę, liczbę i znak specjalny",
            "login-password-error-short": `Hasło powinno mieć przynajmniej ${this._passLength} znaków`,
            "login-reEmail-error": "Podane adresy różnią się",
            "login-rePassword-error": "Hasła różnią się",
            "login-name-error": `Imie powino mieć przynajmniej ${this._nameLength} znaki`,
            registerSuccess: "Konto zostało założone. Na twój adres e-mail została wysłana wiadomość z linkiem potwierdzającym podany adres e-mail.",
            retrievePasswordSuccess: "Proces przywracania hasła rozpoczęty. Na twój adres e-mail została wysłana wysłana wiadomość z dalszymi instrukcjami.",
            retrievePasswordFailure: "Nie istnieje konto przypisane do podanego adresu e-mail.",
            loginFailure: "Błędny login lub hasło.",
            registerEmailUsed: "Konto przypisane do podanego adresu e-mail już istnieje.",
            serverDown: "Nie można połączyć z serwerem. Spróbuj ponownie później."
        };
        this._flags = {
            isNewMemberChecked: false,
            filledInputs: false,
            correctEmail: false,
            sameEmails: false,
            correctPassword: false,
            samePasswords: false,
            correctName: false,
            isRegisterCreated: false,
        };
        this._form = document.createElement("form");
        this._form.classList.add("login-form");
        this._form.innerHTML = `
            <input class="login-button login-back-arrow" id="login-back-arrow" type="button" value="🡐" hidden>
            <input class="login-input" id="login-email" type="email" placeholder="${this._text.email}">
            <input class="login-input" id="login-password" type="password" placeholder="${this._text.password}">
            <label><input class="login-checkbox" id="login-new-member" type="checkbox" >${this._text.signUp}</label>
            <div class="login-buttons" id="login-buttons-wrapper">
                <input class="login-submit login-button" id="login-submit" type="submit" value="${this._text.submit}" disabled>
                <input class="login-button" id="login-lost-password" type="button" value="${this._text.lostPassword}">
            </div>`;
        this._backArrow = this._form.querySelector("#login-back-arrow");
        this._email = this._form.querySelector("#login-email");
        this._password = this._form.querySelector("#login-password");
        this._newMember = this._form.querySelector("#login-new-member");
        this._buttons = this._form.querySelector("#login-buttons-wrapper");
        this._submit = this._form.querySelector("#login-submit");
        this._lostPassword = this._form.querySelector("#login-lost-password");

        this._newMember.addEventListener("change", this._changeToRegister.bind(this));
        this._lostPassword.addEventListener("click", this._confirmRetrieviengPassword.bind(this));
        this._form.addEventListener("submit", this._submitForm.bind(this));
        this._form.addEventListener("input", this._verifyInputs.bind(this));
        this._form.addEventListener("input", this._verifyInput.bind(this));
    }

    render() {
        // this._form.parentElement.removeChild(this._form);
        // const user = {
        //     userId: 1,
        //     name: "user1",
        //     email: "user1@gmail.com",
        //     exp: 0,
        //     level: 1,
        //     categories: [{
        //         id: 1,
        //         name: "home",
        //         prev: null,
        //         next: null,
        //         tasks: [{
        //             taskId: 1,
        //             taskCategoryId: 1,
        //             taskName: "pierwszy",
        //             taskCreatedDate: new Date(),
        //             taskDeadlineDate: null,
        //             taskCompleted: false,
        //             taskExp: null,
        //             prev: null,
        //             taskDesc: "opis testowy"
        //         }]
        //     }]
        // }
        // const mainView = new MainView(user);
        // document.querySelector("#main").appendChild(mainView.render());
        return this._form;
    }

    _clearAllInputs() {
        [...this._form.querySelectorAll("*")].forEach(el => {
            if (el.value && (el.classList.contains("login-input"))) el.value = ""
        });
        if (this._flags.isNewMemberChecked) {
            this._backArrow.addEventListener('click', this._changeToRegister.bind(this), {
                once: true
            });
            this._newMember.checked = false;
        }
    }

    _changeToRegister() {
        if (!this._flags.isRegisterCreated) {
            this._flags.isNewMemberChecked = true;
            this._flags.isRegisterCreated = true;
            this._lostPassword.hidden = true;

            const reEmail = document.createElement("input");
            reEmail.type = "email";
            reEmail.classList.add("login-input");
            reEmail.classList.add("login-added");
            reEmail.placeholder = this._text.reEmail;
            reEmail.id = "login-reEmail";
            this._reEmail = reEmail;

            const rePassword = document.createElement("input");
            rePassword.type = "password";
            rePassword.classList.add("login-input");
            rePassword.classList.add("login-added");
            rePassword.placeholder = this._text.rePassword;
            rePassword.id = "login-rePassword";
            this._rePassword = rePassword;

            const name = document.createElement("input");
            name.type = "text";
            name.classList.add("login-input");
            name.classList.add("login-added");
            name.placeholder = this._text.name;
            name.id = "login-name";
            this._name = name;

            this._form.insertBefore(name, this._email.nextElementSibling);
            this._form.insertBefore(reEmail, this._email.nextElementSibling);
            this._form.insertBefore(rePassword, this._password.nextElementSibling);

            this._submit.value = this._text.reSubmit;
        } else {
            if (!this._flags.isNewMemberChecked) {
                this._flags.isNewMemberChecked = true;
                this._lostPassword.hidden = true;
                [...this._form.getElementsByClassName("login-added")].forEach(el => el.hidden = false);
                [...this._form.getElementsByClassName("login-error")].filter(el => el.nextElementSibling.classList.contains("login-added")).forEach(el => el.hidden = false);
                this._submit.value = this._text.reSubmit;
            } else {
                this._flags.isNewMemberChecked = false;
                this._lostPassword.hidden = false;
                [...this._form.getElementsByClassName("login-added")].forEach(el => el.hidden = true);
                [...this._form.getElementsByClassName("login-error")].filter(el => el.nextElementSibling.classList.contains("login-added")).forEach(el => el.hidden = true);
                this._submit.value = this._text.submit;
            }
        }
        this._verifyInputs();
    }

    _confirmRetrieviengPassword() {
        if (!this._email.value || !this._flags.correctEmail) {
            this._backArrow.addEventListener("click", this._makeBackArrowListener());
            this._backArrow.hidden = false;
            this._newMember.parentElement.hidden = true;
            this._password.hidden = true;
            this._submit.hidden = true;

            [...this._form.getElementsByClassName("login-error")].forEach((el) => {
                if (el.nextElementSibling !== this._email) el.hidden = true;
            });
            this._inputWrong(this._email);
            this._backArrow.hidden = false;
        } else if (confirm(this._text.lostPasswordSure)) this._retrievePassword();
    }

    _inputGood(input) {
        input.classList.remove("login-input-wrong");
        input.classList.add("login-input-good");
        if (input.previousElementSibling && input.previousElementSibling.classList.contains("login-error")) {
            this._form.removeChild(input.previousElementSibling);
        }
    }

    _inputWrong(input, altMessage) {
        input.classList.remove("login-input-good");
        input.classList.add("login-input-wrong");
        if (input.previousElementSibling && input.previousElementSibling.classList.contains("login-error")) {
            this._form.removeChild(input.previousElementSibling);
        }
        const errorText = document.createElement("span");
        errorText.classList.add("login-error");
        if (!input.value) {
            errorText.innerText = "Pole wymagane";
        } else {
            if (altMessage === undefined) errorText.innerText = this._text[`${input.id}-error${!(input === this._password && input.value.length < this._passLength) ? "" : "-short"}`];
            else errorText.innerText = altMessage;
        }
        this._form.insertBefore(errorText, input);
    }

    _neutralizeAllInputs() {
        [...this._form.getElementsByClassName("login-input-good")].forEach(el => el.classList.remove("login-input-good"));
        [...this._form.getElementsByClassName("login-input-wrong")].forEach(el => el.classList.remove("login-input-wrong"));
    }

    async _retrievePassword() {
        this._showMessage(this._text.serverDown);
        const requestBody = {};
        requestBody.email = this._email.value;
        const apiUrl = "api/rePass";
        try {
            const response = await fetch(apiUrl, {
                method: "post",
                headers: {
                    "Content-type": "application/json; charset=UTF-8"
                },
                body: JSON.stringify(requestBody)
            });
            if (response.status !== 200) throw response;
            this._showMessage("success");
        } catch (error) {
            console.log(error);
        }
    }

    _showMessage(messageText) {
        const message = document.createElement('p');
        message.classList.add("login-text");
        message.innerText = messageText;
        this._backArrow.addEventListener("click", this._makeBackArrowListener(message));
        [...this._form.children].forEach(child => child.hidden = true);
        this._backArrow.hidden = false;
        this._form.insertBefore(message, this._form[0]);
    }

    _makeBackArrowListener() {
        const addedList = [...arguments];
        const showedList = [...this._form.querySelectorAll("*")].filter(el => !el.hidden && el !== this._backArrow);
        const listener = function(event) {
            showedList.forEach(el => el.hidden = false);
            if (addedList.length > 0) addedList.forEach(el => el.parentElement.removeChild(el));
            event.currentTarget.removeEventListener("click", listener);
            event.currentTarget.hidden = true;
        }
        return listener;
    }

    async _submitForm(event) {
        event.preventDefault();
        if (!this._submit || this._submit.disabled) return;
        const requestBody = {};
        let apiUrl = "";
        if (!this._flags.isNewMemberChecked) {
            apiUrl += "/login";
        } else {
            apiUrl += "/users"
            requestBody.name = this._name.value;
        }
        requestBody.email = this._email.value;
        requestBody.passwd = this._password.value;
        try {
            let response = await fetch(apiUrl, {
                method: "post",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });
            if (response.status !== 200) throw response;
            if (!this._flags.isNewMemberChecked) {
                response = await response.json();
                sessionStorage.setItem("x-token", response.token);
                this._form.parentElement.removeChild(this._form);
                const mainView = new MainView(response);
                document.querySelector("#main").appendChild(mainView.render());
            } else {
                this._showMessage(this._text.registerSuccess);
                this._neutralizeAllInputs();
                this._clearAllInputs();
            }
        } catch (error) {
            const {
                status
            } = error;
            console.log(error); // do usunięcia przed wrzuceniem na serwer
            let feedBack = "";
            if (status === undefined) feedBack = this._text.serverDown;
            else if (!this._flags.isNewMemberChecked) {
                if (status === 400 || status === 404) feedBack = this._text.loginFailure;
                else feedBack = this._text.serverDown;
            } else if (status === 400) feedBack = this._text.registerEmailUsed;
            else feedBack = this._text.serverDown;

            this._showMessage(feedBack);
        }
    }

    _submitOnOff() {
        if (!this._submit) return;

        let abled = true;
        for (let i in this._flags) {
            if (i === "isNewMemberChecked" || i === "isRegisterCreated") continue;
            abled = abled && this._flags[i];
        }
        this._submit.disabled = !abled;
    }

    _verifyInput(event) {
        const input = event.target;
        if (!input.classList.contains("login-input")) return;
        if (input.value === "") return this._inputWrong(input);

        if (input === this._email) {
            if (this._flags.correctEmail) this._inputGood(input);
            else this._inputWrong(input);
            if (this._flags.isNewMemberChecked && this._reEmail.value) {
                if (this._flags.sameEmails) this._inputGood(this._reEmail);
                else this._inputWrong(this._reEmail);
            }
        } else if (input === this._password) {
            if (this._flags.correctPassword) this._inputGood(input);
            else this._inputWrong(input);
            if (this._flags.isNewMemberChecked && this._rePassword.value) {
                if (this._flags.samePasswords) this._inputGood(this._rePassword);
                else this._inputWrong(this._rePassword);
            }
        } else if (input === this._reEmail) {
            if (this._flags.sameEmails) this._inputGood(input);
            else this._inputWrong(input);
        } else if (input === this._rePassword) {
            if (this._flags.samePasswords) this._inputGood(input);
            else this._inputWrong(input);
        } else if (input === this._name) {
            if (this._flags.correctName) this._inputGood(input);
            else this._inputWrong(input);
        } else this._inputGood(input);
    }

    _verifyInputs() {
        this._flags.filledInputs = ![...this._form.getElementsByClassName("login-input")].some((el) => el.value === "");
        this._flags.correctEmail = !!this._email.value.match(/.+@.+\..+/gi);
        this._flags.correctPassword = !!(this._password.value && (this._password.value && (this._password.value.length >= this._passLength && !!this._password.value.match(/.*[0-9].*/gi) && !!this._password.value.match(/([!-/]|[:-@]|[\[-`]|[{-~])/gi) && !!this._password.value.match(/[A-Z]/g))));
        if (this._flags.isNewMemberChecked) {
            this._flags.filledInputs = ![...this._form.getElementsByClassName("login-input")].some((el) => el.value === "");
            this._flags.sameEmails = (this._email.value === this._reEmail.value);
            this._flags.samePasswords = (this._password.value === this._rePassword.value);
            this._flags.correctName = !!(this._name.value.length && this._name.value.length >= this._nameLength);
        } else {
            this._flags.filledInputs = ![...this._form.getElementsByClassName("login-input")].filter(el => !el.classList.contains("login-added")).some((el) => el.value === "");
            this._flags.sameEmails = this._flags.samePasswords = this._flags.correctName = true;
        }
        this._submitOnOff.call(this);
    }

    async autoLogin(token)
    {
        try
        {    
            let response = await fetch("/users/me", 
                {
                    method: "get",
                    headers:
                    {
                        "x-token": token,
                    }
                });
            if (response.status !== 200) throw response;
            response = await response.json();
            const user = { user: response.userWithDetails};
            const mainView = new MainView(user);
            document.querySelector("#main").appendChild(mainView.render());
            return true;
        }
        catch (error)
        {
            console.log(error);
            throw false;
        }  
    }   
}

export default Login;