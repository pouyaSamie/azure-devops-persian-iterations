import * as React from "react";
import { Button } from "azure-devops-ui/Button";
import { TeamSettingsIteration, TimeFrame } from "azure-devops-extension-api/Work";
import { formatJalaliDate } from "../utils/dateUtils";

import "../IterationManagerHub.scss";

export interface IterationTableProps {
    iterations: TeamSettingsIteration[];
    selectedIterationId?: string;
    onSelect: (iteration: TeamSettingsIteration) => void;
    onEdit: (iteration: TeamSettingsIteration) => void;
}

export const IterationTable: React.FC<IterationTableProps> = ({ iterations, selectedIterationId, onSelect, onEdit }) => {
    const hasIterations = iterations && iterations.length > 0;

    return (
        <div className="iteration-table">
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Path</th>
                        <th>Start date</th>
                        <th>Finish date</th>
                        <th>Timeframe</th>
                        <th className="actions">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {hasIterations ? (
                        iterations.map(iteration => {
                            const isSelected = iteration.id === selectedIterationId;
                            return (
                                <tr key={iteration.id} className={`iteration-table-row${isSelected ? " selected" : ""}`}>
                                    <td>{iteration.name}</td>
                                    <td>{iteration.path}</td>
                                    <td>{formatJalaliDate(iteration.attributes?.startDate)}</td>
                                    <td>{formatJalaliDate(iteration.attributes?.finishDate)}</td>
                                    <td>{formatTimeFrame(iteration.attributes?.timeFrame)}</td>
                                    <td className="actions">
                                        <Button
                                            text={isSelected ? "Selected" : "Select iteration"}
                                            primary={!isSelected}
                                            disabled={isSelected}
                                            onClick={() => onSelect(iteration)}
                                        />
                                        <Button
                                            text="Edit dates"
                                            iconProps={{ iconName: "Edit" }}
                                            onClick={() => onEdit(iteration)}
                                            subtle={true}
                                        />
                                    </td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan={6}>No iterations found for this team.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

function formatTimeFrame(timeFrame?: TimeFrame): string {
    switch (timeFrame) {
        case TimeFrame.Past:
            return "Past";
        case TimeFrame.Current:
            return "Current";
        case TimeFrame.Future:
            return "Future";
        default:
            return "Unknown";
    }
}
