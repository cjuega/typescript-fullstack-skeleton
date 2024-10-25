import { Outlet } from 'react-router-dom';

export function Layout() {
    return (
        <>
            <header>
                <h1>Application header</h1>
            </header>

            <Outlet />
        </>
    );
}
