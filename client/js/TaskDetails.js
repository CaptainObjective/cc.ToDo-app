import MainView from './MainView';
import Task from './Task';

class TaskDetails {
    constructor(obiekt) {
        this.parent = obiekt.parent;
        console.log(this.parent);
        this.id = obiekt.id;
        this._taskDetailsContainer = document.createElement('div');
        this._taskDetailsContainer.classList.add('container-main');

        this._taskCardContainer = document.createElement('div');
        this._taskCardContainer.setAttribute('class','ui cards');

        this._taskCardContainer.innerHTML = `
        <div class="card">
            <div class="content">
                <div class="header">Szczegóły</div>
                <form id="all" class="ui form mar-top">
                    <div class="field">
                        <label style="margin-top:10px">Tytuł zadania</label>
                        <input type="text" name="first-name" placeholder="">
                    </div>
                    <h3 class="header">Poziom trudności</h3>
                    <div class="ui checkbox">
                        <input type="checkbox" style="margin-top:10px">
                        <label style="margin-top:10px">Łatwy</label>
                        <input type="checkbox" style="margin-top:10px">
                        <label style="margin-top:10px">Średni</label>
                        <input type="checkbox" style="margin-top:10px">
                        <label style="margin-top:10px">Trudny</label>
                    </div>
                </form>
            </div>
            <div class="ui two bottom attached  buttons">
                <div class="ui teal button">
                  <i class="save icon"></i>
                  Zapisz
                </div>
                <div id="cancel" class="ui button">
                <i class="cancel icon"></i>
                  Anuluj
                </div>

            </div>
        </div>
        `
        this._taskDetailsContainer.appendChild(this._taskCardContainer);
    }
    render() {
        //console.log(this._taskDetailsContainer)
        return this._taskDetailsContainer;

    }

    changeTaskDetails(e)
    {
        const changed = {};
        // tutaj proszę do obiektu wpisać wszystkei zmiany
        this.parent._changeTask(changed);
    }



    async changeTaskName(e) {
        e.preventDefault();
        const desc = this._taskDetailTitle.children[1].value;
        try
        {
            await this.parent._changeTask({ desc });
            this.parent._taskHeaderTitle.innerText = desc;
        }
        catch (error)
        {
            console.log(error);
        }
    }


    async changeTaskDescription(e) {
        e.preventDefault();
        const token = sessionStorage.getItem('x-token');
        const requestHeaders = {
            'Content-Type': 'application/json',
            "x-token": token
        }
        const requestBody = {
            desc: this._taskDescription.children[1].value,
            completed: this.parent._completed
        }
        try {
            const response = await fetch(`subtasks/${this.id}`, {
                method: "put",
                headers: requestHeaders,
                body: JSON.stringify(requestBody)
            })
            if (response.status !== 200) throw response;
        } catch (error) {
            alert("Nie udało się połączyć z serwerem!");
            return
        }
        const taskdescription = this._taskDescription.children[1].value;
        this.parent._taskDesc = taskdescription;
    }


    changeDeadline(e) {
        e.preventDefault();
        const deadline = this._taskDeadline.children[1].value;
        this.parent._changeTask({ deadline });
    }

    changeExp(e) {
        e.preventDefault();
        const checkbox1 = this._taskExpCheckBox1Area.firstElementChild.checked;
        const checkbox2 = this._taskExpCheckBox2Area.firstElementChild.checked;
        const checkbox3 = this._taskExpCheckBox3Area.firstElementChild.checked;
        let exp = 0;
        if (checkbox1) {
            exp = 1;
        } else if (checkbox2) {
            exp = 2;
        } else {
            exp = 3;
        }
        this.parent._changeTask({ exp });
    }

    checkExp() {
        const exp = this.parent._taskExp;
        console.log(exp);
        if (exp === 1) {
            this._taskExpCheckBox1Area.firstElementChild.checked = true
        };
        if (exp === 2) {
            this._taskExpCheckBox2Area.firstElementChild.checked = true
        };
        if (exp === 3) {
            this._taskExpCheckBox3Area.firstElementChild.checked = true
        };
    }

    closeWindow() {
        this._taskDetailsContainer.remove();
    }

}

export default TaskDetails;