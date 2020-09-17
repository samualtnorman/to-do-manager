import { addTask, getTasks, changeDescription, deleteTask, done, wip, dependency, changeName } from ".."

type ArgValue = boolean | number | string/* | ArgValue[]*/

const options = new Map<string, ArgValue>()
const commands: string[] = []

for (let arg of process.argv.slice(2)) {
	if (arg[0] == "-") {
		let [ key, valueRaw ] = arg.split("=")
		let value: ArgValue

		if (valueRaw)
			if (valueRaw == "true")
				value = true
			else if (valueRaw == "false")
				value = false
			else {
				let number = Number(valueRaw)

				if (isFinite(number))
					value = number
				else
					value = valueRaw
			}
		else
			value = true

		if (arg[1] == "-")
			options.set(key.slice(2), value)
		else
			for (let option of key.slice(1))
				options.set(option, value)
	} else
		commands.push(arg)
}

switch (commands[0]) {
	case "add":
		if (commands[1])
			addTask(commands[1])
				.then(() => console.log(`Added task ${commands[1]}`))
		break
	case "get":
		getTasks(commands[1] || "").then(tasks => {
			console.log(tasks.map(task => {
				if (task.description)
					return `${task.name}\n  ${task.description}`

				return task.name
			}).join("\n\n"))
			// for (const task of tasks) {
			// 	console.log(task.name)

			// 	if (task.description)
			// 		console.log(task.description)

			// 	console.log("")
			// }
		})
		break
	case "description":
		changeDescription(commands[1], commands[2])
		break
	case "delete":
		deleteTask(commands[1])
		break
	case "done":
		done(commands[1])
		break
	case "wip":
		wip(commands[1])
		break
	case "dependency":
		dependency(commands[1], commands[2])
		break
	case "name":
		changeName(commands[1], commands[2])
		break
}
