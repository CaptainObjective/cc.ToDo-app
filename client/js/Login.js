class Login
{
    constructor()
    {
        this._passLength = 8;
        this._text = 
        {
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
            "login-password-error2": `Hasło powinno mieć więcej niż ${this._passLength} znaków`,
            "login-reEmail-error": "Podane adresy różnią się",
            "login-rePassword-error": "Hasła różnią się"
        };
        this._flags =
        {
            filledInputs: false,
            correctEmail: false,
            sameEmails: false,
            correctPassword: false,
            samePasswords: false
        };
        this._isNew = false;
        this._form = document.createElement("form");
        this._form.classList.add("login-form");
        this._form.innerHTML = `
            <input class="login-input" id="login-email" type="email" placeholder="${this._text.email}">
            <input class="login-input" id="login-password" type="password" placeholder="${this._text.password}">
            <label><input class="login-checkbox" id="login-register" type="checkbox" >${this._text.signUp}</label>
            <div class="login-buttons" id="login-buttons-wrapper">
                <input class="login-submit login-button" id="login-submit" type="submit" value="${this._text.submit}" disabled>
                <input class="login-button" id="login-lost-password" type="button" value="${this._text.lostPassword}">
            </div>`;
        this._email = this._form.children[0];
        this._password = this._form.children[1];
        this._register = this._form.children[2];
        this._buttons = this._form.querySelector("#login-buttons-wrapper");
        this._submit = this._form.querySelector("#login-submit");
        this._lostPassword = this._form.querySelector("#login-lost-password");

        this._register.addEventListener("change", this._changeToRegister.bind(this));
        this._lostPassword.addEventListener("click", this._confirmRetrieviengPassword.bind(this));
        this._form.addEventListener("submit", this._submitForm.bind(this));
        this._form.addEventListener("input", this._verifyInputs.bind(this));
        this._form.addEventListener("input", this._verifyInput.bind(this));
    }

    render() {
        return this._form;
    }

    _changeToRegister() 
    {
        if (!this._isNew) {
            this._isNew = true;
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
        }
        else {
            this._isNew = false;
            this._lostPassword.hidden = false;
            [...this._form.getElementsByClassName("login-added")].forEach(el => {
                this._inputGood(el);
                this._form.removeChild(el);
            });
            this._submit.value = this._text.submit;
            this._reEmail = undefined;
            this._rePassword = undefined;
        }
        this._verifyInputs();
    }

    _confirmRetrieviengPassword()
    {
        if (!this._email.value || !this._flags.correctEmail)
        {
            this._form.removeChild(this._register);
            this._form.removeChild(this._password);
            this._buttons.removeChild(this._submit);
            this._register = undefined;
            this._submit = undefined;
            this._password = undefined;
            [...this._form.getElementsByClassName("login-error")].forEach((el) => this._form.removeChild(el));

            this._inputWrong(this._email);
        }
        else if (confirm(this._text.lostPasswordSure)) this._retrievePassword();
    }
        
    _inputGood(input) {
        input.classList.remove("login-input-wrong");
        input.classList.add("login-input-good");
        if (input.previousElementSibling && input.previousElementSibling.classList.contains("login-error")) {
            this._form.removeChild(input.previousElementSibling);
        }
    }

    _inputWrong(input) {
        input.classList.remove("login-input-good");
        input.classList.add("login-input-wrong");
        if (input.previousElementSibling && input.previousElementSibling.classList.contains("login-error")) {
            this._form.removeChild(input.previousElementSibling);
        }
        const errorText = document.createElement("span");
        errorText.classList.add("login-error");
        if (!input.value) {
            errorText.innerText = "Pole wymagane";
        }
        else {
            if (input === this._password && input.value.length < this._passLength)errorText.innerText = this._text[`${input.id}-error2`];
            else errorText.innerText = this._text[`${input.id}-error`]
        }
        this._form.insertBefore(errorText, input);
    }

    async _retrievePassword()
    {
        const requestBody = {};
        requestBody.email = this._email.value;
        const apiUrl = "api/rePass";
        try
        {
            const response = await fetch(apiUrl,
                {
                    method: "post",
                    headers: { "Content-type": "application/json; charset=UTF-8" },
                    body: JSON.stringify(requestBody)
                });
            if (response.status !== 200) throw response;
        }
        catch(error)
        {
            console.log(error);
        }
    }

    async _submitForm(event) {
        event.preventDefault();
        if (!this._submit || this._submit.disabled) return;
        const requestBody = {};
        let apiUrl;
        if (!this._isNew) {
            apiUrl = "api/auth";
        }
        else {
            apiUrl = "api/reqister"
        }
        requestBody.email = this._email.value;
        requestBody.password = this._password.value;
        try {
            const response = await fetch(apiUrl,
                {
                    method: "post",
                    headers: { "Content-type": "application/json; charset=UTF-8" },
                    body: JSON.stringify(requestBody)
                });
            if (response.status !== 200) throw response;

            //obsługa logowania
        }
        catch (error) {
            console.log(error);
            // obsługa błędu w zależności od rodzaju błędu
        }
    }

    _submitOnOff() {
        if (!this._submit) return;

        let abled = true;
        for (let i in this._flags) {
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
            if (this._isNew && this._reEmail.value) {
                if (this._flags.sameEmails) this._inputGood(this._reEmail);
                else this._inputWrong(this._reEmail);
            }
        }
        else if (input === this._password) {
            if (this._flags.correctPassword) this._inputGood(input);
            else this._inputWrong(input);
            if (this._isNew && this._rePassword.value) {
                if (this._flags.samePasswords) this._inputGood(this._rePassword);
                else this._inputWrong(this._rePassword);
            }
        }
        else if (input === this._reEmail) {
            console.log(input.value);
            if (this._flags.sameEmails) this._inputGood(input);
            else this._inputWrong(input);
        }
        else if (input === this._rePassword) {
            if (this._flags.samePasswords) this._inputGood(input);
            else this._inputWrong(input);
        }
        else this._inputGood(input);

    }

    _verifyInputs() {
        this._flags.filledInputs = ![...this._form.getElementsByClassName("login-input")].some((el) => el.value === "");
        this._flags.correctEmail = !!this._email.value.match(/.+@.+\..+/gi);
        this._flags.correctPassword = this._password && (this._password.value && (this._password.value.length >= 8 && !!this._password.value.match(/.*[0-9].*/gi) && !!this._password.value.match(/([!-/]|[:-@]|[\[-`]|[{-~])/gi) && !!this._password.value.match(/[A-Z]/g)));
        if (this._isNew) {
            this._flags.sameEmails = (this._email.value === this._reEmail.value);
            this._flags.samePasswords = (this._password.value === this._rePassword.value);
        }
        else {
            this._flags.sameEmails = this._flags.samePasswords = true;
        }
        this._submitOnOff.call(this);

    }
}

export default Login;