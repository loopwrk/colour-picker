import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders the Tailwind smoke-test heading', () => {
    render(<App />);
    expect(
    screen.getByRole('button', { name: /flowbite \+ i18n alive/i })
)   .toBeInTheDocument();
  });
});