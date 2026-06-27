
import { render, screen, fireEvent } from '@testing-library/react';
import CashflowCalculator from '../index';

// Mock dependencies
jest.mock('next-intl', () => ({
  useTranslations: () => (key: any) => key,
}));

jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockResolvedValue({ data: [], error: null }),
      insert: jest.fn().mockResolvedValue({ data: [], error: null }),
    })),
  },
}));

describe('CashflowCalculator', () => {
  it('should calculate the final balance correctly after locking initial balance', () => {
    render(<CashflowCalculator />);

    // 1. Find and set initial balance
    const initialBalanceInput = screen.getByDisplayValue('0'); // Find by default value
    fireEvent.change(initialBalanceInput, { target: { value: '1000' } });

    // 2. Lock the initial balance to reveal the entry form
    const lockBalanceButton = screen.getByText('config.lockBalance');
    fireEvent.click(lockBalanceButton);

    // 3. Now, fill the record entry form
    const entryNameInput = screen.getByPlaceholderText(/placeholders.name/i);
    fireEvent.change(entryNameInput, { target: { value: 'Gaji Bulan Ini' } });

    // Fill income (inOps)
    const inOpsInput = screen.getByLabelText('labels.inOps');
    fireEvent.change(inOpsInput, { target: { value: '500' } });

    // Fill expense (outOps)
    const outOpsInput = screen.getByLabelText('labels.outOps');
    fireEvent.change(outOpsInput, { target: { value: '200' } });

    // 4. Add the record
    const addRecordButton = screen.getByText('labels.recordData');
    fireEvent.click(addRecordButton);

    // 5. Verify the results in the table
    // Final Balance = Initial (1000) + Total In (500) - Total Out (200) = 1300
    const finalBalanceCell = screen.getByText(/1.300/i); // This should be unique enough
    expect(finalBalanceCell).toBeInTheDocument();

    // Also check other values for robustness
    const totalInCell = screen.getByText(/500/i);
    const totalOutCell = screen.getByText(/200/i);
    // Be more specific for net flow to distinguish it from the final balance
    const netFlowCell = screen.getByText(/\+Rp\s*300/i);

    expect(totalInCell).toBeInTheDocument();
    expect(totalOutCell).toBeInTheDocument();
    expect(netFlowCell).toBeInTheDocument();
  });
});
