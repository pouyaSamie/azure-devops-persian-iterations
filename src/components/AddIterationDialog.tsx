import * as React from "react";
import { Dialog } from "azure-devops-ui/Dialog";
import { MessageCard, MessageCardSeverity } from "azure-devops-ui/MessageCard";
import { TextField } from "azure-devops-ui/TextField";
import DatePicker, { DayValue } from "react-modern-calendar-datepicker";
import { jalaliDayToIso } from "../utils/dateUtils";

import "../IterationManagerHub.scss";

export interface AddIterationInput {
    name: string;
    startDateIso: string;
    finishDateIso: string;
    parentPath?: string;
}

interface AddIterationDialogProps {
    onDismiss: () => void;
    onSubmit: (input: AddIterationInput) => Promise<void>;
    isSubmitting: boolean;
    error?: string;
}

export const AddIterationDialog: React.FC<AddIterationDialogProps> = ({ onDismiss, onSubmit, isSubmitting, error }) => {
    const [name, setName] = React.useState<string>("");
    const [parentPath, setParentPath] = React.useState<string>("");
    const [startDate, setStartDate] = React.useState<DayValue>(null);
    const [finishDate, setFinishDate] = React.useState<DayValue>(null);
    const [validationError, setValidationError] = React.useState<string>();

    const handleSubmit = async () => {
        setValidationError(undefined);

        if (!name.trim() || !startDate || !finishDate) {
            setValidationError("Name, start date, and finish date are required.");
            return;
        }

        const startIso = jalaliDayToIso(startDate);
        const finishIso = jalaliDayToIso(finishDate);

        if (new Date(finishIso).getTime() < new Date(startIso).getTime()) {
            setValidationError("Finish date must be on or after the start date.");
            return;
        }

        await onSubmit({
            name: name.trim(),
            startDateIso: startIso,
            finishDateIso: finishIso,
            parentPath: parentPath.trim() || undefined
        });
    };

    const combinedError = validationError || error;
    const messageDismiss = validationError ? () => setValidationError(undefined) : undefined;

    return (
        <Dialog
            className="add-iteration-dialog"
            calloutContentClassName="iteration-dialog-callout"
            titleProps={{ text: "Add iteration" }}
            onDismiss={onDismiss}
            footerButtonProps={[
                { text: "Cancel", onClick: onDismiss, disabled: isSubmitting },
                { text: isSubmitting ? "Creating..." : "Create iteration", primary: true, onClick: handleSubmit, disabled: isSubmitting }
            ]}
            overlay={isSubmitting ? { spinnerLabel: "Creating iteration..." } : undefined}
            enterPrimary={true}
        >
            <div className="add-iteration-form">
                {combinedError && (
                    <MessageCard className="validation-message" severity={MessageCardSeverity.Error} onDismiss={messageDismiss}>
                        {combinedError}
                    </MessageCard>
                )}

                <TextField
                    label="Name"
                    value={name}
                    onChange={(event, value) => setName(value || "")}
                    placeholder="Iteration name"
                    ariaLabel="Iteration name"
                />

                <TextField
                    label="Parent path (optional)"
                    value={parentPath}
                    onChange={(event, value) => setParentPath(value || "")}
                    placeholder="Project\\Iteration Path"
                    ariaLabel="Parent path"
                />

                <div className="date-picker-row">
                    <div className="iteration-field">
                        <div className="date-picker-label">Start date (Jalali)</div>
                        <DatePicker
                            value={startDate}
                            onChange={setStartDate}
                            locale="fa"
                            inputPlaceholder="Select start date"
                            calendarPopperPosition="bottom"
                        />
                    </div>
                    <div className="iteration-field">
                        <div className="date-picker-label">Finish date (Jalali)</div>
                        <DatePicker
                            value={finishDate}
                            onChange={setFinishDate}
                            locale="fa"
                            inputPlaceholder="Select finish date"
                            calendarPopperPosition="bottom"
                        />
                    </div>
                </div>
            </div>
        </Dialog>
    );
};
