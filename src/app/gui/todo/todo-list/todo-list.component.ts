import { Component, OnInit } from '@angular/core';
import { Tasks} from "../../../models/todo/todo-interface";
import { TodoService} from "../../../services/todo/todo.service";
import { MatTableDataSource } from '@angular/material/table';
@Component({
  selector: 'app-todo-list',
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.sass'],
})
export class TodoListComponent implements OnInit {
  taskId: number;
  taskTitle: string;
  editing: boolean = false;
  tasks:Tasks[] = [];
  selectedItems: Tasks[] = [];
  beforeEditing: string;
  beforeComp: boolean = false;
  today: number = Date.now();
  dataSource: MatTableDataSource<any> = new MatTableDataSource;

  displayedColumns = ['completed', 'title', 'editing', 'delete'];

  constructor(private todoService: TodoService){
    this.beforeEditing = '';
    this.taskId = 0;
    this.taskTitle = '';
  }
  ngOnInit(){
    this.beforeEditing = '';
    this.taskId = 0;
    this.taskTitle = '';

    this.todoService
      .getTodo()
      .subscribe(data => {
        this.tasks = data; 
        this.dataSource = new MatTableDataSource(this.tasks);
        this.selectedItems = this.tasks.filter(item => item.completed);
      });
    
  }

  addTask(){
    if(this.taskTitle.trim().length === 0)return;

    this.todoService.addTask({id:this.taskId,
      title: this.taskTitle,
      completed: false,
      editing: false})
      .subscribe((data: Tasks) => {
        console.log(data);
        this.tasks.push({
          id:data.id,
          title: data.title,
          completed: data.completed,
          editing: data.editing
        })
        this.dataSource = new MatTableDataSource(this.tasks);
        this.ngOnInit();
      });
    
    this.taskTitle ='';
  }

  toggleEdit(event: Tasks){
    debugger
    event.editing = !event.editing;
  }

  editTask(event: Tasks){
    debugger
    this.beforeEditing = event.title;
    event.editing = !event.editing;
    this.todoService.editTodo(event)
      .subscribe(data => this.tasks = this.tasks.map((task: Tasks )=>{
        if (task.title === event.title){
          task = Object.assign({}, task, event);
        }
        return task;
      }));
  }

  completedTask(event: Tasks){
    const newTask = {
      id:event.id,
      completed: !event.completed,
      title: event.title,
      editing: event.editing
    }
    this.todoService.editTodo(newTask)
      .subscribe(data => this.tasks = this.tasks.map((task: Tasks )=>{
        console.log(task)
        console.log(newTask)
        if (task.id === newTask.id){
          task = Object.assign({}, task, newTask);
        }
        return task;
      }));
    console.log(this.tasks)
  }


  doneEditing(task: Tasks):void{
    if(task.title.trim().length === 0){
      task.title = this.beforeEditing;
    }
    task.editing = false;
  }

  cancelEditing(task: Tasks){
    task.title = this.beforeEditing;
    task.editing = false;
  }

  remaining(): number{
    return this.tasks.filter(task => !task.completed).length;
  }

  atleastOneCompleted(): boolean{
    return this.tasks.filter(task => task.completed).length > 0;
  }

  deleteTask(taskId: number){
    this.tasks = this.tasks.filter(task => task.id !== taskId);

    this.todoService.deleteTask(taskId)
      .subscribe(data => this.tasks.filter(task => {
        return task !== data;
      }))
    
    this.dataSource = new MatTableDataSource(this.tasks);
  }

  deleteCompletedTask(){
    console.log(this.tasks)
    this.selectedItems = this.tasks.filter(item => item.completed == true);
    console.log (this.selectedItems);

    this.selectedItems.forEach(value => {
      this.todoService.deleteTask(value.id)
        .subscribe(res => {
          this.tasks = this.tasks.filter(task => !task.completed);
          this.dataSource = new MatTableDataSource(this.tasks);
        });
    });
  }
}
