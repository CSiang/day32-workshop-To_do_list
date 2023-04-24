import { Component, OnInit } from '@angular/core';
import { ValidatorFn, AbstractControl, FormArray, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Task, Todo } from 'src/app/Models';

// new validator
const nonWhiteSpace = (control: AbstractControl) => {
  if (control.value.trim().length > 0){
    return null} else {
      return {nonWhiteSpace: true} as ValidationErrors
    }
}

const futureDate = (control: AbstractControl) => {
  if(new Date(control.value ) > new Date()){
    return null
  } else {
    return {futureDate: true} as ValidationErrors
  }
}

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css']
})
export class FormComponent implements OnInit {

  // form & array can't be private. HTML can't access to private attributes.
  array !: FormArray
  
  form!: FormGroup 

  localStorageList: string[] = []

  private fb !: FormBuilder

  constructor(fb: FormBuilder){
    this.fb = fb
  }

  ngOnInit(): void {
    this.form = this.generateForm()
    this.getLocalStorageList()
  }

  delLocalStorage(){
    localStorage.clear()
    this.localStorageList = []
  }

  loadLocalStorage(keyName: string){
    console.info("receive item: ", keyName)
    console.info(localStorage.getItem(keyName))
    // @ts-ignore
    const loadedTodo:Todo = JSON.parse(localStorage.getItem(keyName))
    console.info("loadedTodo: ",loadedTodo)

    this.loadForm(loadedTodo)
  }

  delSelectedLocalStorage(keyName: string){
    localStorage.removeItem(keyName)
    let idx = this.localStorageList.indexOf(keyName)
    this.localStorageList.splice(idx,1)
  }

  getLocalStorageList() {
    this.localStorageList = []
    for(let i=0; i<localStorage.length; i++){
      if(localStorage.length>0){
        // @ts-ignore
        this.localStorageList.push(localStorage.key(i))
      }
    }
  }

  generateForm(){
    this.array = this.fb.array([])
    return this.fb.group({
      name: this.fb.control<string>('',[Validators.required, Validators.minLength(2), nonWhiteSpace]),
      project: this.fb.control<string>('', [Validators.required, Validators.minLength(3)]),
      tasks: this.array
    })
  }

  submitTodo(){
    console.info("Submitted todo: ",this.form.value)
    // Long codes below successfully convert the this.form into Todo object.
    // const taskValues: any[] = this.form.value.tasks
    // const taskList: Task[] = []
    // for (let i=0; i< taskValues.length; i++){
    //   taskList.push({
    //     taskName: taskValues[i]['taskName'],
    //     priority: taskValues[i]['priority'],
    //     dueDate: taskValues[i]['dueDate']
    //   })
    // }
    // const todo: Todo = {
    //   name: this.form.value.name ,
    //   tasks: taskList
    // }
    const todo: Todo = this.form.value
    console.info(">> Object todo: ", todo)

    localStorage.setItem(`${todo.name}-${todo.project}`, JSON.stringify(todo))

    this.form = this.generateForm()
    this.getLocalStorageList()
  }

  addTask(){
    const task = this.fb.group({
      taskName: this.fb.control<string>('',[Validators.required, Validators.minLength(5)]),
      priority: this.fb.control<string>('1',[Validators.required]),
      dueDate: this.fb.control<string>('',[Validators.required, futureDate])
    })
    this.array.push(task)
  }

  delTask(idx: number){
    this.array.removeAt(idx)
  }

  invalid():boolean{
    return this.form.invalid || this.array.length == 0
  }

  loadForm(todo: Todo){
    this.array = this.fb.array([])
    for(let i=0; i<todo.tasks.length; i++){

      const task = this.fb.group({
          // @ts-ignore
          taskName: this.fb.control<string>(todo.tasks.at(i).taskName,[Validators.required, Validators.minLength(5)]),
          // @ts-ignore
          priority: this.fb.control<string>(todo.tasks.at(i).priority,[Validators.required]),
          // @ts-ignore
          dueDate: this.fb.control<string>(todo.tasks.at(i).dueDate,[Validators.required, futureDate])
        })
      this.array.push(task)
    }  

    // Remember to assign this form to the this.fb, if else, the data won't be loaded into the form.
    this.form =  this.fb.group({
      name: this.fb.control<string>(todo? todo.name:'',[Validators.required, Validators.minLength(2), nonWhiteSpace]),
      project: this.fb.control<string>(todo? todo.project:'', [Validators.required, Validators.minLength(3)]),
      tasks: this.array
    })
  }

}
