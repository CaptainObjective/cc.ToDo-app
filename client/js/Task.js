import MainView from './MainView';
import TaskDetails from './TaskDetails';
class Task {
    constructor(obiect = {}) {
        this._parent = obiect.taskParent;
        this._taskName = obiect.taskName;
        this._createdDate = obiect.createdDate;
        this._taskExp = 1;
        this._taskDesc = obiect._taskDesc;
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
        this._taskHeaderTitle.onclick = this.showTaskDetailsWindow.bind(this);
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

    showTaskDetailsWindow() {
        const taskDetails = new TaskDetails({
            parent: this,
            taskName: this._taskName,
            taskDesc: this._taskDesc
        });
        this._task.appendChild(taskDetails.render());
    }
}

export default Task