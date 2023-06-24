export interface State {
    buffer:string,
    nodes:Node[]
    // [key:string]:any
}

export interface Node {
    name: string
    nodes?: Node[]
    tag?: string
    [key: string]: any
}

export interface Token extends Node {
    value: string
    list: string[]
    index?: number
    groups?: Record<string, string>
    hidden?: boolean
    tag?: string
}

export interface Rules {
    [key:string]: ($:Rules)=> boolean
}