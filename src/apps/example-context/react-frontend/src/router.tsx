import { InMemoryExampleAggregateRepository } from '@src/example-aggregate/infrastructure/inMemoryExampleAggregateRepository';
import { ExampleAggregateList } from '@src/example-aggregate/sections/list/exampleAggregateList';
import { Layout } from '@src/layout/sections/layout';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';

const repository = new InMemoryExampleAggregateRepository();

const router = createBrowserRouter([
    {
        path: '/',
        element: <Layout />,
        children: [
            {
                path: '/',
                element: <ExampleAggregateList repository={repository} />
            }
        ]
    }
]);

export function Router() {
    return <RouterProvider router={router} />;
}
