import Category from './Category'

class MainView {
    constructor(user) {
        if (!user) {
            this.categoryLists = [];
            this.archivedLists = [];
        } else {
            // tutaj tworzenie kategorii na podstawie danych z serwera
        }
        this.container = document.createElement("div");
        this.container.classList.add("main-view");

        this.categoryButton = this._addButtonNewCategory();
        this.container.appendChild(this.categoryButton);
        this.categoryButton.addEventListener('click', this.showInputName.bind(this));

        // this.burger = new MyBurger();

        // this.searhBar = new searchBar()

    }
    render() {
        return this.container;
    }

    _addButtonNewCategory() {
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
        const deleteFormButton = document.createElement('div')
        deleteFormButton.innerHTML = '<i class="fas fa-times"></i>'
        formName.appendChild(inputName)
        formName.appendChild(inputButton)
        formName.appendChild(deleteFormButton)
        deleteFormButton.addEventListener('click', function() {
            if (this.parentElement.parentElement === document.querySelector('.category-header')) {
                this.parentElement.parentElement.firstElementChild.hidden = false;
            }
            this.parentElement.remove()
        })
        return formName
    }

    showInputName() {
        if (document.getElementById('add-category-input')) return
        const formName = MainView.createInputName();
        main.appendChild(formName);
        formName.children[1].addEventListener('click', this.createNewCategory.bind(this));
    }

    createNewCategory(e) {
        e.preventDefault();
        const category = new Category(this);
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