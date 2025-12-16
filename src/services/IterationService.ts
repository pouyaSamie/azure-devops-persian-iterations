import { getClient } from "azure-devops-extension-api";
import { CoreRestClient, TeamContext } from "azure-devops-extension-api/Core";
import { WorkRestClient, TeamSettingsIteration, TimeFrame } from "azure-devops-extension-api/Work";
import { WorkItemTrackingRestClient, TreeStructureGroup, WorkItemClassificationNode } from "azure-devops-extension-api/WorkItemTracking";

export interface NewIterationRequest {
    name: string;
    startDateIso: string;
    finishDateIso: string;
    parentPath?: string;
}

export interface UpdateIterationDatesRequest {
    startDateIso: string;
    finishDateIso: string;
}

export async function fetchTeamIterations(teamContext: TeamContext): Promise<TeamSettingsIteration[]> {
    const workClient = await getClient(WorkRestClient);
    const iterations = await workClient.getTeamIterations(teamContext);
    return iterations.sort(sortByStartDateThenName);
}

export async function createIterationAndAddToTeam(
    teamContext: TeamContext,
    request: NewIterationRequest
): Promise<TeamSettingsIteration> {
    if (!teamContext.projectId) {
        throw new Error("Project context is not available. Open this hub inside a project.");
    }

    if (!teamContext.teamId) {
        throw new Error("Team context is not available. Select a team and try again.");
    }

    const witClient = await getClient(WorkItemTrackingRestClient);
    const parentPath = request.parentPath?.trim() || undefined;
    const classificationPayload: Partial<WorkItemClassificationNode> = {
        name: request.name,
        attributes: {
            startDate: request.startDateIso,
            finishDate: request.finishDateIso
        }
    };

    const classificationNode = await witClient.createOrUpdateClassificationNode(
        classificationPayload as WorkItemClassificationNode,
        teamContext.projectId,
        TreeStructureGroup.Iterations,
        parentPath
    );

    if (!classificationNode.identifier) {
        throw new Error("The iteration node was created but did not return an identifier.");
    }

    const workClient = await getClient(WorkRestClient);
    const iterationToAdd: Partial<TeamSettingsIteration> = {
        id: classificationNode.identifier,
        name: classificationNode.name,
        path: classificationNode.path,
        attributes: {
            startDate: new Date(request.startDateIso),
            finishDate: new Date(request.finishDateIso),
            timeFrame: getTimeFrame(request.startDateIso, request.finishDateIso)
        }
    };

    const addedIteration = await workClient.postTeamIteration(iterationToAdd as TeamSettingsIteration, teamContext);
    return addedIteration;
}

export async function updateIterationDates(
    teamContext: TeamContext,
    iteration: TeamSettingsIteration,
    request: UpdateIterationDatesRequest
): Promise<TeamSettingsIteration> {
    if (!teamContext.projectId) {
        throw new Error("Project context is not available. Open this hub inside a project.");
    }

    if (!iteration.id) {
        throw new Error("Iteration identifier is missing.");
    }

    const classificationPath = getClassificationPath(iteration.path, teamContext.project);
    if (!classificationPath) {
        throw new Error("Iteration path is not available. Refresh and try again.");
    }

    const start = new Date(request.startDateIso).getTime();
    const finish = new Date(request.finishDateIso).getTime();

    if (isNaN(start) || isNaN(finish)) {
        throw new Error("Iteration dates are invalid.");
    }

    if (finish < start) {
        throw new Error("Finish date must be on or after the start date.");
    }

    const witClient = await getClient(WorkItemTrackingRestClient);
    const patchPayload: Partial<WorkItemClassificationNode> = {
        attributes: {
            startDate: request.startDateIso,
            finishDate: request.finishDateIso
        }
    };

    await witClient.updateClassificationNode(
        patchPayload as WorkItemClassificationNode,
        teamContext.projectId,
        TreeStructureGroup.Iterations,
        classificationPath
    );

    const workClient = await getClient(WorkRestClient);
    return workClient.getTeamIteration(teamContext, iteration.id);
}

function sortByStartDateThenName(a: TeamSettingsIteration, b: TeamSettingsIteration): number {
    const aStart = a.attributes?.startDate ? new Date(a.attributes.startDate).getTime() : 0;
    const bStart = b.attributes?.startDate ? new Date(b.attributes.startDate).getTime() : 0;

    if (aStart !== bStart) {
        return aStart - bStart;
    }

    return a.name.localeCompare(b.name);
}

function getTimeFrame(startIso: string, finishIso: string): TimeFrame {
    const today = Date.now();
    const start = new Date(startIso).getTime();
    const finish = new Date(finishIso).getTime();

    if (finish < today && start < today) {
        return TimeFrame.Past;
    }

    if (start <= today && finish >= today) {
        return TimeFrame.Current;
    }

    return TimeFrame.Future;
}

function getClassificationPath(fullPath?: string, projectName?: string): string | undefined {
    if (!fullPath) {
        return undefined;
    }

    if (!projectName) {
        return fullPath;
    }

    const normalizedProject = projectName.toLowerCase();
    const normalizedPath = fullPath.toLowerCase();

    if (normalizedPath.startsWith(`${normalizedProject}\\`)) {
        return fullPath.substring(projectName.length + 1);
    }

    return fullPath;
}
