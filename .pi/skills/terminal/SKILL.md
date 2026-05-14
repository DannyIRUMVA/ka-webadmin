# Terminal Skill for pi Coding Agent

## Purpose
Allows the pi agent to execute terminal/bash commands from within any project directory, capturing stdout/stderr output for agent workflows.

## Usage
- Use this skill to run bash/terminal commands and return their output/errors.

## Example
```ts
const result = await pi.terminal('ls -la')
console.log(result.stdout)
```

## Registration
- Save this skill to `.pi/skills/terminal/`
- Register as an agent tool via pi extension config

## Safety
- Confirms before running destructive or dangerous shell operations.
- Output redacted for secrets and sensitive information.

## Implementation
See `index.ts` in this directory for logic.
