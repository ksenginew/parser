export interface Options {
    tracking: boolean
}

export interface State {
    buffer: string,
    index: number,
    tree: TreeItem[]
    // [key:string]:any
}

export interface TreeItem {
    index: number,
    nodes?: TreeItem[]
}

export interface Node {
    name: string
    nodes?: number[]
    tag?: string
    location?: { start: number, end: number }
    [key: string]: any
}

export interface Token extends Node {
    image: string
    list: string[]
    index?: number
    groups?: Record<string, string>
    hidden?: boolean
    tag?: string
}

export interface Rules {
    [key: string]: ($: Rules) => boolean
}