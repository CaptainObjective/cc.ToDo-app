import Task from './Task'
import MainView from './MainView';
import Sortable from "sortablejs";

class Category {
    constructor(obiekt = {}) {
        this.parent = obiekt.parent;
        delete obiekt.parent;
        // console.log(obiekt)
        obiekt = JSON.parse(JSON.stringify(obiekt));
        for (let i in obiekt) {
            this[i] = obiekt[i];
        }
        this._tasksList = [];
        this._category = document.createElement('div');
        // this._category.draggable = "true";
        this._category.parent = this;
        this._category.className = 'ui segment category column';
        this._categoryHeader = document.createElement('div');
        this._categoryHeader.className = 'ui segment category-header';
        this._categoryHeaderTitle = document.createElement('h4');
        this._categoryHeaderTitle.className = ('category-header-title ui header');
        this._categoryHeaderTitle.classList.add('active');
        this._categoryHeaderTitle.innerText = this.name;
        this._categoryHeaderButtonWrapper = document.createElement('div');
        this._categoryHeaderButtonWrapper.className = 'category-header-button-wrapper'
        this._categoryDeleteButton = document.createElement('div');
        this._categoryDeleteButton.className = 'ui teal button category-header-delete';
        this._categoryDeleteButton.innerHTML = `<i class="fas fa-times"></i>`;
        this._categoryCopyButton = document.createElement('div');
        this._categoryCopyButton.className = 'ui teal button category-header-copy-category';
        this._categoryCopyButton.innerHTML = `<i class="far fa-copy"></i>`;
        this._categorySortButton = document.createElement('div');
        this._categorySortButton.className = 'ui teal button category-header-sort'
        this._categorySortButton.innerHTML = `<i class="fas fa-sort"></i>`;
        this._categoryRestoreButton = '';
        this._categoryBody = document.createElement('div');
        this._categoryBody.className = 'category-body';
        this._categoryTasksWrapper = document.createElement('div');
        this._categoryTasksWrapper.className = 'category-tasks-wrapper';
        this._addNewTaskButton = document.createElement('button');
        this._addNewTaskButton.className = "ui teal button category-body-add-task";
        this._addNewTaskButton.innerHTML = '<i class="fas fa-plus"></i>';
        this._category.appendChild(this._categoryHeader);
        this._category.appendChild(this._categoryBody);
        this._categoryHeader.appendChild(this._categoryHeaderTitle);
        this._categoryHeader.appendChild(this._categoryHeaderButtonWrapper);
        this._categoryHeaderButtonWrapper.appendChild(this._categoryDeleteButton);
        this._categoryHeaderButtonWrapper.appendChild(this._categoryCopyButton);
        this._categoryHeaderButtonWrapper.appendChild(this._categorySortButton);
        this._categoryBody.appendChild(this._addNewTaskButton);
        this._categoryBody.appendChild(this._categoryTasksWrapper);
        this._categoryHeaderTitle.onclick = this.showChangeNameInput.bind(this);
        this._categoryDeleteButton.onclick = this.showArchivePopup.bind(this);
        this._categoryCopyButton.onclick = this.copyCategory.bind(this);
        this._addNewTaskButton.onclick = this.addNewTask.bind(this);
        this._categorySortButton.onclick = this.showSortMethods.bind(this)
        if (obiekt._tasksList) {
            const tasks = obiekt._tasksList;
            tasks.sortByPrevAndId().forEach(this._createTaskFromServer.bind(this));
        }
        this._enableMoving();
    }

    render() {
        return this._category
    }

