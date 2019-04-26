import Task from './Task'
import MainView from './MainView';

class Category {
    constructor(obiekt = {}) {
        this.parent = obiekt.parent;
        delete obiekt.parent;

        obiekt = JSON.parse(JSON.stringify(obiekt));
        for (let i in obiekt) {
            this[i] = obiekt[i];
        }
        this._tasksList = [];
        this._category = document.createElement('div');
        this._category.classList.add('category');
        this._categoryHeader = document.createElement('div');
        this._categoryHeader.classList.add('category-header');
        this._categoryHeaderTitle = document.createElement('h4');
        this._categoryHeaderTitle.classList.add('category-header-title');
        this._categoryHeaderTitle.classList.add('active');
        this._categoryHeaderTitle.innerText = this._categoryName;
        this._categoryDeleteButton = document.createElement('div');
        this._categoryDeleteButton.classList.add('category-header-delete');
        this._categoryDeleteButton.innerHTML = `<i class="fas fa-times"></i>`;
        this._categoryCopyButton = document.createElement('div');
        this._categoryCopyButton.classList.add('category-header-copy-category');
        this._categoryCopyButton.innerHTML = `<i class="far fa-copy"></i>`;
        this._categorySortButton = document.createElement('div');
        this._categorySortButton.classList.add('category-header-sort')
        this._categorySortButton.innerHTML = `<i class="fas fa-sort"></i>`;
        this._categoryRestoreButton = '';
        this._categoryBody = document.createElement('div');
        this._categoryBody.className = 'category-body';
        this._addNewTaskButton = document.createElement('button');
        this._addNewTaskButton.className = "category-body-add-task";
        this._addNewTaskButton.innerText = '+';
        this._category.appendChild(this._categoryHeader);
        this._category.appendChild(this._categoryBody);
        this._categoryHeader.appendChild(this._categoryHeaderTitle);
        this._categoryHeader.appendChild(this._categoryDeleteButton);
        this._categoryHeader.appendChild(this._categoryCopyButton);
        this._categoryHeader.appendChild(this._categorySortButton);
        this._categoryBody.appendChild(this._addNewTaskButton);
        this._categoryHeaderTitle.onclick = this.showChangeNameInput.bind(this);
        this._categoryDeleteButton.onclick = this.showArchivePopup.bind(this);
        this._categoryCopyButton.onclick = this.copyCategory.bind(this);
        this._addNewTaskButton.onclick = this.addNewTask.bind(this);
        this._categorySortButton.onclick = this.showSortMethods.bind(this)
    }

    render() {
        return this._category
    }

    showChangeNameInput() {
        const that = this;
        this._categoryHeaderTitle.hidden = true;
        const formName = MainView.createInputName();
        formName.children[1].innerText = 'Zmień';
        this._categoryHeader.appendChild(formName);
        formName.firstElementChild.value = this.name;
        formName.children[1].addEventListener('click', that.changeCategoryName.bind(this));
    }

    changeCategoryName(e) {
        e.preventDefault();
        const form = this._categoryHeader.lastElementChild;
        this.name = form.firstElementChild.value;
        this._categoryHeaderTitle.innerText = this.name;
        this._categoryHeaderTitle.hidden = false;
        form.remove()
    }

    showArchivePopup() {
        const popup = document.createElement('div')
        popup.className = 'delete-popup';
        popup.innerHTML = `Czy na pewno chcesz zarchiwizować kategorię <span class="delete-popup-category-name">${this.name}?</span> <button class="delete-yes">Tak</button> <button class="detele-no">Nie</button>`;
        this.parent.render().appendChild(popup);
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
        popup.className = 'delete-popup';
        popup.innerHTML = `Czy na pewno chcesz usunąć kategorię <span class="delete-popup-category-name">${this.name}?</span> <button class="delete-yes">Tak</button> <button class="detele-no">Nie</button>`;
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
        popup.className = 'delete-popup';
        popup.innerHTML = `Czy na pewno chcesz przywrócić kategorię <span class="delete-popup-category-name">${this.name}?</span> <button class="delete-yes">Tak</button> <button class="detele-no">Nie</button>`;
        this.parent.render().appendChild(popup);
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
        formName.classList.add('form-task-name')
        formName.innerHTML = '<div class="newitem-title-wrapper">' +
            '<textarea class="new-task-title-input" type="text"></textarea>' +
            '<input class="new-task-title-submit" type ="button"  value="Add">' +
            '</div>'
        const deleteFormButton = document.createElement('div')
         deleteFormButton.innerHTML = '<i class="fas fa-times"></i>'
        this._inputTaskName = formName.querySelector(".new-task-title-input");
        formName.appendChild(this._inputTaskName); 
        formName.appendChild(formName.querySelector(".new-task-title-submit"))
        formName.appendChild(deleteFormButton)
        deleteFormButton.addEventListener('click', function () {
            this.parentElement.remove()
        })
        return formName
    }

    addNewTask() {
        if (document.getElementById('add-task-input')) return
        const formName = this.createInputNameTask();
        this._category.appendChild(formName);
        //formName.children[0].focus();
        formName.children[2].addEventListener('click', this._createNewTask.bind(this));
    }

    _createNewTask(e) {
        e.preventDefault();
        const input = this._inputTaskName;
        const task = new Task({
            _taskName: input.value
        })
        this._tasksList.push(task);
        this._category.appendChild(task.render());
        input.parentElement.remove();

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
}

export default Category;