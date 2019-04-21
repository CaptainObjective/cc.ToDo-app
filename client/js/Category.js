import {
    main
} from './main'

import Task from './Task'
import MainView from './MainView';

class Category {
    constructor(obiekt) {
        obiekt = JSON.parse(JSON.stringify(obiekt));
        for (let i in obiekt) {
            this[i] = obiekt[i]
        }
        this._category = document.createElement('div')
        this._category.classList.add('category')
        this._categoryHeader = document.createElement('div')
        this._categoryHeader.classList.add('category-header')
        this._categoryHeaderTitle = document.createElement('h4')
        this._categoryHeaderTitle.classList.add('category-header-title')
        this._categoryHeaderTitle.innerText = this.categoryName;
        this._categoryDeleteButton = document.createElement('div')
        this._categoryDeleteButton.classList.add('category-header-delete')
        this._categoryDeleteButton.innerHTML = `<i class="fas fa-times"></i>`
        this._categoryCopyButton = document.createElement('div')
        this._categoryCopyButton.classList.add('category-header-copy-category')
        this._categoryCopyButton.innerHTML = `<i class="far fa-copy"></i>`
        this._categoryBody = document.createElement('div')
        this._categoryBody.className = 'category-body'
        this._addNewTaskButton = document.createElement('button')
        this._addNewTaskButton.className = "category-body-add-task";
        this._addNewTaskButton.innerText = '+'
        this._category.appendChild(this._categoryHeader)
        this._category.appendChild(this._categoryBody)
        this._categoryHeader.appendChild(this._categoryHeaderTitle)
        this._categoryHeader.appendChild(this._categoryDeleteButton)
        this._categoryHeader.appendChild(this._categoryCopyButton)
        this._categoryBody.appendChild(this._addNewTaskButton)
        this._categoryHeaderTitle.addEventListener('click', this.showChangeNameInput.bind(this));
        this._categoryDeleteButton.addEventListener('click', this.showDeletePopup.bind(this))
        this._categoryCopyButton.addEventListener('click', this.copyCategory.bind(this))
        this._addNewTaskButton.addEventListener('click', this.addNewTask.bind(this))
    }

    render() {
        return this._category
    }

    showChangeNameInput() {
        const that = this
        this._categoryHeaderTitle.hidden = true;
        const formName = MainView.createInputName()
        formName.children[1].innerText = 'Zmień'
        this._categoryHeader.appendChild(formName)
        formName.firstElementChild.value = this._categoryName
        formName.children[1].addEventListener('click', that.changeCategoryName.bind(this))
    }

    changeCategoryName(e) {
        e.preventDefault()
        const form = this._categoryHeader.lastElementChild
        this._categoryName = form.firstElementChild.value
        this._categoryHeaderTitle.innerText = this._categoryName
        this._categoryHeaderTitle.hidden = false;
        form.remove()
    }

    showDeletePopup() {
        const popup = document.createElement('div')
        popup.className = 'delete-popup'
        popup.innerHTML = `Czy na pewno chcesz zarchiwizować kategorię <span class="delete-popup-category-name">${this._categoryName}?</span> <button class="delete-yes">Tak</button> <button class="detele-no">Nie</button>`
        main.appendChild(popup)
        popup.children[1].addEventListener('click', () => {
            this._parent.archivedLists.push(this._parent.categoryLists.splice(this._index, 1))
            this._category.remove()
            popup.remove()
        })
        popup.lastElementChild.addEventListener('click', () => {
            popup.remove()
        })
    }

    addNewTask() {
        const task = new Task()
        this._tasksList.push(task)
        console.log(this._tasksList)
        console.log(`Powstał task numer ${this._tasksList.length}`)
    }

    copyCategory() {
        console.log('Kopiuje taski')
    }
}

export default Category;