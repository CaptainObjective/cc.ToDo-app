import Category from './Category'
import Burger from './Burger';
import Sortable from 'sortablejs'

class MainView {
    constructor({
        user,
        token
    }) {
        this._categoriesList = [];
        this._archivedCategoriesList = [];
        this._token = token || sessionStorage.getItem("x-token");

        this._container = document.createElement("div");
        this._container.setAttribute('id', 'testID')

        //burger
        this._burger = new Burger();
        document.body.appendChild(this._burger.render());
        this._burger.fillPusher(); //pakuje cały content do pushera
        this._burger.updateBurger();
        //

        this._container.innerHTML = `<div id="main-view-bar" class="main-view-bar"></div> <div class= "buttons-wrapper"></div>
            <div id="main-view-wrapper" class="main-view-wrapper">
            </div>`;

        this._buttonsWrapper = this._container.querySelector('.buttons-wrapper');
        this._listWrapper = this._container.querySelector("#main-view-wrapper");
        this._topBar = this._container.querySelector("#main-view-bar");

        this._topBar.style.backgroundColor = "#55f";

        //burger
        this._topBar.appendChild(this._burger.menuBurgerButton);
        //

        this._categoryButton = this._addButtonNewCategory();
        this._buttonsWrapper.appendChild(this._categoryButton);
        this._categoryButton.addEventListener('click', this._showInputName.bind(this));

        this._isArchivedShown = false;

        this._categoryWrapper = document.createElement('div');
        this._categoryWrapper.className = 'category-wrapper ui container">';
        this._listWrapper.appendChild(this._categoryWrapper);


        // buttony do testowania kodu

        this.activedButton = this._addButtonNewCategory();
        this._buttonsWrapper.appendChild(this.activedButton);
        this.activedButton.innerText = "Aktywne";
        this.activedButton.classList.add("login-button");
        this.activedButton.addEventListener('click', () => {
            this._showActiveCategories();
        });
        
        
        this.archivedButton = this._addButtonNewCategory();
        this._buttonsWrapper.appendChild(this.archivedButton);
        this.archivedButton.classList.add("login-button");
        this.archivedButton.innerText = "Zarchiwizowane";
        this.archivedButton.addEventListener('click', () => {
            this._showArchivedCategories();
        });

        this.activedButton = this._addButtonNewCategory();
        this._buttonsWrapper.appendChild(this.activedButton);
        this.activedButton.innerText = "Move";
        this.activedButton.classList.add("login-button");
        this.activedButton.addEventListener('click', () => {
            this._moveCategory(this._categoriesList[0], this._categoriesList.length - 1);
        });


        this._categoryWrapper = document.createElement('div');
        this._categoryWrapper.className = 'category-wrapper ui container">';
        this._listWrapper.appendChild(this._categoryWrapper);

        if (!user) {
            alert("User should be provided!");
        } else {
            const categories = user.categories.map(el => el).filter(el => !el.archived) || [];
            const archivedCategories = user.categories.map(el => el).filter(el => el.archived) || [];
            delete user.categories;
            for (let i in user) {
                this[i] = user[i];
            }

            categories.sort(MainView.sortByPrevAndId).forEach(this._createCategoryFromServer.bind(this));
            archivedCategories.sort(MainView.sortByPrevAndId).forEach(this._createArchivedCategoryFromServer.bind(this));
            this._reload();
            this._enableMoving();
        }

    }
    render() {
        return this._container;
    }

    static sortByPrevAndId(a, b)
    {
        if (a.prev === null || a.id === b.prev) return -1;
        if (b.prev === null || b.id === a.prev) return 1;
        return 0;
    }

    get categoriesList() {
        return this._categoriesList;
    }
    get archivedCategoriesList() {
        return this._archivedCategoriesList;
    }
    get token() {
        return _token;
    }

    _addButtonNewCategory() {
        const categoryButton = document.createElement('button')
        categoryButton.className = 'category-button ui button'
        categoryButton.innerHTML = '<i class="fas fa-plus"></i>'
        return categoryButton;
    }