    async _moveTask(task, from, to, newIndex) {
        if (!Number.isInteger(newIndex) || newIndex < 0) return;
        if (from === to) {
            this._moveTaskInsideCategory(task, newIndex)
        } else {
            try {
                const response = await fetch(`/tasks/${task.id}`, {
                    method: "put",
                    headers: {
                        'Content-Type': 'application/json',
                        "x-token": this.parent._token
                    },
                    body: JSON.stringify({
                        categoryId: to.id,
                        desc: task._taskDesc,
                        exp: task._taskExp,
                        completed: task._completed
                    })
                })

                if (response.status !== 200) throw response;

                from._tasksList.splice(task.index, 1);
                from._tasksList.forEach((task, index) => task.index = index);

                to._tasksList.push(task);
                task._parent = to;
                task.index = to._tasksList.length - 1;
                to._moveTaskInsideCategory(task, newIndex, true);
            } catch (error) {
                console.log(error);
                alert("Nie można się połączyć z serwerem!")
                throw error;
                location.reload();
            }
        }
    }

    async _moveTaskInsideCategory(task, newIndex, categoryChanged = false) {
        if (task.index === newIndex && !categoryChanged) return;
        try {
            const tempList = [...this._tasksList];
            tempList.splice(task.index, 1);
            tempList.splice(newIndex, 0, task);
            const oldIndex = task.index;

            const prevList = tempList.map((el, index) => index ? tempList[index - 1].id : null);

            const requestHeaders = {
                'Content-Type': 'application/json',
                "x-token": this.parent._token
            };
            const requestBody = {
                prev: prevList[newIndex]
            };
            let response = await fetch(`/tasks/${task.id}?order=true`, {
                method: "put",
                headers: requestHeaders,
                body: JSON.stringify(requestBody)

            })
            if (response.status !== 200) throw response;

            this._tasksList = tempList;
            this._tasksList.forEach((cat, index) => cat.index = index);
        } catch (error) {
            console.log(error);
            alert("Nie można się połączyć z serwerem!")
            // location.reload();
        }
    }

    showChangeNameInput() {
        const that = this;
        this._categoryHeaderTitle.hidden = true;
        const formName = MainView.createInputName();
        formName.children[1].innerText = 'Zmień';
        this._categoryHeader.insertBefore(formName, this._categoryHeader.lastElementChild);
        formName.firstElementChild.value = this.name;
        formName.children[1].addEventListener('click', that.changeCategoryName.bind(this));
    }

    async changeCategoryName(e) {
        e.preventDefault();
        const form = this._categoryHeader.children[1];
        const token = sessionStorage.getItem('x-token');
        const requestHeaders = {
            'Content-Type': 'application/json',
            "x-token": token
        }
        const requestBody = {
            name: form.firstElementChild.value
        }
        try {
            const response = await fetch(`categories/${this.id}`, {
                method: "put",
                headers: requestHeaders,
                body: JSON.stringify(requestBody)
            })
            if (response.status !== 200) throw response;
        } catch (error) {
            alert("Nie udało się połączyć z serwerem!");
            console.log(error);
            location.reload();
        }
        this.name = form.firstElementChild.value;
        this._categoryHeaderTitle.innerText = this.name;
        this._categoryHeaderTitle.hidden = false;
        form.remove()
    }

    showArchivePopup() {
        const popup = document.createElement('div')
        popup.className = 'ui card delete-popup';
        popup.innerHTML = `<div class ="content">Czy na pewno chcesz zarchiwizować kategorię <span class="delete-popup-category-name">${this.name}?</span> </div> <div class="extra content"><div class="ui two buttons"> <button class="ui basic green button delete-yes">Tak</button> <button class="ui basic red button detele-no">Nie</button></div></div>`;
        this._categoryHeader.appendChild(popup);
        popup.children[1].addEventListener('click', () => {
            this.parent.archiveCategory(this);
            popup.remove();
        })
        popup.lastElementChild.addEventListener('click', () => {
            popup.remove()
        })
    }

    showDeletePopup() {
        const popup = document.createElement('div');
        popup.className = 'ui card delete-popup';
        popup.innerHTML = `<div class ="content">Czy na pewno chcesz usunąć kategorię <span class="delete-popup-category-name">${this.name}?</span> </div> <div class="extra content"><div class="ui two buttons"> <button class="ui basic green button delete-yes">Tak</button> <button class="ui basic red button detele-no">Nie</button></div></div>`;
        this.parent.render().appendChild(popup);
        popup.children[1].addEventListener('click', () => {
            this.parent.deleteCategory(this)
            popup.remove()
        })
        popup.lastElementChild.addEventListener('click', () => {
            popup.remove()
        })
    }

