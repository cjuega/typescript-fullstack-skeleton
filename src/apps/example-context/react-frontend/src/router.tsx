import { ExampleAggregateListFactory } from '@src/example-aggregate/sections/list/exampleAggregateListFactory';
import { Layout } from '@src/layout/sections/layout';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';

const router = createBrowserRouter([
    {
        path: '/',
        element: <Layout />,
        children: [
            {
                path: '/',
                element: <ExampleAggregateListFactory />
            }
        ]
    }
]);

export function Router() {
    return <RouterProvider router={router} />;
}
