# Iteration Manager (Jalali)

Jalali-enabled hub for Azure DevOps to list, select, add, and edit team iterations. Includes dialogs for start/finish dates and keeps the selected iteration per team.

## Capabilities
- Hub contribution: `ms.vss-web.hub` (see `azure-devops-extension*.json`)
- View iterations (name, path, timeframe, dates)
- Edit iteration dates with Jalali picker
- Add new iterations and attach to team
- Persist selected iteration per team in local storage

## Usage
1. Install the extension and open the hub inside a project/team.
2. Select or edit existing iterations; add new ones as needed.
3. Dates are stored in Azure DevOps; the selected iteration is stored locally per team.

## How to use
1. Open the **Iteration Manager (Jalali)** hub inside your project.
2. See the list of iterations with name, path, timeframe, and Jalali dates.
3. Select an iteration to set it for your team.
4. Edit dates with the Jalali date picker, or add a new iteration and attach it to the team.
5. Your selection is remembered per team; dates are saved in Azure DevOps.
