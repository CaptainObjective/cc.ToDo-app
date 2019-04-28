import MainView from './MainView';
import TaskDetails from './TaskDetails';
class Task {
    constructor(obiect = {}) {
        this._parent = obiect.taskParent;
        this._taskId = obiect.taskId;
        this._taskName = obiect.taskName;
        this._createdDate = obiect.createdDate;
        this._index = obiect.taskIndex;
        this._taskExp = 1;
        this._taskDesc = obiect.taskName;
        this._completed = false;
        this._task = document.createElement('div');
        this._task.classList.add('task');
        this._taskHeader = document.createElement('div');
        this._taskHeader.classList.add('task-header');
        this._taskHeaderTitle = document.createElement('h4');
        this._taskHeaderTitle.classList.add('task-header-title');
        this._taskHeaderTitle.classList.add('active');
        this._taskHeaderTitle.innerText = this._taskName;
        this._taskIsCompletedCheckbox = document.createElement("input");
        this._taskIsCompletedCheckbox.type = "checkbox";
        this._taskIsCompletedCheckbox.checked = obiect.taskCompleted ? true : false;
        this._TaskDeleteButton = document.createElement('div');
        this._TaskDeleteButton.innerHTML = '<i class="close icon"></i>';
        this._task.appendChild(this._taskHeader);
        this._taskHeader.appendChild(this._taskHeaderTitle);
        this._taskHeader.appendChild(this._TaskDeleteButton);
        this._taskHeader.appendChild(this._taskIsCompletedCheckbox);
        this._taskHeaderTitle.onclick = this.showTaskDetailsWindow.bind(this);
        this._TaskDeleteButton.onclick = this._parent._deleteTask.bind(this);
        this._taskIsCompletedCheckbox.addEventListener('change', this.checkCompleted.bind(this));
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

    async changeTaskName(e) {
        e.preventDefault();
        const form = this._taskHeader.lastElementChild;
        const token = sessionStorage.getItem('x-token');
        const requestHeaders = {
            'Content-Type': 'application/json',
            "x-token": token
        }
        const requestBody = {
            categoryId: this._parent.id,
            desc: form.firstElementChild.value,
            deadline: this.taskDeadlineDate,
            exp: this._taskExp,
            completed: this.taskCompleted
        }
        try {
            const response = await fetch(`tasks/${this.id}`, {
                method: "put",
                headers: requestHeaders,
                body: JSON.stringify(requestBody)
            })
            if (response.status !== 200) throw response;
        } catch (error) {
            alert("Nie udało się połączyć z serwerem!");
            return
        }
        this._taskName = form.firstElementChild.value;
        this._taskHeaderTitle.innerText = this._taskName;
        this._taskHeaderTitle.hidden = false;
        form.remove()
    }

    async checkCompleted() {
        const token = sessionStorage.getItem('x-token');
        const requestHeaders = {
            'Content-Type': 'application/json',
            'x-token': token
        };
        const requestBody = {
            categoryId: this._parent.id,
            desc: this._taskDesc,
            deadline: this.taskDeadlineDate,
            exp: this._taskExp,
            completed: this.completed
        };
        try {
            const response = await fetch(`/tasks/${this._taskId}`, {
                method: "put",
                headers: requestHeaders,
                body: JSON.stringify(requestBody)
            })
            if (response.status !== 200) throw response;
            // taskFromServer = await response.json();
        } catch (error) {
            alert("Nie udało się połączyć z serwerem!");
            return;
        }
    }

    async showTaskDetailsWindow() {
        const token = sessionStorage.getItem('x-token');
        const requestHeaders = {
            'Content-Type': 'application/json',
            "x-token": token
        };
        const requestBody = {
            taskId: this._taskId,
            desc: this._taskDesc
        };
        console.log(this, requestBody)
        let taskDetailsFromServer = {};
        try {
            const response = await fetch("/subtasks", {
                method: "post",
                headers: requestHeaders,
                body: JSON.stringify(requestBody)
            })
            if (response.status !== 200) throw response;
            taskDetailsFromServer = await response.json();
        } catch (error) {
            alert("Nie udało się połączyć z serwerem!");
            return;
        }
        const taskDetails = new TaskDetails({
            id: taskDetailsFromServer.id,
            parent: this,
            taskName: this._taskName,
            taskDesc: this._taskDesc
        });
        this._task.appendChild(taskDetails.render());
    }
}

export default Task