    showRestorePopup() {
        const popup = document.createElement('div');
        popup.className = 'ui card delete-popup';
        popup.innerHTML = `<div class ="content">Czy na pewno chcesz przywrócić kategorię <span class="delete-popup-category-name">${this.name}?</span> </div> <div class="extra content"><div class="ui two buttons"> <button class="ui basic green button delete-yes">Tak</button> <button class="ui basic red button detele-no">Nie</button></div></div>`;
        popup.children[1].addEventListener('click', () => {
            this.parent.restoreCategory(this);
            popup.remove();
        })
        popup.lastElementChild.addEventListener('click', () => {
            popup.remove();
        })
    }

    archive() {
        this._category.remove();
        this._addNewTaskButton.hidden = true;
        this._categoryCopyButton.hidden = true;
        this._categoryHeaderTitle.classList.remove('active')
        this._categoryRestoreButton = document.createElement('div');
        this._categoryRestoreButton.className = 'category-header-restore';
        this._categoryRestoreButton.innerHTML = '<i class="fas fa-window-restore"></i>';
        this._categoryHeader.appendChild(this._categoryRestoreButton);
        this._categoryHeaderTitle.onclick = null;
        this._categoryDeleteButton.onclick = null;
        this._categoryDeleteButton.addEventListener('click', this.showDeletePopup.bind(this));
        this._categoryRestoreButton.addEventListener('click', this.showRestorePopup.bind(this));
    }

    restore() {
        this._category.remove();
        this._addNewTaskButton.hidden = false;
        this._categoryCopyButton.hidden = false;
        this._categoryHeaderTitle.classList.add('active');
        this._categoryRestoreButton.remove();
        this._categoryHeaderTitle.onclick = this.showChangeNameInput.bind(this);
        this._categoryDeleteButton.onclick = null;
        this._categoryDeleteButton.onclick = this.showArchivePopup.bind(this);
    }

    createInputNameTask() {
        const formName = document.createElement('form')
        formName.className = 'ui form form-task-name'
        formName.innerHTML = '<div class="newitem-title-wrapper ui input focus">' +
            '<textarea rows="1" class="new-task-title-input" type="text"></textarea>' +
            '<input class="ui button new-task-title-submit" type ="button"  value="Dodaj">' +
            '</div>'
        const deleteFormButton = document.createElement('div')
        deleteFormButton.innerHTML = '<i class="fas fa-times"></i>'
        this._inputTaskName = formName.querySelector(".new-task-title-input");
        formName.appendChild(this._inputTaskName);
        formName.appendChild(formName.querySelector(".new-task-title-submit"))
        formName.appendChild(deleteFormButton)
        deleteFormButton.addEventListener('click', function() {
            this.parentElement.remove()
        })
        return formName
    }

    addNewTask() {
        if (document.getElementById('add-task-input')) return
        const formName = this.createInputNameTask();
        this._categoryTasksWrapper.appendChild(formName);
        //formName.children[0].focus();
        formName.children[2].addEventListener('click', this._createNewTask.bind(this));
    }

    async _createNewTask(e) {
        e.preventDefault();
        const input = this._inputTaskName;
        const token = sessionStorage.getItem('x-token');
        const requestHeaders = {
            'Content-Type': 'application/json',
            'x-token': token
        };
        const requestBody = {
            categoryId: this.id,
            desc: input.value,
            deadline: null,
            exp: 1
        };
        let taskFromServer = {};
        try {
            const response = await fetch("/tasks", {
                method: "post",
                headers: requestHeaders,
                body: JSON.stringify(requestBody)
            })
            if (response.status !== 200) throw response;
            taskFromServer = await response.json();
        } catch (error) {
            alert("Nie udało się połączyć z serwerem!");
            console.log(error);
            location.reload();
        }


        const task = new Task({
            taskId: taskFromServer.id,
            taskParent: this,
            taskName: input.value,
            taskIndex: this._tasksList.length,
            taskDeadlineDate: null,
            taskDesc: null,
            taskCompleted: false
        })
        this._tasksList.push(task);
        this._categoryTasksWrapper.appendChild(task.render());
        input.parentElement.remove();

    }

