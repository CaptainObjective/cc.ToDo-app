import {
    main
} from './main'

const categoryList = []

class Category {
    constructor() {
        this._categoryName = ''
        this._index = 0
        this._tasksList = [];
        this._createDate = '';
        this._thisButton = '';
        this._category = document.createElement('div')
        this._category.classList.add('category')
        this._categoryHeader = document.createElement('div')
        this._categoryHeader.classList.add('category-header')
        this._categoryHeaderTitle = document.createElement('h4')
        this._categoryHeaderTitle.classList.add('category-header-title')
        this._categoryDeleteButton = document.createElement('div')
        this._categoryDeleteButton.classList.add('category-header-delete')
        this._categoryDeleteButton.innerHTML = `<i class="fas fa-times"></i>`
        this._categoryBody = document.createElement('div')
        this._categoryBody.className = 'category-body'
        this._category.appendChild(this._categoryHeader)
        this._category.appendChild(this._categoryBody)
        this._categoryHeader.appendChild(this._categoryHeaderTitle)
        this._categoryHeader.appendChild(this._categoryDeleteButton)
        this._categoryDeleteButton.addEventListener('click', this.showDeletePopup.bind(this))
    }
    static addButtonNewCategory() {
        const categoryButton = document.createElement('button')
        categoryButton.classList.add('category-button')
        categoryButton.innerText = '+'
        return categoryButton;
    }

    static createInputName() {
        const formName = document.createElement('form')
        formName.classList.add('form-category-name')
        const inputName = document.createElement('input')
        inputName.placeholder = "Wpisz nazwę kategorii."
        inputName.classList.add('input-category-name')
        const inputButton = document.createElement('button')
        inputButton.classList.add('button-category-name')
        inputButton.innerText = 'Dodaj'
        formName.appendChild(inputName)
        formName.appendChild(inputButton)
        return formName
    }

    static showInputName() {
        const formName = Category.createInputName()
        main.appendChild(formName);
        formName.children[1].addEventListener('click', Category.createNewCategory)
    }

    static createNewCategory(e) {
        e.preventDefault()
        const category = new Category();
        categoryList.push(category)
        category._index = categoryList.length - 1
        category._thisButton = this;
        main.appendChild(category.render())
        this.parentElement.remove()
        category._createDate = new Date().getTime()
    }

    render() {
        //Ta metoda zwraca html który ma się dodać do strony
        const input = this._thisButton.parentElement.firstElementChild
        this._categoryName = input.value
        this._categoryHeaderTitle.innerText = this._categoryName
        this._categoryHeaderTitle.addEventListener('click', this.showChangeNameInput.bind(this))
        return this._category
    }

    showChangeNameInput() {
        const that = this
        this._categoryHeaderTitle.textContent = ''
        const formName = Category.createInputName()
        formName.lastElementChild.innerText = 'Zmień'
        this._categoryHeader.appendChild(formName)
        formName.firstElementChild.value = this._categoryName
        formName.children[1].addEventListener('click', that.changeCategoryName.bind(this))
    }

    changeCategoryName(e) {
        e.preventDefault()
        const form = this._categoryHeader.lastElementChild
        this._categoryName = form.firstElementChild.value
        this._categoryHeaderTitle.innerText = this._categoryName
        form.remove()
    }

    showDeletePopup() {
        const popup = document.createElement('div')
        popup.className = 'delete-popup'
        popup.innerHTML = `Czy na pewno chcesz zarchiwizować kategorię <span class="delete-popup-category-name">${this._categoryName}?</span> <button class="delete-yes">Tak</button> <button class="detele-no">Nie</button>`
        main.appendChild(popup)
        popup.children[1].addEventListener('click', () => {
            categoryList.splice(this._index, 1)
            this._category.remove()
            popup.remove()
        })
        popup.lastElementChild.addEventListener('click', () => {
            popup.remove()
        })
    }
}

export default Category;