    static createInputName() {
        const formName = document.createElement('form');
        formName.className = ' ui input focus form-category-name';
        const inputName = document.createElement('input');
        inputName.placeholder = "Wpisz nazwę kategorii.";
        inputName.className = 'input-category-name';
        inputName.id = 'add-category-input';
        const inputButton = document.createElement('button');
        inputButton.className = 'mini ui button button-category-name';
        inputButton.innerText = 'Dodaj';
        const deleteFormButton = document.createElement('div');
        deleteFormButton.innerHTML = '<i class="close icon"></i>';
        formName.appendChild(inputName);
        formName.appendChild(inputButton);
        formName.appendChild(deleteFormButton);
        deleteFormButton.addEventListener('click', function() {
            if (this.parentElement.parentElement === document.querySelector('.category-header')) {
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

    async _createNewCategory(e) {
        e.preventDefault();
        const input = document.querySelector('#add-category-input');
        const requestHeaders = {
            'Content-Type': 'application/json',
            "x-token": this._token
        };
        const requestBody = {
            name: input.value
        };
        let categoryFromServer = {};
        try {
            const response = await fetch("/categories", {
                method: "post",
                headers: requestHeaders,
                body: JSON.stringify(requestBody)
            })
            if (response.status !== 200) throw response;
            categoryFromServer = await response.json();
        } catch (error) {
            alert("Nie udało się połączyć z serwerem!");
            return;
        }

        const category = new Category({
            id: categoryFromServer.id,
            parent: this,
            index: this._categoriesList.length,
            name: input.value,
            _tasksList: [],
            _creationDate: new Date().getTime()
        })
        console.log(category.id);
        this._categoriesList.push(category);
        this._categoryWrapper.appendChild(category.render());
        input.parentElement.remove();
    }

    async _moveCategory(category, newIndex)
    {
        if (!Number.isInteger(newIndex) || category.index === newIndex || newIndex > this._categoriesList.length - 1 || newIndex < 0) return;
        try
        {
            const tempList = [...this._categoriesList];
            tempList.splice(category.index, 1);
            tempList.splice(newIndex, 0, category);
            const oldIndex = category.index;
            
            const prevList = tempList.map((el, index) => index ? tempList[index-1].id : null);
            
            const requestHeaders = {
                'Content-Type': 'application/json',
                "x-token": this._token
            };
            const requestBody = {
                prev: prevList[newIndex]
            };
            console.log(prevList[newIndex], tempList[newIndex - 1]);
            let response = await fetch(`/categories/${category.id}?order=true`,
                {
                    method: "put",
                    headers: requestHeaders,
                    body: JSON.stringify(requestBody)

                })
            if (response.status !== 200) throw response;

            this._categoriesList = tempList;
            this._categoriesList.forEach((cat, index) => cat.index = index);
            this._reload();
        }
        catch (error)
        {
            console.log(error);
        }
    }
    

    _createCategoryFromServer(catFromServer, index) {
        const category = new Category({
            parent: this,
            id: catFromServer.id,
            index,
            name: catFromServer.name,
            _tasksList: catFromServer.tasks,
            prev: catFromServer.prev,
            // _creationDate: ,
        })
        this._categoriesList.push(category);
        this._categoryWrapper.appendChild(category.render());
    }

    _createArchivedCategoryFromServer(catFromServer, index)
    {
        const category = new Category({
            parent: this,
            id: catFromServer.id,
            index,
            name: catFromServer.name,
            _tasksList: catFromServer.tasks,
            prev: catFromServer.prev,
            // _creationDate: ,
        })
        category.archive();
        this._archivedCategoriesList.push(category);
    }

    _showArchivedCategories() {
        if (this._isArchivedShown) return;
        this._isArchivedShown = true;
        this._categoryButton.hidden = true;
        this._showList(this._archivedCategoriesList);
    }

    _showActiveCategories() {
        if (!this._isArchivedShown) return;
        this._isArchivedShown = false;
        this._categoryButton.hidden = false;
        this._showList(this._categoriesList);
    }

    _reload()
    {
        if (this._isArchivedShown) this._showList(this._archivedCategoriesList);
        else this._showList(this._categoriesList);
    }

    _showList(list) {

        [...this._categoryWrapper.getElementsByClassName("category")].forEach(category => category.remove());
        list.forEach(category => this._categoryWrapper.appendChild(category.render()));
    }


    async archiveCategory(category) {
        try
        {
            const response = await fetch(`/categories/${category.id}`,
                {
                    method: "put",
                    headers:
                    {
                        'Content-Type': 'application/json',
                        "x-token": this._token
                    },
                    body: JSON.stringify( {name: category.name, archived: true})
                })
            if (response.status !== 200) throw response;

            this._archivedCategoriesList.push(...this._categoriesList.splice(category.index, 1));
            category.archive();
            category.index = this._archivedCategoriesList.length - 1;
            this._categoriesList.forEach((category, index) => category.index = index);
        }
        catch (error)
        {
            console.log(error);
        }
    }
        
    async restoreCategory(category) {
        try
        {
            const response = await fetch(`/categories/${category.id}`,
                {
                    method: "put",
                    headers:
                    {
                        'Content-Type': 'application/json',
                        "x-token": this._token
                    },
                    body: JSON.stringify( {name: category.name, archived: false})
                })
            if (response.status !== 200) throw response;

            this._categoriesList.push(...this._archivedCategoriesList.splice(category.index, 1));
            category.restore();
            category.index = this._categoriesList.length - 1;
            this._archivedCategoriesList.forEach((category, index) => category.index = index);
        }
        catch (error)
        {
            console.log(error);
        }
    }

    async deleteCategory(category) {
        try
        {
            const response = await fetch(`/categories/${category.id}`,
                {
                    method: "delete",
                    headers:
                    {
                        'Content-Type': 'application/json',
                        "x-token": this._token
                    }
                })
            if (response.status !== 200) throw response;

            this._archivedCategoriesList.splice(category.index, 1);
            category.render().remove();
            this._archivedCategoriesList.forEach((category, index) => category.index = index);
        }
        catch (error)
        {
            console.log(error);
        }
    }

    _enableMoving()
    {
        new Sortable(this._categoryWrapper,
            {
                animation: 150,
                onEnd: (evt) =>
                    {
                        console.log(evt.newIndex);
                        this._moveCategory(evt.item.parent, evt.newIndex)
                    }
            })
    }
}

export default MainView;