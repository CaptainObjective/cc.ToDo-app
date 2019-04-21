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

        // buttony do wywoływania funkcji

        this.helpfulButtonII = this._addButtonNewCategory();
        this.container.appendChild(this.helpfulButtonII);
        this.helpfulButtonII.innerText = "💩";
        this.helpfulButtonII.addEventListener('click', () =>
        {
            this._showLists(this.archivedLists);
        });

        this.helpfulButtonII = this._addButtonNewCategory();
        this.container.appendChild(this.helpfulButtonII);
        this.helpfulButtonII.innerText = "🔥";
        this.helpfulButtonII.addEventListener('click', () =>
        {
            this._showLists(this.categoryLists);
        });



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
        this.container.appendChild(formName);
        formName.children[1].addEventListener('click', this.createNewCategory.bind(this));
    }

    createNewCategory(e) {
        e.preventDefault();
        const input = document.querySelector('#add-category-input');
        const category = new Category({
            parent: this,
            _index: this.categoryLists.length,
            _categoryName: input.value,
            _tasksList: [],
            _creationDate: new Date().getTime()
        })
        this.categoryLists.push(category);
        this.container.appendChild(category.render());
        input.parentElement.remove();
    }

    _showLists(lists)
    {
        console.log(this);
        console.log(lists);
        [...this.container.getElementsByClassName("category")].forEach( category => category.remove());
        lists.forEach(list => this.container.appendChild(list.render()));
    }
}

export default MainView;