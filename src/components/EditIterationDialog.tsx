import * as React from "react";
import { TeamSettingsIteration } from "azure-devops-extension-api/Work";
import { Dialog } from "azure-devops-ui/Dialog";
import { MessageCard, MessageCardSeverity } from "azure-devops-ui/MessageCard";
import { ContentSize } from "azure-devops-ui/Callout";
import DatePicker, { DayValue } from "react-modern-calendar-datepicker";

import { formatJalaliDate, isoToJalaliDay, jalaliDayToIso } from "../utils/dateUtils";

import "../IterationManagerHub.scss";

export interface EditIterationInput {
    startDateIso: string;
    finishDateIso: string;
}

interface EditIterationDialogProps {
    iteration: TeamSettingsIteration;
    onDismiss: () => void;
    onSubmit: (input: EditIterationInput) => Promise<void>;
    isSubmitting: boolean;
    error?: string;
}

export const EditIterationDialog: React.FC<EditIterationDialogProps> = ({
    iteration,
    onDismiss,
    onSubmit,
        isSubmitting,
        error
}) => {
    const [startDate, setStartDate] = React.useState<DayValue>(isoToJalaliDay(iteration.attributes?.startDate));
    const [finishDate, setFinishDate] = React.useState<DayValue>(isoToJalaliDay(iteration.attributes?.finishDate));
    const [validationError, setValidationError] = React.useState<string>();

    React.useEffect(() => {
        setStartDate(isoToJalaliDay(iteration.attributes?.startDate));
        setFinishDate(isoToJalaliDay(iteration.attributes?.finishDate));
        setValidationError(undefined);
    }, [iteration]);

    const handleSubmit = async () => {
        setValidationError(undefined);

        if (!startDate || !finishDate) {
            setValidationError("Start date and finish date are required.");
            return;
        }

        const startIso = jalaliDayToIso(startDate);
        const finishIso = jalaliDayToIso(finishDate);

        if (new Date(finishIso).getTime() < new Date(startIso).getTime()) {
            setValidationError("Finish date must be on or after the start date.");
            return;
        }

        await onSubmit({
            startDateIso: startIso,
            finishDateIso: finishIso
        });
    };

    const combinedError = validationError || error;
    const messageDismiss = validationError ? () => setValidationError(undefined) : undefined;

    return (
        <Dialog
            className="add-iteration-dialog"
            calloutContentClassName="iteration-dialog-callout"
            contentSize={ContentSize.Large}
            titleProps={{ text: `Edit dates for "${iteration.name}"` }}
            onDismiss={onDismiss}
            footerButtonProps={[
                { text: "Cancel", onClick: onDismiss, disabled: isSubmitting },
                { text: isSubmitting ? "Saving..." : "Save dates", primary: true, onClick: handleSubmit, disabled: isSubmitting }
            ]}
            overlay={isSubmitting ? { spinnerLabel: "Saving iteration dates..." } : undefined}
            enterPrimary={true}
        >
            <div className="add-iteration-form">
                {combinedError && (
                    <MessageCard className="validation-message" severity={MessageCardSeverity.Error} onDismiss={messageDismiss}>
                        {combinedError}
                    </MessageCard>
                )}

                <div className="iteration-summary">
                    <div className="iteration-name" title={iteration.name}>
                        {iteration.name}
                    </div>
                    {iteration.path && (
                        <div className="iteration-path" title={iteration.path}>
                            {iteration.path}
                        </div>
                    )}
                    <div className="iteration-current-dates">
                        <span>Current:</span>{" "}
                        <strong>
                            {formatJalaliDate(iteration.attributes?.startDate)} - {formatJalaliDate(iteration.attributes?.finishDate)}
                        </strong>
                    </div>
                </div>

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
