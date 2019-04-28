class Burger {
    constructor() {
        this._sidebar = document.createElement('div');
        this._sidebar.setAttribute('class', 'ui sidebar right vertical menu');

        this._sidebar.innerHTML = `
        <div id='user-segment' class="ui vertical segment loading" style="min-height: 25vh">
        </div>

        <div class="ui segment">
            <div id="logout" class="ui animated fluid basic grey button" tabindex="0">
                <div class="visible content">
                    Wyloguj
                </div>
                <div class="hidden content">
                    <i class="sign-out alternate icon"></i>
                </div>
            </div>
        </div>`
    }
    render() {
        return this._sidebar;
    }

    toggle() {
        $('.ui.sidebar')
            .sidebar('toggle');
    }

    updateBurger() {
        document.getElementById('logout').addEventListener('click', this.logout);

        fetch('users/me', {
                    method: "get",
                    headers: {
                        "x-token": sessionStorage.getItem('x-token')
                        }
                    }).then(res => {
                        return res.json()
                    }).then(res => {
                        const {name, level, currentExp, remainingExp} = res.userWithDetails;
                        const userDataDiv = document.getElementById('user-segment');
                        userDataDiv.setAttribute('class', 'ui vertical segment')
                        userDataDiv.innerHTML = this.userSegment(name,level,currentExp,remainingExp);
                        this.setExp(currentExp, remainingExp)
                    })
    }

    userSegment(name, level, currentExp, remainingExp) {
        return `
        <img style="margin-top: 40px" class="ui small centered circular image"
            src="https://i.some-random-api.ml/IC9sssLQyP.jpg">
        <h3 class="ui center aligned header">
            ${name}
        </h3>
        <h4 class="ui center aligned header">
            Poziom ${level}
        </h4>
        <div class="ui segment item">
            <div class="ui teal progress" id="exp-bar">
                <div class="bar"></div>
                <div id="exp-text" class="label">${currentExp}/${remainingExp} XP</div>
            </div>
        </div>`
    }

    logout() {
        sessionStorage.removeItem('x-token');
        document.location.reload();
    }

    fillPusher() {
        this._pusher = document.createElement('div')
        this._pusher.setAttribute('class', 'pusher');
        this._pusher.appendChild(document.querySelector('#main'))
        document.body.appendChild(this._pusher);
    }

    get menuBurgerButton() {
        this._menuButton = document.createElement('button');
        this._menuButton.setAttribute('class', 'ui button right floated');
        this._menuButton.innerHTML = `<i class="sidebar icon"></i>`;
        this._menuButton.addEventListener('click', () => {
            this.toggle();
        })
        return this._menuButton;
    }

    setExp(currentExp, remExp) {
        const nextExp = currentExp + remExp;
        document.querySelector('#exp-text').innerHTML = `${currentExp}/${nextExp} XP`
        $('#exp-bar').progress({
            percent: currentExp*100/nextExp
        });
    }
}

export default Burger;