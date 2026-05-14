import { exec } from 'child_process'

export async function terminal(command: string) {
  return new Promise((resolve, reject) => {
    exec(command, { cwd: process.cwd() }, (error, stdout, stderr) => {
      if (error) return reject(stderr || error)
      resolve({ stdout, stderr })
    })
  })
}
