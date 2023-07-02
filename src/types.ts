import { Parser } from "./parser";

export interface Options {
  tracking: boolean;
}

export interface State {
  buffer: string;
  index: number;
  nodes: Node[];
  tree: number[];
  id: number;
  // [key:string]:any
}

export interface Node {
  name: string;
  nodes?: number[];
  tag?: string;
  location?: { start: number; end: number };
  [key: string]: any;
}

export interface Token extends Node {
  image: string;
  list: string[];
  index?: number;
  groups?: Record<string, string>;
  hidden?: boolean;
  tag?: string;
}

export interface Rules {
  [key: string]: (
    $: Parser & Record<string, () => boolean | undefined>
  ) => boolean | undefined;
}
