import Category from './Category'
import Burger from './Burger';

class MainView {
    constructor(user) {
        this._categoriesList = [];
        this._archivedCategoriesList = [];


        this._container = document.createElement("div");
        this._container.setAttribute('id','testID')

        //burger
        this._burger = new Burger();
        document.body.appendChild(this._burger.render());
        this._burger.fillPusher(); //pakuje cały content do pushera
        //this._burger.updateBurger();
        //

        this._container.innerHTML = `
            <div id="main-view-bar" class="main-view-bar"></div>
            <div id="main-view-wrapper" class="main-view-wrapper"></div>
        `;

        this._listWrapper = this._container.querySelector("#main-view-wrapper");
        this._topBar = this._container.querySelector("#main-view-bar");

        this._topBar.style.backgroundColor = "#55f";

        //burger
        this._topBar.appendChild(this._burger.menuBurgerButton);
        //

        this._categoryButton = this._addButtonNewCategory();
        this._listWrapper.appendChild(this._categoryButton);
        this._categoryButton.addEventListener('click', this._showInputName.bind(this));

        this._isArchivedShown = false;

        // buttony do testowania kodu

        this.activedButton = this._addButtonNewCategory();
        this._listWrapper.appendChild(this.activedButton);
        this.activedButton.innerText = "Aktywne";
        this.activedButton.classList.add("login-button");
        this.activedButton.addEventListener('click', () =>
        {
            this._showActiveCategories();
        });
        
        this.archivedButton = this._addButtonNewCategory();
        this._listWrapper.appendChild(this.archivedButton);
        this.archivedButton.classList.add("login-button");
        this.archivedButton.innerText = "Zarchiwizowane";
        this.archivedButton.addEventListener('click', () =>
        {
            this._showArchivedCategories();
        });

        // this.helpfulButtonIII = this._addButtonNewCategory();
        // this._container.appendChild(this.helpfulButtonIII);
        // this.helpfulButtonIII.innerText = "👺";
        // this.helpfulButtonIII.addEventListener('click', () => {
        //     this.restoreCategory(this._archivedCategoriesList[0]);
        // });


        // this.burger = new MyBurger();

        // this.searhBar = new searchBar()

        if (!user) {
            alert("User should be provided!");
        } 
        else 
        {
            const categories = user.categories;
            delete user.categories;
            for (let i in user) {
                this[i] = user[i];
            }
            categories.forEach(this._createCategoryFromServer.bind(this));
        }

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
        const formName = document.createElement('form');
        formName.classList.add('form-category-name');
        const inputName = document.createElement('input');
        inputName.placeholder = "Wpisz nazwę kategorii.";
        inputName.classList.add('input-category-name');
        inputName.id = 'add-category-input';
        const inputButton = document.createElement('button');
        inputButton.classList.add('button-category-name');
        inputButton.innerText = 'Dodaj';
        const deleteFormButton = document.createElement('div');
        deleteFormButton.innerHTML = '<i class="fas fa-times"></i>';
        formName.appendChild(inputName);
        formName.appendChild(inputButton);
        formName.appendChild(deleteFormButton);
        deleteFormButton.addEventListener('click', function() 
        {
            if (this.parentElement.parentElement === document.querySelector('.category-header')) 
            {
                this.parentElement.parentElement.firstElementChild.hidden = false;
            }
            this.parentElement.remove();
        })
        return formName;
    }

    

    _showInputName() {
        if (document.getElementById('add-category-input')) return;
        const formName = MainView.createInputName();
        this._container.appendChild(formName);
        formName.children[0].focus();
        formName.children[1].addEventListener('click', this._createNewCategory.bind(this));
        formName.children[0].focus();

    }

    _createNewCategory(e) {
        e.preventDefault();
        const input = document.querySelector('#add-category-input');
        const category = new Category({
            parent: this,
            index: this._categoriesList.length,
            name: input.value,
            _tasksList: [],
            _creationDate: new Date().getTime()
        })
        this._categoriesList.push(category);
        this._listWrapper.appendChild(category.render());
        input.parentElement.remove();
    }

    _createCategoryFromServer(catFromServer, index)
    {
        const category = new Category({
            parent: this,
            id: catFromServer.id,
            index,
            name: catFromServer.name,
            _tasksList: catFromServer.tasks,
            prev: catFromServer.prev,
            next: catFromServer.next
            // _creationDate: ,
        })
        this._categoriesList.push(category);
        this._listWrapper.appendChild(category.render());
    }


    _showArchivedCategories()
    {
        if (this._isArchivedShown) return;
        this._isArchivedShown = true;
        this._categoryButton.hidden = true;
        this._showList(this._archivedCategoriesList);
    }
    
    _showActiveCategories()
    {
        if (!this._isArchivedShown) return;
        this._isArchivedShown = false;
        this._categoryButton.hidden = false;
        this._showList(this._categoriesList);
    }

    _showList(list)
    {

        [...this._listWrapper.getElementsByClassName("category")].forEach(category => category.remove());
        list.forEach(category => this._listWrapper.appendChild(category.render()));
    }


    archiveCategory(category)
    {
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