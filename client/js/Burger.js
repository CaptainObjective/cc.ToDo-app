class Burger {
    constructor() {
        this._sidebar = document.createElement('div');
        this._sidebar.setAttribute('class', 'ui sidebar right vertical menu');
        this._sidebar.innerHTML = `
        <img style="margin-top: 40px" class="ui tiny centered circular image"
            src="https://avatars3.githubusercontent.com/u/36295040?s=460&v=4">
        <h3 class="ui center aligned header">
            Mateusz Pichniarczyk
        </h3>
        <h5 class="ui center aligned header">
            Poziom 5
        </h5>
        <div class="ui segment item">
            <div class="ui teal progress" id="exp-bar">
                <div class="bar"></div>
                <div id="exp-text" class="label">400/800 XP</div>
            </div>

            <div class="ui divider"></div>
            <div class="ui animated fluid teal button" tabindex="0">
                <div class="visible content">
                    Sklep
                </div>
                <div class="hidden content">
                    <i class="shop icon"></i>
                </div>
            </div>
            <div class="ui divider"></div>
            <div class="ui animated fluid teal button" tabindex="0">
                <div class="visible content">
                    Osiągnięcia
                </div>
                <div class="hidden content">
                    <i class="trophy icon"></i>
                </div>
            </div>
        </div>
        <div class="ui segment">
            <h3 class="ui center aligned header">Dzisiejsze zadanie specjalne</h3>
            <div class="ui cards">

                <div class="card">
                    <div class="content">
                        <i class='bullhorn icon'></i>
                        <div class="header">
                            Pompuj!
                        </div>
                        <div class="meta">
                            150 xp
                        </div>
                        <div class="description">
                            Zrób 3 serie po 15 pompek.
                        </div>
                    </div>
                    <div class="extra content">
                        <div class="ui two buttons">
                            <div class="ui two buttons">
                                <div class="ui animated basic green button" tabindex="0">
                                    <div class="visible content">
                                        Akceptuj
                                    </div>
                                    <div class="hidden content">
                                        <i class="thumbs up icon"></i>
                                    </div>
                                </div>
                                <div class="ui animated fluid basic red button" tabindex="0">
                                    <div class="visible content">
                                        Odrzuć
                                    </div>
                                    <div class="hidden content">
                                        <i class="thumbs down icon"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
        <div class="ui segment">
            <div class="ui two buttons">
                <div class="ui animated fluid teal button" tabindex="0">
                    <div class="visible content">
                        Ustawienia
                    </div>
                    <div class="hidden content">
                        <i class="address book icon"></i>
                    </div>
                </div>
                <div class="ui animated fluid basic grey button" tabindex="0">
                    <div class="visible content">
                        Wyloguj
                    </div>
                    <div class="hidden content">
                        <i class="sign-out alternate icon"></i>
                    </div>
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

    setExp(currentExp, nextExp) {
        document.querySelector('#exp-text').innerHTML = `${currentExp}/${nextExp} XP`
        $('#exp-bar').progress({
            percent: currentExp*100/nextExp
        });
    }
}

export default Burger;