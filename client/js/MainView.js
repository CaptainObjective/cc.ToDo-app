import Category from './Category'

class MainView {
    constructor() {
        this.categoryLists = []
        this.archivedLists = []
        console.log('Działa');

    }
    render() {
        //Ta metoda zwraca html który ma się dodać do strony
    }

    addButtonNewCategory() {
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
        inputName.id = 'add-category-input'
        const inputButton = document.createElement('button')
        inputButton.classList.add('button-category-name')
        inputButton.innerText = 'Dodaj'
        formName.appendChild(inputName)
        formName.appendChild(inputButton)
        return formName
    }

    showInputName() {
        const formName = MainView.createInputName();
        main.appendChild(formName);
        formName.children[1].addEventListener('click', this.createNewCategory.bind(this));
    }

    createNewCategory(e) {
        e.preventDefault();
        const category = new Category();
        this.categoryLists.push(category);
        category._index = this.categoryLists.length - 1;
        const input = document.querySelector('#add-category-input');
        category._categoryName = input.value;
        category._categoryHeaderTitle.innerText = category._categoryName;
        category._categoryHeaderTitle.addEventListener('click', category.showChangeNameInput.bind(category));
        main.appendChild(category.render());
        input.parentElement.remove();
        category._createDate = new Date().getTime();
    }

}

export default MainView;