export interface Todo{
    name: string
    project: string 
    tasks: Task[]
}

export interface Task{
    taskName: string
    priority: number
    dueDate: string
}