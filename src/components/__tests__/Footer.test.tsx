
import { render, screen } from '@testing-library/react';
import { Footer } from '../Footer'; // Adjust the import path as necessary

describe('Footer', () => {
  it('renders without crashing', () => {
    render(<Footer />);
    // Check if one of the links in the footer is present
    expect(screen.getByText('Legal')).toBeInTheDocument();
  });
});
