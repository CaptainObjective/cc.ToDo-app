class Burger {
    constructor() {
        this._sidebar = document.createElement('div');
        this._sidebar.setAttribute('class', 'ui sidebar inverted right vertical menu');
        this._sidebar.innerHTML = `
            <a class="item">1</a>
            <a class="item">2</a>
            <a class="item">3</a>`
    }
    render() {
        return this._sidebar;
    }

    toggle() {
        $('.ui.sidebar')
            .sidebar('toggle');
    }
}

export default Burger;