import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders the Tailwind smoke-test heading', () => {
    render(<App />);
    expect(
      screen.getByRole('heading', { name: /tailwind is alive/i })
    ).toBeInTheDocument();
  });
});