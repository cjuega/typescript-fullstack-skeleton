import { render, screen } from '@testing-library/angular';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
    it('should render Welcome', async () => {
        await render(AppComponent);
        await screen.getByText('Welcome');
    });
});