    _createTaskFromServer(taskFromServer, index) {
        const task = new Task({
            taskParent: this,
            taskId: taskFromServer.id,
            taskCategoryId: taskFromServer.taskCategoryId,
            taskName: taskFromServer.desc,
            index,
            taskDeadlineDate: taskFromServer.deadline,
            taskCompleted: taskFromServer.completed,
            taskExp: taskFromServer.taskExp,
            prev: taskFromServer.prev,
            // taskDesc: taskFromServer.taskDesc
        })
        this._tasksList.push(task);
        this._categoryTasksWrapper.appendChild(task.render());
    }

    async _deleteTask() {
        this._parent._tasksList.splice(this.index, 1);
        const token = sessionStorage.getItem('x-token');
        const requestHeaders = {
            'Content-Type': 'application/json',
            'x-token': token
        };
        try {
            const response = await fetch(`/tasks/${this._taskId}`, {
                method: "delete",
                headers: requestHeaders,
            })
            if (response.status !== 200) throw response;
        } catch (error) {
            alert("Nie udało się połączyć z serwerem!");
            console.log(error);
            location.reload();
        }
        this.render().remove();
        this._parent._tasksList.forEach((task, index) => task.index = index)
    }

    copyCategory() {
        console.log('Kopiuje taski')
    }

    showSortMethods() {
        const sortMethodList = document.createElement('div')
        sortMethodList.classList.add('category-header-method-list')
        sortMethodList.innerHTML = `<ul> <li id="deadline-up" class="method-list__sort-deadline-date-up"><i class="fas fa-window-restore"></i> Deadline rosnąco </li> <li id="deadline-down" class="method-list__sort-deadline-date-down"> <i class="fas fa-window-restore"></i> Deadline malejąco</li> <li id="create-up" class="method-list__sort-create-date-up"><i class="fas fa-window-restore"></i> Data utworzenia rosnąco</li> <li id="create-down" class="method-list__sort-create-date-down">  <i class="fas fa-window-restore"></i>Data utworzenia malejąco</li> <li id="alphabet" class="method-list__sort-alphabet">  <i class="fas fa-window-restore"></i>Alfabetycznie</li> </ul>`
        this._categoryHeader.appendChild(sortMethodList)
        document.getElementById('deadline-up').onclick = this.sortByDeadlineUp.bind(this)
        document.getElementById('deadline-down').onclick = this.sortByDeadlineDown.bind(this)
        document.getElementById('create-up').onclick = this.sortByCreateUp.bind(this)
        document.getElementById('create-down').onclick = this.sortByCreateDown.bind(this)
        document.getElementById('alphabet').onclick = this.sortByAlphabet.bind(this)
    }

    sortByDeadlineUp() {
        console.log('sortuje po deadlinie rosnąco')
    }

    sortByDeadlineDown() {
        console.log('sortuje po deadlinie malejąco')
    }

    sortByCreateUp() {
        console.log('sortuje po dacie utworzenia rosnąco')
    }

    sortByCreateDown() {
        console.log('sortuje po dacie utworzenia malejąco')
    }

    sortByAlphabet() {
        console.log('sortuje alfabetycznie')
    }

    _enableMoving() {
        new Sortable(this._categoryTasksWrapper, {
            group: "category",
            animation: 150,
            onEnd: (evt) => {
                this._moveTask(evt.item.parent, evt.from.parentElement.parentElement.parent, evt.to.parentElement.parentElement.parent, evt.newIndex);
            }
        })
    }
}

export default Category;