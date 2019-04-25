import MainView from './MainView';
class Task {
    constructor(obiect) {
        this._taskName = obiect._taskName;
        this._task = document.createElement('div');
        this._task.classList.add('task');
        this._taskHeader = document.createElement('div');
        this._taskHeader.classList.add('task-header');
        this._taskHeaderTitle = document.createElement('h4');
        this._taskHeaderTitle.classList.add('task-header-title');
        this._taskHeaderTitle.classList.add('active');
        this._taskHeaderTitle.innerText = this._taskName;
       
        this._task.appendChild(this._taskHeader);
        this._taskHeader.appendChild(this._taskHeaderTitle);
        this._taskHeaderTitle.onclick = this.showChangeNameInput.bind(this);
    }

    render() {
        return this._task
    }
    
    showChangeNameInput() {
        const that = this;
        this._taskHeaderTitle.hidden = true;
        const formName = MainView.createInputName();
        formName.children[1].innerText = 'Zmień';
        this._taskHeader.appendChild(formName);
        formName.firstElementChild.value = this._taskName;
        formName.children[1].addEventListener('click', that.changeTaskName.bind(this));
    }

    changeTaskName(e) {
        e.preventDefault();
        const form = this._taskHeader.lastElementChild;
        this._taskName = form.firstElementChild.value;
        this._taskHeaderTitle.innerText = this._taskName;
        this._taskHeaderTitle.hidden = false;
        form.remove()
    }
}

export default Task