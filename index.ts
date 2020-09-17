import { mkdir as makeDir, readFile, writeFile } from "fs/promises"
import { homedir } from "os"
import { resolve as resolvePath } from "path"

const homeDir = homedir()
const configDir = resolvePath(homeDir, ".config/to-do-manager")
const dataFile = resolvePath(configDir, "data.json");

type Task = {
	name: string
	description: string
	dependencies: string[]
	tags: string[]
	done: boolean
	wip: boolean
}

export class Server {
	constructor(public tasks: Record<string, Task>) {}

	add(name: string) {
		this.tasks[Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)] = {
			name,
			description: "",
			dependencies: [],
			tags: [],
			done: false,
			wip: false
		}
	}

	search(name: string) {
		return Object.values(this.tasks)
			// TODO recursively check if all dependencies are done and show, otherwise hide
			.filter(task => !task.done && !task.dependencies.length && task.name.includes(name))
			.sort((a, b) => Number(b.wip) - Number(a.wip))
	}

	get(name: string, skip = 0) {
		for (const [ id, task ] of Object.entries(this.tasks))
			if (task.name == name && !skip--)
				return { id, task }

		return null
	}

	delete(name: string) {
		const id = this.get(name)?.id

		if (id)
			return delete this.tasks[id]

		return false
	}

	modify<T extends keyof Task>(key: T, value: Task[T]) {
		const task = this.get(name)?.task

		if (task) {
			task[key] = value
			return true
		}

		return false
	}

	addDependency(name: string, dependencyName: string) {
		const task = this.get(name)?.task

		if (task) {
			const dependencyId = this.get(dependencyName)?.id

			if (dependencyId) {
				task.dependencies.push(dependencyId)
				return true
			}
		}

		return false
	}
}

export async function addTask(name: string) {
	const tasks = await getData()

	tasks[Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)] = {
		name,
		description: "",
		dependencies: [],
		tags: [],
		done: false,
		wip: false
	}

	await makeDir(configDir, { recursive: true })
	await writeFile(dataFile, JSON.stringify(tasks))
}

export async function getTasks(name: string) {
	return Object.values(await getData())
		// TODO recursively check if all dependencies are done and show, otherwise hide
		.filter(task => !task.done && !task.dependencies.length && task.name.includes(name))
		.sort((a, b) => Number(b.wip) - Number(a.wip))
}

export function changeDescription(name: string, description: string) {
	return modifyTask(name, task => task.description = description)
}

export async function deleteTask(name: string) {
	const tasks = await getData()

	for (const [ id, task ] of Object.entries(tasks))
		if (task.name == name) {
			delete tasks[id]
			break
		}

	await makeDir(configDir, { recursive: true })
	await writeFile(dataFile, JSON.stringify(tasks))
}

export function done(name: string) {
	return modifyTask(name, task => task.done = !task.done)
}

export function wip(name: string) {
	return modifyTask(name, task => task.wip = !task.wip)
}

export async function dependency(name: string, dependencyName: string) {
	const tasks = await getData()

	for (const task of Object.values(tasks))
		if (task.name == name) {
			for (const [ id, dependencyTask ] of Object.entries(tasks))
				if (dependencyTask.name == dependencyName) {
					task.dependencies.push(id)
					break
				}
			break
		}

	await makeDir(configDir, { recursive: true })
	await writeFile(dataFile, JSON.stringify(tasks))
}

export function changeName(name: string, newName: string) {
	return modifyTask(name, task => task.name = newName)
}

async function modifyTask(name: string, callback: (task: Task) => void) {
	const tasks = await getData()

	for (const task of Object.values(tasks))
		if (task.name == name) {
			callback(task)
			break
		}

	await makeDir(configDir, { recursive: true })
	await writeFile(dataFile, JSON.stringify(tasks))
}

function getData() {
	return readFile(dataFile, { encoding: "utf-8" }).then(jsonString => {
		return JSON.parse(jsonString) as Record<string, Task>
	}, error => {
		if (error?.code == "ENOENT")
			return {} as Record<string, Task>

		throw error
	})
}

// .catch(reason => console.log("Uncaught Error:", reason))
