import Category from './Category'

class MainView {
    constructor(user) {
        if (!user) {
            this._categoriesList = [];
            this._archivedCategoriesList = [];
        } else {
            // tutaj tworzenie kategorii na podstawie danych z serwera
        }
        this._container = document.createElement("div");
        this._container.classList.add("main-view");

        this._categoryButton = this._addButtonNewCategory();
        this._container.appendChild(this._categoryButton);
        this._categoryButton.addEventListener('click', this._showInputName.bind(this));

        // buttony do testowania kodu

        this.helpfulButtonI = this._addButtonNewCategory();
        this._container.appendChild(this.helpfulButtonI);
        this.helpfulButtonI.innerText = "💩";
        this.helpfulButtonI.addEventListener('click', () => {
            this._showList(this._archivedCategoriesList);
        });

        this.helpfulButtonII = this._addButtonNewCategory();
        this._container.appendChild(this.helpfulButtonII);
        this.helpfulButtonII.innerText = "🔥";
        this.helpfulButtonII.addEventListener('click', () => {
            this._showList(this._categoriesList);
        });

        // this.helpfulButtonIII = this._addButtonNewCategory();
        // this._container.appendChild(this.helpfulButtonIII);
        // this.helpfulButtonIII.innerText = "👺";
        // this.helpfulButtonIII.addEventListener('click', () => {
        //     this.restoreCategory(this._archivedCategoriesList[0]);
        // });


        // this.burger = new MyBurger();

        // this.searhBar = new searchBar()

    }
    render() {
        return this._container;
    }

    get categoriesList() {
        return this._categoriesList;
    }
    get archivedCategoriesList() {
        return this._archivedCategoriesList;
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

    _showInputName() {
        if (document.getElementById('add-category-input')) return
        const formName = MainView.createInputName();
        this._container.appendChild(formName);
        formName.children[1].addEventListener('click', this._createNewCategory.bind(this));
    }

    _createNewCategory(e) {
        e.preventDefault();
        const input = document.querySelector('#add-category-input');
        const category = new Category({
            parent: this,
            index: this._categoriesList.length,
            _categoryName: input.value,
            _tasksList: [],
            _creationDate: new Date().getTime()
        })
        this._categoriesList.push(category);
        this._container.appendChild(category.render());
        input.parentElement.remove();
    }

    _showList(list) {

        [...this._container.getElementsByClassName("category")].forEach(category => category.remove());
        list.forEach(category => this._container.appendChild(category.render()));
    }

    archiveCategory(category) {
        this._archivedCategoriesList.push(...this._categoriesList.splice(category.index, 1));
        category.archive();
        category.index = this._archivedCategoriesList.length - 1;
        this._categoriesList.forEach((category, index) => category.index = index);
    }

    restoreCategory(category) {
        this._categoriesList.push(...this._archivedCategoriesList.splice(category.index, 1));
        category.restore();
        category.index = this._categoriesList.length - 1;
        this._archivedCategoriesList.forEach((category, index) => category.index = index);
    }

    deleteCategory(category) {
        this._archivedCategoriesList.splice(category.index, 1);
        category.render().remove();
        this._archivedCategoriesList.forEach((category, index) => category.index = index);
    }

}

export default MainView;