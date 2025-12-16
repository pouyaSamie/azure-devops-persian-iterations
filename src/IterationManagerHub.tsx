import "./IterationManagerHub.scss";
import "react-modern-calendar-datepicker/lib/DatePicker.css";

import * as React from "react";
import * as SDK from "azure-devops-extension-sdk";
import { CoreRestClient, TeamContext } from "azure-devops-extension-api/Core";
import { TeamSettingsIteration } from "azure-devops-extension-api/Work";
import { Button } from "azure-devops-ui/Button";
import { Header, TitleSize } from "azure-devops-ui/Header";
import { MessageCard, MessageCardSeverity } from "azure-devops-ui/MessageCard";
import { Page } from "azure-devops-ui/Page";
import { Spinner, SpinnerSize } from "azure-devops-ui/Spinner";

import { showRootComponent } from "./Common";
import { AddIterationDialog, AddIterationInput } from "./components/AddIterationDialog";
import { EditIterationDialog, EditIterationInput } from "./components/EditIterationDialog";
import { IterationTable } from "./components/IterationTable";
import { createIterationAndAddToTeam, fetchTeamIterations, updateIterationDates } from "./services/IterationService";
import { getClient } from "azure-devops-extension-api";


interface IterationManagerHubState {
    teamContext?: TeamContext;
    iterations: TeamSettingsIteration[];
    selectedIterationId?: string;
    loading: boolean;
    pageError?: string;
    dialogError?: string;
    editDialogError?: string;
    infoMessage?: string;
    isDialogOpen: boolean;
    isSubmitting: boolean;
    isEditSubmitting: boolean;
    editingIteration?: TeamSettingsIteration;
}
// 🔹 SDK bootstrap — runs once

function getErrorMessage(error: unknown): string {
    if (!error) {
        return "An unexpected error occurred.";
    }

    if (error instanceof Error) {
        return error.message;
    }

    return `${error}`;
}


        SDK.init({ loaded: false });
        SDK.ready()
            .then(() => {
                showRootComponent(<IterationManagerHub />);
            })
            .catch(error => {
                SDK.notifyLoadFailed(getErrorMessage(error));
                // eslint-disable-next-line no-console
                console.error("Failed to initialize hub:", error);
            });



class IterationManagerHub extends React.Component<{}, IterationManagerHubState> {
    constructor(props: {}) {
        super(props);
        this.state = {
            iterations: [],
            loading: true,
            isDialogOpen: false,
            isSubmitting: false,
            isEditSubmitting: false
        };
    }
    private teamContextPromise?: Promise<TeamContext>;

    public componentDidMount() {
    this.initialize().catch(error => {
        this.setState({ pageError: getErrorMessage(error), loading: false });
    });
    }
    public render(): JSX.Element {
        const {
            dialogError,
            editDialogError,
            editingIteration,
            infoMessage,
            isDialogOpen,
            isSubmitting,
            isEditSubmitting,
            iterations,
            loading,
            pageError,
            selectedIterationId,
            teamContext
        } = this.state;

        return (
            <Page className="iteration-manager-page flex-grow">
                <Header
                    title="Iteration Manager"
                    titleSize={TitleSize.Large}
                    description="List team iterations, pick one, or add new iterations with Jalali dates."
                />

                <div className="iteration-manager-toolbar">
                    <Button
                        primary={true}
                        iconProps={{ iconName: "Add" }}
                        text="Add iteration"
                        onClick={() => {
                            this.setState({ dialogError: undefined, isDialogOpen: true });
                        }}
                    />
                    <Button
                        iconProps={{ iconName: "Refresh" }}
                        text="Refresh"
                        onClick={this.onRefresh}
                        disabled={loading}
                    />
                    {teamContext && (
                        <div aria-label="Team context">
                            <strong>Team:</strong> {teamContext.team || "Default"}
                        </div>
                    )}
                    {selectedIterationId && (
                        <div aria-label="Selected iteration">
                            <strong>Selected:</strong> {selectedIterationId}
                        </div>
                    )}
                </div>

                <div className="iteration-manager-messages">
                    {infoMessage && (
                        <MessageCard
                            className="info-message"
                            severity={MessageCardSeverity.Info}
                            onDismiss={() => this.setState({ infoMessage: undefined })}
                        >
                            {infoMessage}
                        </MessageCard>
                    )}
                    {pageError && (
                        <MessageCard
                            className="error-message"
                            severity={MessageCardSeverity.Error}
                            onDismiss={() => this.setState({ pageError: undefined })}
                        >
                            {pageError}
                        </MessageCard>
                    )}
                </div>

                {loading ? (
                    <Spinner size={SpinnerSize.large} label="Loading iterations..." />
                ) : (
                    <IterationTable
                        iterations={iterations}
                        selectedIterationId={selectedIterationId}
                        onSelect={this.onSelectIteration}
                        onEdit={this.onEditIteration}
                    />
                )}

                {isDialogOpen && (
                    <AddIterationDialog
                        onDismiss={() => this.setState({ isDialogOpen: false })}
                        onSubmit={this.onAddIteration}
                        isSubmitting={isSubmitting}
                        error={dialogError}
                    />
                )}

                {editingIteration && (
                    <EditIterationDialog
                        iteration={editingIteration}
                        onDismiss={this.onDismissEditDialog}
                        onSubmit={this.onUpdateIterationDates}
                        isSubmitting={isEditSubmitting}
                        error={editDialogError}
                    />
                )}
            </Page>
        );
    }

