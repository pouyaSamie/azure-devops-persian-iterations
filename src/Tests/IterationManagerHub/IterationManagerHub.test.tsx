import '@testing-library/jest-dom/extend-expect';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

// Mock the Azure DevOps SDK before importing the component
jest.mock('azure-devops-extension-sdk', () => ({
    init: jest.fn(),
    ready: jest.fn().mockResolvedValue(undefined),
    getPageContext: jest.fn().mockReturnValue({ webContext: { project: { id: 'proj', name: 'Proj' }, team: { id: 'team', name: 'Team' } } }),
    notifyLoadSucceeded: jest.fn(),
    notifyLoadFailed: jest.fn(),
    register: jest.fn(),
    getService: jest.fn()
}));

// Mock the service layer to return deterministic iterations
const sampleIterations = [
    {
        id: '1',
        name: 'Iteration One',
        path: 'Proj\\Iteration One',
        attributes: { startDate: new Date().toISOString(), finishDate: new Date().toISOString(), timeFrame: 1 }
    }
];

jest.mock('../../services/IterationService', () => ({
    fetchTeamIterations: jest.fn().mockResolvedValue(sampleIterations),
    createIterationAndAddToTeam: jest.fn().mockResolvedValue(sampleIterations[0]),
    updateIterationDates: jest.fn().mockResolvedValue(sampleIterations[0])
}));

// Import the component class directly (module no longer auto-renders under Jest)
import * as IMH from '../../IterationManagerHub';
const IterationManagerHub = (IMH as any).default || (IMH as any).IterationManagerHub;

describe.skip('IterationManagerHub (integration smoke)', () => {
    test.skip('renders hub and shows iterations', async () => {
        // Render the component into the test DOM
        render(<IterationManagerHub />);

        // Header should be present
        expect(screen.getByText(/Iteration Manager/i)).toBeDefined();

        // Wait for the iterations to load and appear in the table
        await waitFor(() => expect(screen.getByText('Iteration One')).toBeDefined());

        // Click Add iteration to open dialog
        const addBtn = screen.getByText(/Add iteration/i);
        fireEvent.click(addBtn);

        // Dialog title should show
        expect(await screen.findByText(/Add iteration/i)).toBeDefined();
    });
});