    private initialize = async (): Promise<void> => {
       // await this.ensureSdkReady();
        console.log("IterationManagerHub: initialize");
        this.setState({ loading: true, pageError: undefined });
        try {
            const context = await this.ensureTeamContext();
            const storedSelection = getStoredSelection(context);
            const fetchedIterations = await fetchTeamIterations(context);

            this.setState({
                teamContext: context,
                iterations: fetchedIterations,
                selectedIterationId: storedSelection ?? this.state.selectedIterationId
            });
            SDK.notifyLoadSucceeded();
        } catch (error) {
            this.setState({ pageError: getErrorMessage(error) });
            SDK.notifyLoadFailed(getErrorMessage(error));
        } finally {
            this.setState({ loading: false });
        }
    };

    private onSelectIteration = (iteration: TeamSettingsIteration): void => {
        this.setState({
            selectedIterationId: iteration.id,
            infoMessage: `Selected iteration "${iteration.name}".`,
            dialogError: undefined
        });

        const { teamContext } = this.state;
        if (teamContext) {
            persistSelection(teamContext, iteration.id);
        }
    };

    private onRefresh = async (): Promise<void> => {
        this.setState({ loading: true, pageError: undefined, infoMessage: undefined });
        try {
            const context = await this.ensureTeamContext();
            const refreshed = await fetchTeamIterations(context);
            this.setState({ iterations: refreshed });
        } catch (error) {
            this.setState({ pageError: getErrorMessage(error) });
        } finally {
            this.setState({ loading: false });
        }
    };

    private onAddIteration = async (input: AddIterationInput): Promise<void> => {
        this.setState({
            isSubmitting: true,
            dialogError: undefined,
            pageError: undefined,
            infoMessage: undefined
        });

        try {
            const context = await this.ensureTeamContext();
            const created = await createIterationAndAddToTeam(context, input);
            persistSelection(context, created.id);

            const refreshed = await fetchTeamIterations(context);
            this.setState({
                isDialogOpen: false,
                selectedIterationId: created.id,
                iterations: refreshed,
                infoMessage: `Created "${created.name}" and added it to the team.`
            });
        } catch (error) {
            this.setState({ dialogError: getErrorMessage(error) });
        } finally {
            this.setState({ isSubmitting: false });
        }
    };

    private onEditIteration = (iteration: TeamSettingsIteration): void => {
        this.setState({
            editingIteration: iteration,
            editDialogError: undefined
        });
    };

    private onDismissEditDialog = (): void => {
        this.setState({ editingIteration: undefined, editDialogError: undefined });
    };

    private onUpdateIterationDates = async (input: EditIterationInput): Promise<void> => {
        const { editingIteration } = this.state;
        if (!editingIteration) {
            return;
        }

        this.setState({
            isEditSubmitting: true,
            editDialogError: undefined,
            pageError: undefined,
            infoMessage: undefined
        });

        try {
            const context = await this.ensureTeamContext();
            const updated = await updateIterationDates(context, editingIteration, input);
            const refreshed = await fetchTeamIterations(context);

            this.setState({
                editingIteration: undefined,
                iterations: refreshed,
                selectedIterationId: this.state.selectedIterationId ?? updated.id,
                infoMessage: `Updated dates for "${updated.name}".`
            });
        } catch (error) {
            this.setState({ editDialogError: getErrorMessage(error) });
        } finally {
            this.setState({ isEditSubmitting: false });
        }
    };

private async ensureTeamContext(): Promise<TeamContext> {
    const existing = this.state.teamContext;
    if (existing) return existing;

    if (!this.teamContextPromise) {
        this.teamContextPromise = this.getTeamContextFromPage()
            .then(ctx => {
                this.setState({ teamContext: ctx });
                return ctx;
            })
            .finally(() => {
                this.teamContextPromise = undefined;
            });
    }

    return this.teamContextPromise;
}



private async getTeamContextFromPage(): Promise<TeamContext> {
    console.log("IterationManagerHub: getTeamContextFromPage");

    const wc = SDK.getPageContext()?.webContext;

    // Project must exist for your hub/service
    if (!wc?.project?.id || !wc?.project?.name) {
        throw new Error("Project context is not available. Open this hub inside a project.");
    }

    // If team exists, use it
    if (wc.team?.id && wc.team?.name) {
        return {
            project: wc.project.name,
            projectId: wc.project.id,
            team: wc.team.name,
            teamId: wc.team.id
        };
    }

    // Team missing: resolve via Core REST API (project-scoped teams)
    const core = getClient(CoreRestClient);
    const teams = await core.getTeams(wc.project.id);

    if (!teams?.length) {
        throw new Error(`No teams found for project "${wc.project.name}".`);
    }

    // Choose "default" team (usually same name as project) else fallback to first
    const defaultTeam =
        teams.find(t => (t.name ?? "").toLowerCase() === wc.project!.name.toLowerCase()) ?? teams[0];

    if (!defaultTeam?.id || !defaultTeam?.name) {
        throw new Error("Unable to resolve a team for this project.");
    }

    return {
        project: wc.project.name,
        projectId: wc.project.id,
        team: defaultTeam.name,
        teamId: defaultTeam.id
    };
}
}

function getStoredSelection(teamContext?: TeamContext): string | undefined {
    const key = getSelectionKey(teamContext);
    return key ? window.localStorage.getItem(key) ?? undefined : undefined;
}

function persistSelection(teamContext: TeamContext, iterationId: string): void {
    const key = getSelectionKey(teamContext);
    if (key) {
        window.localStorage.setItem(key, iterationId);
    }
}

function getSelectionKey(teamContext?: TeamContext): string | undefined {
    if (!teamContext?.projectId || !teamContext?.teamId) {
        return undefined;
    }

    return `iteration-manager:selected:${teamContext.projectId}:${teamContext.teamId}`;
}

// Export the component class for testing and direct rendering
export { IterationManagerHub };

export default IterationManagerHub;
